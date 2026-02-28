import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger: Logger;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = configService.get<string>(
      'GITHUB_CALLBACK_URL',
      'http://localhost:4000/api/v1/auth/github/callback',
    );
    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL,
      scope: ['user:email'],
    });

    this.logger = new Logger(GithubStrategy.name);
    this.configService = configService;

    if (!clientID || !clientSecret) {
      // Do not crash the whole server if OAuth isn't configured.
      // The routes will fail if invoked, but local dev can still run.
      this.logger.warn(
        'GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET missing; GitHub OAuth is disabled until configured.',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ): Promise<any> {
    try {
      const { id, username, displayName, emails, photos } = profile;

      const user = {
        provider: 'github',
        providerId: id,
        email: emails?.[0]?.value || `${username}@github.local`,
        firstName: displayName?.split(' ')[0] || username,
        lastName: displayName?.split(' ')[1],
        displayName: displayName || username,
        picture: photos?.[0]?.value,
        accessToken,
      };

      this.logger.log(`GitHub OAuth user validated: ${user.email}`);
      done(null, user);
    } catch (err: any) {
      this.logger.error(
        `GitHub OAuth validation error: ${err.message}`,
        err.stack,
      );
      done(err, false);
    }
  }
}
