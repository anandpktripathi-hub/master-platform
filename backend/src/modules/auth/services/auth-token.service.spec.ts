import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AuthTokenService } from './auth-token.service';
import { AuthToken, TokenType } from '../schemas/auth-token.schema';

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  const authTokenModelMock = {
    updateMany: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        {
          provide: getModelToken(AuthToken.name),
          useValue: authTokenModelMock,
        },
      ],
    }).compile();

    service = module.get(AuthTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('createToken invalidates previous tokens and creates a new one', async () => {
    authTokenModelMock.updateMany.mockResolvedValue({});
    authTokenModelMock.create.mockResolvedValue({});

    const userId = new Types.ObjectId();

    const token = await service.createToken(userId, TokenType.EMAIL_VERIFICATION, 1);

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    expect(authTokenModelMock.updateMany).toHaveBeenCalledWith(
      {
        userId: new Types.ObjectId(userId),
        type: TokenType.EMAIL_VERIFICATION,
        used: false,
      },
      {
        used: true,
        usedAt: expect.any(Date),
      },
    );

    expect(authTokenModelMock.create).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      type: TokenType.EMAIL_VERIFICATION,
      token: expect.any(String),
      expiresAt: expect.any(Date),
      used: false,
    });
  });

  it('verifyAndConsumeToken returns not found when token missing', async () => {
    authTokenModelMock.findOne.mockResolvedValue(null);

    const res = await service.verifyAndConsumeToken(
      'missing',
      TokenType.PASSWORD_RESET,
    );

    expect(res).toEqual({ valid: false, reason: 'Token not found' });
  });

  it('verifyAndConsumeToken returns already used when token is used', async () => {
    authTokenModelMock.findOne.mockResolvedValue({
      used: true,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await service.verifyAndConsumeToken(
      't',
      TokenType.PASSWORD_RESET,
    );

    expect(res.valid).toBe(false);
    expect(res.reason).toBe('Token already used');
  });

  it('verifyAndConsumeToken returns expired when token is expired', async () => {
    authTokenModelMock.findOne.mockResolvedValue({
      used: false,
      expiresAt: new Date(Date.now() - 60_000),
    });

    const res = await service.verifyAndConsumeToken(
      't',
      TokenType.PASSWORD_RESET,
    );

    expect(res.valid).toBe(false);
    expect(res.reason).toBe('Token expired');
  });

  it('verifyAndConsumeToken consumes a valid token', async () => {
    const userId = new Types.ObjectId();

    const doc: any = {
      userId,
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
      save: jest.fn().mockResolvedValue(undefined),
    };

    authTokenModelMock.findOne.mockResolvedValue(doc);

    const res = await service.verifyAndConsumeToken(
      't',
      TokenType.PASSWORD_RESET,
    );

    expect(res.valid).toBe(true);
    expect(res.userId).toBe(userId);
    expect(doc.used).toBe(true);
    expect(doc.usedAt).toBeInstanceOf(Date);
    expect(doc.save).toHaveBeenCalledTimes(1);
  });

  it('cleanupOldTokens returns deleted count', async () => {
    authTokenModelMock.deleteMany.mockResolvedValue({ deletedCount: 3 });

    const deleted = await service.cleanupOldTokens();

    expect(deleted).toBe(3);
    expect(authTokenModelMock.deleteMany).toHaveBeenCalledWith({
      used: true,
      usedAt: { $lt: expect.any(Date) },
    });
  });
});
