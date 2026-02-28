import { BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { verifyAccessToken: jest.fn() } as any,
    );
  });

  it('throws BadRequestException for invalid tenantId in listRooms', async () => {
    await expect(service.listRooms('not-an-objectid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws BadRequestException for invalid roomId in getRoomForTenant', async () => {
    await expect(
      service.getRoomForTenant('507f1f77bcf86cd799439011', 'bad'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for listMessages without user context', async () => {
    await expect(
      service.listMessages('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
