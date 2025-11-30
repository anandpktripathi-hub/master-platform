import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
    }),
    MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform',
      {
        retryAttempts: 3,
        retryDelay: 3000,
      },
    ),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    UploadModule,
    EmailModule,
    HealthModule,
  ],
})
export class AppModule {
  constructor() {
    console.log('🔍 DATABASE_URL from env:', process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL not found in environment variables!');
      console.warn('⚠️ Using fallback: mongodb://localhost:27017/master-platform');
    }
  }
}
