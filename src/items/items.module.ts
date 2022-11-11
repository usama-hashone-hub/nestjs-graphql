import { Module } from '@nestjs/common';
import { ItemResolver } from './items.resolver';
import { ItemSchema } from './item.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsService } from './items.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Item', schema: ItemSchema }])],
  providers: [ItemResolver, ItemsService],
})
export class ItemsModule {}
