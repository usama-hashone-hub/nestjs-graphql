import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.schema';
import { CategoryService } from './category.service';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Mutation(() => Category)
  async createCategory(@Args('input') input: CreateCategoryInput) {
    return this.categoryService.create(input);
  }

  @Query(() => [Category], { name: 'categories' })
  async findAll() {
    return this.categoryService.findAll();
  }

  @Query(() => Category, { name: 'category' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => Category)
  async updateCategory(@Args('input') input: UpdateCategoryInput) {
    return this.categoryService.update(input.id, input);
  }

  @Mutation(() => Category)
  async removeCategory(@Args('id', { type: () => ID }) id: string) {
    return this.categoryService.remove(id);
  }

  @Query(() => String)
  async helloCat() {
    return 'hello from cat';
  }
}
