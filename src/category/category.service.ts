import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CategoryDocument,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryInput: CreateCategoryInput) {
    return await this.categoryModel.create(createCategoryInput);
  }

  async findAll() {
    return await this.categoryModel.find().populate('parentcategory');
  }

  async findOne(id: string) {
    return await this.categoryModel.findById(id);
  }

  async update(id: string, updateCategoryInput: UpdateCategoryInput) {
    return await this.categoryModel.findByIdAndUpdate(id, updateCategoryInput, {
      new: true,
    });
  }

  async remove(id: string) {
    return await this.categoryModel.findByIdAndRemove(id);
  }
}
