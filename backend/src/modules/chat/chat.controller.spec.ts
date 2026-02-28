import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('ChatController', () => {
  let controller: ChatController;

  const chatService = {
    listRooms: jest.fn(),
    createRoom: jest.fn(),
    listMessagesForUser: jest.fn(),
    postMessage: jest.fn(),
    joinRoom: jest.fn(),
    listMembers: jest.fn(),
    archiveRoom: jest.fn(),
    removeMember: jest.fn(),
    verifyAccessToken: jest.fn(),
    getTenantEventStream: jest.fn(),
    canUserSeeRoom: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: chatService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(ChatController);
    jest.clearAllMocks();
  });

  it('rejects listRooms when tenant missing', async () => {
    await expect(controller.listRooms(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('forbids creating private rooms for non-admin roles', async () => {
    const req = {
      user: { sub: 'u1', role: 'staff' },
    } as unknown as Parameters<ChatController['createRoom']>[0];

    await expect(
      controller.createRoom(req, '507f1f77bcf86cd799439011', {
        name: 'Secret',
        isPrivate: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates a room via service', async () => {
    chatService.createRoom.mockResolvedValue({ ok: true });

    const req = {
      user: { sub: '507f1f77bcf86cd799439012', role: 'tenant_admin' },
    } as unknown as Parameters<ChatController['createRoom']>[0];

    await controller.createRoom(req, '507f1f77bcf86cd799439011', {
      name: 'General',
      description: 'd',
      isPrivate: false,
    });

    expect(chatService.createRoom).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      {
        name: 'General',
        description: 'd',
        isPrivate: false,
      },
    );
  });
});
