import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = configService.get<string>(
      'GITHUB_CALLBACK_URL',
      'http://localhost:4000/auth/github/callback',
    );
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
    if (!clientID || !clientSecret) {
      console.error('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in environment/config.');
      throw new Error('GitHub OAuth2Strategy requires both clientID and clientSecret. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your environment variables or config.');
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
      this.logger.error(`GitHub OAuth validation error: ${err.message}`, err.stack);
      done(err, false);
    }
  }
}
