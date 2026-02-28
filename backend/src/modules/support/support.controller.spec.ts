import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CreateTicketDto, UpdateTicketStatusDto } from './dto/support.dto';

type AuthRequest = Request & {
  user?: {
    sub?: string;
    _id?: string;
  };
};

describe('SupportController', () => {
  let controller: SupportController;

  const supportService = {
    createTicket: jest.fn().mockResolvedValue({ id: 't1' }),
    listMyTickets: jest.fn().mockResolvedValue([]),
    listAllTickets: jest.fn().mockResolvedValue([]),
    updateStatus: jest.fn().mockResolvedValue({ id: 't1', status: 'resolved' }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [{ provide: SupportService, useValue: supportService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(SupportController);
    jest.clearAllMocks();
  });

  it('createTicket rejects when userId missing', async () => {
    const dto = Object.assign(new CreateTicketDto(), {
      subject: 'Help',
      message: 'Need assistance',
    });

    await expect(
      controller.createTicket({ user: {} } as unknown as AuthRequest, 't1', dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(supportService.createTicket).not.toHaveBeenCalled();
  });

  it('createTicket rejects when tenantId missing', async () => {
    const dto = Object.assign(new CreateTicketDto(), {
      subject: 'Help',
      message: 'Need assistance',
    });

    await expect(
      controller.createTicket(
        { user: { sub: 'u1' } } as unknown as AuthRequest,
        undefined,
        dto,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(supportService.createTicket).not.toHaveBeenCalled();
  });

  it('createTicket forwards userId + tenantId + payload', async () => {
    const dto = Object.assign(new CreateTicketDto(), {
      subject: 'Help',
      message: 'Need assistance',
    });

    await controller.createTicket(
      { user: { sub: 'u1' } } as unknown as AuthRequest,
      'tenant1',
      dto,
    );

    expect(supportService.createTicket).toHaveBeenCalledWith({
      userId: 'u1',
      tenantId: 'tenant1',
      subject: 'Help',
      message: 'Need assistance',
    });
  });

  it('myTickets forwards userId + tenantId', async () => {
    await controller.myTickets(
      { user: { _id: 'u1' } } as unknown as AuthRequest,
      'tenant1',
    );

    expect(supportService.listMyTickets).toHaveBeenCalledWith('u1', 'tenant1');
  });

  it('updateStatus forwards id + status', async () => {
    const dto = Object.assign(new UpdateTicketStatusDto(), { status: 'resolved' });

    await controller.updateStatus('t1', dto);

    expect(supportService.updateStatus).toHaveBeenCalledWith('t1', 'resolved');
  });
});
