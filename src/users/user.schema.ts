import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ObjectType, InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsEmail } from 'class-validator';
import { IsOptional } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import moment from 'moment';

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => ID) //<- GraphQL
  id: string; //<- TypeScript

  @Prop({ required: true, unique: true }) //<- Mongoose
  @Field()
  email: string;

  @Prop()
  @Field({ nullable: true })
  avatar: string;

  @Prop({
    default: () => 'email',
    enum: ['email', 'facebook', 'google', 'phone'],
  })
  @Field({ nullable: true })
  accountType: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop()
  @Field({ nullable: true })
  gender: string;

  @Prop({ required: false, type: Date })
  @Field({ nullable: true })
  dob: Date;

  @Prop()
  @Field({ nullable: true })
  phone: string;

  @Prop()
  @Field()
  password: string;

  @Prop()
  confirmToken: string;

  @Prop({ required: true, default: false })
  active: boolean;

  @Prop({
    required: true,
    default: ['user'],
  })
  @Field(() => [String])
  roles: string[];

  @Prop()
  @Field({ nullable: true })
  country: string;

  @Prop()
  @Field({ nullable: true })
  postalCode: string;

  @Prop()
  @Field({ nullable: true })
  experience: string;

  @Prop()
  @Field({ nullable: true })
  investmentAmount: string;

  @Prop()
  @Field(() => [String], { nullable: true })
  investmentStyle: string[];

  @Prop()
  @Field(() => [String], { nullable: true })
  financialPlan: string[];

  @Prop()
  @Field({ nullable: true })
  returnExpection: string;

  @Prop()
  @Field({ nullable: true })
  contactNo: string;

  @Prop({ default: () => true })
  @Field()
  subscribedToNewsFeed: boolean;

  @Prop()
  passwordResetExpireAt: string;
  @Prop()
  passwordResetCode: string;

  @Field()
  token: string;
  @Field()
  refreshToken: string;
}

@InputType()
export class UserInput {
  @Field()
  name: string;
  @Field()
  email: string;
  @Field()
  password: string;

  @Prop({ required: true })
  @Field()
  contactNo: string;
}

@InputType()
export class UserUpdateInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  contactNo?: string;
}

export type UserDocument = User & mongoose.Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
