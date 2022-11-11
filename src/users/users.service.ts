import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserInput, UserUpdateInput } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async create(createUserDto: UserInput) {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findAll() {
    return await this.userModel.find().exec();
  }

  async findOne(id: string) {
    return await this.userModel.findOne({ _id: id });
  }

  async findOneAndUpdate(id: string, body: object) {
    return await this.userModel.findOneAndUpdate({ _id: id }, body, {
      new: true,
    });
  }

  async findOneByEmail(email: string) {
    return await this.userModel
      .findOne({ email })
      .select('-password -passwordResetCode -passwordResetExpireAt')
      .exec();
  }

  async getCreds(email: string) {
    return await this.userModel
      .findOne({ email })
      .select('password email')
      .exec();
  }

  async delete(id: string) {
    return await this.userModel.findByIdAndRemove(id);
  }

  async update(id: string, user: UserUpdateInput) {
    return await this.userModel.findByIdAndUpdate(id, user, { new: true });
  }
}
