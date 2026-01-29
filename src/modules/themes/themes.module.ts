import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Theme, ThemeSchema } from './schemas/theme.schema';
import { TenantTheme, TenantThemeSchema } from './schemas/tenant-theme.schema';
import { ThemesService } from './services/themes.service';
import { AdminThemesController } from './controllers/admin-themes.controller';
import { TenantThemesController } from './controllers/tenant-themes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Theme.name, schema: ThemeSchema },
      { name: TenantTheme.name, schema: TenantThemeSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [AdminThemesController, TenantThemesController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
