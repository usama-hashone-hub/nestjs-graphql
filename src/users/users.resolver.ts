import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User, UserInput } from './user.schema';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async users() {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: UserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  async updateUser(@Args('id') id: string, @Args('input') input: UserInput) {
    return this.usersService.update(id, input);
  }

  @Mutation(() => User)
  async deleteUser(@Args('id') id: string) {
    return this.usersService.delete(id);
  }

  @Query(() => String)
  async hello() {
    return 'hello';
  }
}
