import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { HealthModule } from './modules/health/health.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { TenantsModule } from './modules/tenants/tenants.module'
import { UsersModule } from './modules/users/users.module'
import { ProductsModule } from './modules/products/products.module'
import { ThemeModule } from './modules/theme/theme.module'
import { AuthModule } from './modules/auth/auth.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URI as string),
    UsersModule,
    TenantsModule,
    ProductsModule,
    ThemeModule,
    AuthModule,
    DashboardModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
































