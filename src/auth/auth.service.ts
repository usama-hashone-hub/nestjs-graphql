import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import * as moment from 'moment';

import { TwilioService } from 'nestjs-twilio';
import { CurrentUser } from 'src/users/user.decorator';
import { User, UserUpdateInput } from 'src/users/user.schema';
import {
  ChangePasswordInput,
  ForgetInput,
  LoginInput,
  RegisterInput,
} from './auth.input';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly twilioService: TwilioService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.getCreds(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return await this.usersService.findOneByEmail(email);
    }
    return null;
  }

  async login(LoginInput: LoginInput): Promise<User> {
    let user = await this.usersService.findOneByEmail(LoginInput.email);
    if (!user) {
      throw new HttpException('User Not found', HttpStatus.BAD_REQUEST);
    }
    user.token = await this.generateToken(user);
    user.refreshToken = await this.generateRefreshToken(user);

    return user;
  }

  async register(RegisterInput: RegisterInput): Promise<User> {
    const exsits = await this.usersService.getCreds(RegisterInput.email);
    if (exsits) {
      throw new HttpException('user already exsists', HttpStatus.BAD_REQUEST);
    }
    let user = await this.usersService.create(RegisterInput);
    user.token = await this.generateToken(user);
    user.refreshToken = await this.generateRefreshToken(user);

    return user;
  }

  async updateUser(UserUpdateInput: UserUpdateInput, @CurrentUser() user) {
    return await this.usersService.update(user.id, UserUpdateInput);
  }

  async forgetPassword(input: ForgetInput) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const user = await this.usersService.findOneByEmail(input.email);

    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    await this.mailService.forgetPasswordEmail(user, code);
    await this.usersService.findOneAndUpdate(user.id, {
      passwordResetCode: code,
      passwordResetExpireAt: moment().add(10, 'minutes').format(),
    });
  }

  async verifyForgetPassword(input) {
    const user = await this.usersService.findOneByEmail(input.email);

    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    const getCompleteUser = await this.usersService.findOne(user.id);

    if (getCompleteUser.passwordResetExpireAt < moment().format()) {
      throw new HttpException('Code is Expired', HttpStatus.BAD_REQUEST);
    }
    if (getCompleteUser.passwordResetCode != input.code) {
      throw new HttpException('Code is Worng', HttpStatus.BAD_REQUEST);
    }
    await this.usersService.findOneAndUpdate(getCompleteUser.id, {
      isEmailVerified: true,
    });

    return await this.generateForgetPasswordToken(getCompleteUser);
  }

  async verifyTokenUpdatePassword(input) {
    const verifyToken = await this.verifyForgetPasswordToken(input.token);

    const user = await this.usersService.findOneByEmail(verifyToken.email);

    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    await this.usersService.findOneAndUpdate(user.id, {
      password: await bcrypt.hash(input.password, 8),
    });

    user.token = await this.generateToken(user);
    user.refreshToken = await this.generateRefreshToken(user);

    return user;
  }

  async changePassword(input: ChangePasswordInput, u: User) {
    const user = await this.usersService.findOne(u.id);

    if (!(await bcrypt.compare(input.current, user.password))) {
      throw new HttpException('Your current password is wrong.', 401);
    }

    await this.usersService.findOneAndUpdate(u.id, {
      password: await bcrypt.hash(input.password, 8),
    });

    user.token = await this.generateToken(user);
    user.refreshToken = await this.generateRefreshToken(user);

    return user;
  }

  async sendVerificationMessage(user) {
    if (!user.contactNo) {
      throw new HttpException('Contact no not found', HttpStatus.NOT_FOUND);
    }

    await this.twilioService.client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({ to: user.contactNo, channel: 'sms' })
      .then(async (verification) => {
        console.log({ verification });
        // await userService.updateUserById(user.id, { phone: number });
      })
      .catch((err) => {
        throw new HttpException(err, err.status);
      });

    return 'Message sent successfully';
  }

  async verifyMessageCode(user, input) {
    let verificationResult = await this.twilioService.client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ code: input.code, to: user.contactNo })
      .catch((err) => {
        if (err.code == 20404) {
          throw new HttpException('Code is expired', err.status);
        } else {
          throw new HttpException(err, err.status);
        }
      });

    if (verificationResult.status === 'approved') {
      await this.usersService.findOneAndUpdate(user.id, {
        phoneVerified: true,
      });
    } else {
      throw new HttpException(
        `Code is wrong. status: ${verificationResult.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return 'Code verified successfully';
  }

  async refresTokens(input) {
    const verifyToken = await this.verifyRefreshToken(input.refreshToken);

    const user = await this.usersService.findOneByEmail(verifyToken.email);

    if (!user) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    user.token = await this.generateToken(user);
    user.refreshToken = await this.generateRefreshToken(user);

    return user;
  }

  generateToken = async (user) => {
    const payload = {
      email: user.email,
      sub: user._id,
    };
    let token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    return token;
  };

  generateRefreshToken = async (user) => {
    const payload = {
      email: user.email,
      sub: user._id,
    };
    let token = this.jwtService.sign(payload, {
      secret: 'thisistherefreshtokensecretfornestjsdemoapplication',
      expiresIn: '90days',
    });
    return token;
  };

  generateForgetPasswordToken = async (user) => {
    const payload = {
      email: user.email,
      sub: user._id,
    };
    let token = this.jwtService.sign(payload, {
      secret: 'thisisforgetpasswordtokensecret',
      expiresIn: '10m',
    });
    return token;
  };

  verifyForgetPasswordToken = async (token) => {
    return this.jwtService.verify(token, {
      secret: 'thisisforgetpasswordtokensecret',
    });
  };

  verifyRefreshToken = async (token) => {
    return this.jwtService.verify(token, {
      secret: 'thisistherefreshtokensecretfornestjsdemoapplication',
    });
  };
}
