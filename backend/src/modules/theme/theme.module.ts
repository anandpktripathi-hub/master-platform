import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Theme, ThemeSchema } from '../../database/schemas/theme.schema';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { RolesGuard } from '../../guards/roles.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: Theme.name, schema: ThemeSchema }])],
  controllers: [ThemeController],
  providers: [ThemeService, RolesGuard],
  exports: [ThemeService], // Export ThemeService if other modules need it
})
export class ThemeModule {}
