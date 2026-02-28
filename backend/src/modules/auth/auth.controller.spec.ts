import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    login: jest.fn().mockResolvedValue({ ok: true }),
    registerSimple: jest.fn().mockResolvedValue({ ok: true }),
    registerTenant: jest.fn().mockResolvedValue({ ok: true }),
    sendVerificationEmail: jest.fn().mockResolvedValue({ ok: true }),
    verifyEmail: jest.fn().mockResolvedValue({ ok: true }),
    requestPasswordReset: jest.fn().mockResolvedValue({ ok: true }),
    resetPassword: jest.fn().mockResolvedValue({ ok: true }),
    handleOAuthLogin: jest.fn().mockResolvedValue('token-123'),
  };

  const originalFrontendUrl = process.env.FRONTEND_URL;

  beforeEach(async () => {
    process.env.FRONTEND_URL = 'http://frontend.local';

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleRef.get(AuthController);
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.FRONTEND_URL = originalFrontendUrl;
  });

  it('verifyEmailGet rejects when token missing', async () => {
    await expect(controller.verifyEmailGet('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(authService.verifyEmail).not.toHaveBeenCalled();
  });

  it('verifyEmailGet forwards token', async () => {
    await controller.verifyEmailGet('t1');
    expect(authService.verifyEmail).toHaveBeenCalledWith('t1');
  });

  it('login forwards dto', async () => {
    const dto = { email: 'a@b.com', password: 'pw' } as any;
    await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('sendVerificationEmail forwards email', async () => {
    await controller.sendVerificationEmail({ email: 'a@b.com' } as any);
    expect(authService.sendVerificationEmail).toHaveBeenCalledWith('a@b.com');
  });

  it('googleCallback redirects to frontend with token', async () => {
    const res = { redirect: jest.fn() } as unknown as Response;
    await controller.googleCallback({ user: { id: 'u1' } }, res);

    expect(authService.handleOAuthLogin).toHaveBeenCalledWith({ id: 'u1' });
    expect(res.redirect).toHaveBeenCalledWith(
      'http://frontend.local/login?token=token-123',
    );
  });
});
