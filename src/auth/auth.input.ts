import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field()
  readonly email: string;
  @Field()
  readonly password: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  readonly refreshToken: string;
}

@InputType()
export class RegisterInput {
  @Field()
  readonly name: string;
  @Field()
  readonly email: string;
  @Field()
  readonly password: string;
  @Field()
  readonly contactNo: string;
}

@InputType()
export class verifyMessageInput {
  @Field()
  readonly code: string;
}

@InputType()
export class ForgetInput {
  @Field()
  readonly email: string;
}

@InputType()
export class ForgetInputCode {
  @Field()
  readonly email: string;
  @Field()
  readonly code: string;
}

@InputType()
export class UpdatePasswordInput {
  @Field()
  readonly token: string;
  @Field()
  readonly password: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  readonly current: string;
  @Field()
  readonly password: string;
}
