import { Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ID, InputType, Int, ObjectType } from 'type-graphql';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

@Schema({ timestamps: true })
@ObjectType()
export class Item {
  @Field(() => ID) //<- GraphQL
  id: number; //<- TypeScript

  @Prop({ required: true, unique: true })
  @Field()
  title: string;

  @Prop({ required: true })
  @Field(() => Int)
  price: number;

  @Prop({ required: true })
  @Field()
  description: string;
}

@InputType()
export class ItemInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => Int)
  @IsNumber()
  price: number;

  @Field()
  @IsString()
  description: string;
}

export type ItemDocument = Item & mongoose.Document;

export const ItemSchema = SchemaFactory.createForClass(Item);
