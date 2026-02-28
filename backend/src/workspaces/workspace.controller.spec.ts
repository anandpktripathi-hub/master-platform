import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

describe('WorkspaceController', () => {
  const createController = async (overrides?: {
    workspaceService?: Partial<WorkspaceService>;
  }) => {
    const workspaceService = {
      getWorkspacesForUser: jest.fn().mockResolvedValue([]),
      switchWorkspace: jest.fn().mockResolvedValue({ success: true }),
      ...(overrides?.workspaceService ?? {}),
    } as unknown as WorkspaceService;

    const moduleRef = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [{ provide: WorkspaceService, useValue: workspaceService }],
    }).compile();

    return {
      controller: moduleRef.get(WorkspaceController),
      mocks: { workspaceService },
    };
  };

  it('throws BadRequestException when userId is missing (listWorkspaces)', async () => {
    const { controller } = await createController();
    await expect(controller.listWorkspaces({} as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('delegates to WorkspaceService.getWorkspacesForUser', async () => {
    const { controller, mocks } = await createController();

    await controller.listWorkspaces({ user: { sub: 'u1' } } as any);

    expect(mocks.workspaceService.getWorkspacesForUser).toHaveBeenCalledWith(
      'u1',
    );
  });

  it('delegates to WorkspaceService.switchWorkspace', async () => {
    const { controller, mocks } = await createController();

    await controller.switchWorkspace(
      { user: { sub: 'u1' } } as any,
      { workspaceId: '507f1f77bcf86cd799439011' } as any,
    );

    expect(mocks.workspaceService.switchWorkspace).toHaveBeenCalledWith(
      'u1',
      '507f1f77bcf86cd799439011',
    );
  });
});
