import { HttpStatus, Request, Res, Response, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CurrentUser } from 'src/users/user.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { User, UserUpdateInput } from 'src/users/user.schema';
import {
  ChangePasswordInput,
  ForgetInput,
  ForgetInputCode,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  UpdatePasswordInput,
  verifyMessageInput,
} from './auth.input';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Query(() => User)
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input);
  }

  @Mutation(() => User)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register(input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async me(@CurrentUser() user) {
    return user;
  }

  @Query(() => String)
  async forgetPassword(@Args('input') input: ForgetInput) {
    await this.authService.forgetPassword(input);
    return 'Reset password code sent to email.';
  }

  @Query(() => String)
  async getForgetPasswordToken(@Args('input') input: ForgetInputCode) {
    return await this.authService.verifyForgetPassword(input);
  }

  @Mutation(() => User)
  async updatePassword(@Args('input') input: UpdatePasswordInput) {
    return await this.authService.verifyTokenUpdatePassword(input);
  }

  @Mutation(() => User)
  async refresTokens(@Args('input') input: RefreshTokenInput) {
    return await this.authService.refresTokens(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  async updateUser(@Args('input') input: UserUpdateInput, @CurrentUser() user) {
    return await this.authService.updateUser(input, user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => String)
  async sendVerificationMessage(@CurrentUser() user) {
    return await this.authService.sendVerificationMessage(user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => String)
  async verifyMessageCode(
    @Args('input') input: verifyMessageInput,
    @CurrentUser() user,
  ) {
    return await this.authService.verifyMessageCode(user, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user,
  ) {
    return await this.authService.changePassword(input, user);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => String)
  async authhello(@Request() req) {
    return 'hello from auth';
  }
}
