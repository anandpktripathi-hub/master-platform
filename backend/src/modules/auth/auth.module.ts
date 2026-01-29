import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import { AuthToken, AuthTokenSchema } from './schemas/auth-token.schema';
import { RefreshController } from './refresh.controller';
import { TotpService } from './services/totp.service';
import { AuthTokenService } from './services/auth-token.service';
import { SettingsModule } from '../settings/settings.module';
import { GoogleStrategy } from '../../auth/strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '60m' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: AuthToken.name, schema: AuthTokenSchema },
    ]),
    SettingsModule,
  ],
  controllers: [AuthController, RefreshController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    TotpService,
    AuthTokenService,
  ],
  exports: [AuthService, TotpService, AuthTokenService],
})
export class AuthModule {}
