import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import {
  PublicUserProfile,
  PublicUserProfileSchema,
} from '../../database/schemas/public-user-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: PublicUserProfile.name, schema: PublicUserProfileSchema },
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
