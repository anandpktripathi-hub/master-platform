import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  CreateCrmDealDto,
  CreateCrmTaskDto,
  SetCrmTaskCompletedDto,
} from './dto/crm.dto';

type AuthRequest = Request & {
  user?: {
    sub?: string;
    _id?: string;
  };
};

describe('CrmController', () => {
  let controller: CrmController;

  const crmService = {
    listContacts: jest.fn().mockResolvedValue([]),
    createContact: jest.fn().mockResolvedValue({ _id: 'c1' }),
    listCompanies: jest.fn().mockResolvedValue([]),
    createCompany: jest.fn().mockResolvedValue({ _id: 'co1' }),
    listDeals: jest.fn().mockResolvedValue([]),
    createDeal: jest.fn().mockResolvedValue({ _id: 'd1' }),
    updateDealStage: jest.fn().mockResolvedValue({ ok: true }),
    listMyTasks: jest.fn().mockResolvedValue([]),
    createTask: jest.fn().mockResolvedValue({ _id: 't1' }),
    setTaskCompleted: jest.fn().mockResolvedValue({ ok: true }),
    deleteTask: jest.fn().mockResolvedValue({ ok: true }),
    getAnalytics: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CrmController],
      providers: [{ provide: CrmService, useValue: crmService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(CrmController);
    jest.clearAllMocks();
  });

  it('getContacts rejects when tenantId missing', async () => {
    await expect(controller.getContacts('')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(crmService.listContacts).not.toHaveBeenCalled();
  });

  it('createDeal rejects when userId missing', async () => {
    const dto = Object.assign(new CreateCrmDealDto(), { title: 'Deal' });
    await expect(
      controller.createDeal({ user: {} } as unknown as AuthRequest, 't1', dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(crmService.createDeal).not.toHaveBeenCalled();
  });

  it('createDeal forwards ownerId from req.user', async () => {
    const dto = Object.assign(new CreateCrmDealDto(), { title: 'Deal' });

    await controller.createDeal(
      { user: { sub: 'u1' } } as unknown as AuthRequest,
      't1',
      dto,
    );

    expect(crmService.createDeal).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ title: 'Deal', ownerId: 'u1' }),
    );
  });

  it('getMyTasks rejects when tenant or user missing', async () => {
    await expect(
      controller.getMyTasks({ user: {} } as unknown as AuthRequest, 't1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.getMyTasks(
        { user: { sub: 'u1' } } as unknown as AuthRequest,
        '',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(crmService.listMyTasks).not.toHaveBeenCalled();
  });

  it('createTask defaults assigneeId to current user when missing', async () => {
    const dto = Object.assign(new CreateCrmTaskDto(), { title: 'Task' });

    await controller.createTask(
      { user: { sub: 'u1' } } as unknown as AuthRequest,
      't1',
      dto,
    );

    expect(crmService.createTask).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ title: 'Task', assigneeId: 'u1' }),
    );
  });

  it('setTaskCompleted forwards userId and completed flag', async () => {
    const dto = Object.assign(new SetCrmTaskCompletedDto(), {
      completed: true,
    });

    await controller.setTaskCompleted(
      { user: { _id: 'u1' } } as unknown as AuthRequest,
      't1',
      'task1',
      dto,
    );

    expect(crmService.setTaskCompleted).toHaveBeenCalledWith(
      't1',
      'u1',
      'task1',
      true,
    );
  });
});
