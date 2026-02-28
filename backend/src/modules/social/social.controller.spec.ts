import { BadRequestException } from '@nestjs/common';
import { SocialController } from './social.controller';

describe('SocialController', () => {
  let controller: SocialController;

  const socialService = {
    sendConnectionRequest: jest.fn().mockResolvedValue({ _id: 'c1' }),
    acceptConnectionRequest: jest.fn(),
    rejectConnectionRequest: jest.fn(),
    listPendingRequests: jest.fn(),
    listMyConnections: jest.fn(),
    createPost: jest.fn(),
    listFeedPosts: jest.fn(),
    toggleLike: jest.fn(),
    addComment: jest.fn(),
    listComments: jest.fn(),
  };

  beforeEach(() => {
    controller = new SocialController(socialService as any);
    jest.clearAllMocks();
  });

  it('sendRequest rejects when userId or tenantId missing', async () => {
    await expect(
      controller.sendRequest(
        { user: { sub: 'u1' } } as any,
        { recipientId: 'u2' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(socialService.sendConnectionRequest).not.toHaveBeenCalled();
  });

  it('sendRequest forwards expected args', async () => {
    await controller.sendRequest(
      { user: { sub: 'u1', tenantId: 't1' } } as any,
      { recipientId: 'u2' } as any,
    );
    expect(socialService.sendConnectionRequest).toHaveBeenCalledWith(
      'u1',
      'u2',
      't1',
    );
  });
});
