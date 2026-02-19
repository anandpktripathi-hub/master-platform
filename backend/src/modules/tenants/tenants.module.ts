import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { DomainModule } from '../../tenants/domain/domain.module';
import { DatabaseModule } from '../../database/database.module';
import { SslModule } from '../../tenants/ssl/ssl.module';
import {
  BusinessReview,
  BusinessReviewSchema,
} from '../../database/schemas/business-review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: BusinessReview.name, schema: BusinessReviewSchema },
    ]),
    DomainModule,
    DatabaseModule,
    forwardRef(() => SslModule),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
