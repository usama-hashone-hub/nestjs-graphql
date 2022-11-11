import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Item, ItemInput } from './item.schema';

@Resolver(() => Item)
export class ItemResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Query(() => [Item])
  async items() {
    return this.itemsService.findAll();
  }

  @Mutation(() => Item)
  async createItem(@Args('input') input: ItemInput): Promise<Item> {
    return this.itemsService.create(input);
  }

  @Mutation(() => Item)
  async updateItem(@Args('id') id: string, @Args('input') input: ItemInput) {
    return this.itemsService.update(id, input);
  }

  @Mutation(() => Item)
  async deleteItem(@Args('id') id: string) {
    return this.itemsService.delete(id);
  }

  @Query(() => String)
  async hello() {
    return 'hello';
  }
}
