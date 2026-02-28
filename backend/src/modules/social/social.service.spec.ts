import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { SocialService } from './social.service';
import { UserConnection } from '../../database/schemas/user-connection.schema';
import { UserPost } from '../../database/schemas/user-post.schema';
import { PostComment } from '../../database/schemas/post-comment.schema';

describe('SocialService', () => {
  let service: SocialService;

  const connectionModelMock: any = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };
  const postModelMock: any = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  };
  const commentModelMock: any = {
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        { provide: getModelToken(UserConnection.name), useValue: connectionModelMock },
        { provide: getModelToken(UserPost.name), useValue: postModelMock },
        { provide: getModelToken(PostComment.name), useValue: commentModelMock },
      ],
    }).compile();

    service = module.get(SocialService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid ObjectIds early', async () => {
    await expect(
      service.sendConnectionRequest('bad', new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates connection request with ObjectIds', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const requesterId = new Types.ObjectId().toHexString();
    const recipientId = new Types.ObjectId().toHexString();

    connectionModelMock.findOne.mockResolvedValue(null);
    connectionModelMock.create.mockImplementation(async (doc: any) => doc);

    const res = await service.sendConnectionRequest(requesterId, recipientId, tenantId);

    expect(connectionModelMock.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: new Types.ObjectId(tenantId),
      }),
    );
    expect(res.requesterId).toBeInstanceOf(Types.ObjectId);
    expect(res.recipientId).toBeInstanceOf(Types.ObjectId);
    expect(res.tenantId).toBeInstanceOf(Types.ObjectId);
    expect(String(res.requesterId)).toBe(requesterId);
  });
});
