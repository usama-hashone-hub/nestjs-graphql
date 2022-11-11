import {
  ObjectType,
  Field,
  Int,
  ID,
  InputType,
  PartialType,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { SchemaTypes, Types } from 'mongoose';
import {
  IsDateString,
  IsIn,
  IsNumberString,
  IsEmail,
  IsAlpha,
  IsOptional,
} from 'class-validator';

@Schema({ timestamps: true })
@ObjectType()
export class Category {
  @Field(() => ID) //<- GraphQL
  id: string; //<- TypeScript

  @Prop({ required: true, unique: true })
  @Field()
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Category.name,
  })
  @Field(() => Category, { nullable: true })
  parentcategory: string;
}

@InputType()
export class CreateCategoryInput {
  @Field()
  name: string;

  @Field(() => Category, { nullable: true })
  parentcategory: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID)
  id: string;

  @IsOptional()
  @Prop({ required: false })
  @Field({ nullable: true })
  name: string;

  @IsOptional()
  @Prop({ required: false })
  @Field(() => Category, { nullable: true })
  parentcategory: string;
}
export type CategoryDocument = Category & mongoose.Document;

export const CategorySchema = SchemaFactory.createForClass(Category);
