import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VCard, VCardSchema } from '../../database/schemas/vcard.schema';
import { VcardsService } from './vcards.service';
import { VcardsController } from './vcards.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VCard.name, schema: VCardSchema }]),
  ],
  providers: [VcardsService],
  controllers: [VcardsController],
})
export class VcardsModule {}
