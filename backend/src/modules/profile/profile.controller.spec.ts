import { BadRequestException } from '@nestjs/common';
import { ProfileController } from './profile.controller';

describe('ProfileController', () => {
  let controller: ProfileController;

  const profileService = {
    getUserProfile: jest.fn().mockResolvedValue({}),
    updateUserProfile: jest.fn().mockResolvedValue({}),
    getTenantProfile: jest.fn().mockResolvedValue({}),
    updateTenantProfile: jest.fn().mockResolvedValue({}),
    getOrCreatePublicProfile: jest.fn().mockResolvedValue({}),
    updatePublicProfile: jest.fn().mockResolvedValue({}),
    isHandleAvailable: jest.fn().mockResolvedValue(true),
    getPublicProfileByHandle: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    controller = new ProfileController(profileService as any);
    jest.clearAllMocks();
  });

  it('getMyProfile rejects when userId missing', async () => {
    await expect(controller.getMyProfile({ user: {} } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(profileService.getUserProfile).not.toHaveBeenCalled();
  });

  it('getMyProfile forwards userId', async () => {
    await controller.getMyProfile({ user: { sub: 'u1' } } as any);
    expect(profileService.getUserProfile).toHaveBeenCalledWith('u1');
  });

  it('checkHandle rejects when missing handle', async () => {
    await expect(controller.checkHandle(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
