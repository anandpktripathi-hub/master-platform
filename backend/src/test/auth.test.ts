import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../modules/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user', async () => {
    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toBeDefined();
  });
});

















