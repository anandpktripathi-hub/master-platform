import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

type AuthRequest = Request & {
  user?: {
    sub?: string;
    _id?: string;
  };
};

describe('ProjectsController', () => {
  let controller: ProjectsController;

  const projectsService = {
    getSummary: jest.fn().mockResolvedValue({
      activeProjects: 0,
      overdueTasks: 0,
      hoursLogged: 0,
    }),
    listProjects: jest.fn().mockResolvedValue([]),
    createProject: jest.fn().mockResolvedValue({ id: 'p1' }),
    updateProject: jest.fn().mockResolvedValue({ id: 'p1' }),
    listTasks: jest.fn().mockResolvedValue([]),
    createTask: jest.fn().mockResolvedValue({ id: 't1' }),
    updateTask: jest.fn().mockResolvedValue({ id: 't1' }),
    listTimesheets: jest.fn().mockResolvedValue([]),
    logTime: jest.fn().mockResolvedValue({ id: 'ts1' }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: projectsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(ProjectsController);
    jest.clearAllMocks();
  });

  it('rejects when tenantId missing (listProjects)', async () => {
    expect(() =>
      controller.listProjects(undefined as unknown as string),
    ).toThrow(BadRequestException);

    expect(projectsService.listProjects).not.toHaveBeenCalled();
  });

  it('forwards tenantId (summary)', async () => {
    await controller.getSummary('t1');
    expect(projectsService.getSummary).toHaveBeenCalledWith('t1');
  });

  it('logTime rejects when userId missing', async () => {
    expect(() =>
      controller.logTime('t1', { user: {} } as unknown as AuthRequest, {
        taskId: 'task1',
        projectId: 'proj1',
        hours: 1,
      }),
    ).toThrow(BadRequestException);

    expect(projectsService.logTime).not.toHaveBeenCalled();
  });

  it('logTime forwards tenantId + merged payload with userId', async () => {
    await controller.logTime(
      't1',
      { user: { sub: 'u1' } } as unknown as AuthRequest,
      { taskId: 'task1', projectId: 'proj1', hours: 2 },
    );

    expect(projectsService.logTime).toHaveBeenCalledWith('t1', {
      taskId: 'task1',
      projectId: 'proj1',
      hours: 2,
      userId: 'u1',
    });
  });

  it('createTask forwards tenantId + projectId + payload', async () => {
    await controller.createTask('t1', 'p1', { title: 'x' });

    expect(projectsService.createTask).toHaveBeenCalledWith('t1', 'p1', {
      title: 'x',
    });
  });
});
