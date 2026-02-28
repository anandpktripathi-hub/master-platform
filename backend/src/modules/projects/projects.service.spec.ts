import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { Project } from '../../database/schemas/project.schema';

describe('ProjectsService', () => {
  const createService = async () => {
    let capturedProjectUpdate: unknown;

    const projectModel = {
      find: jest.fn(),
      findOneAndUpdate: jest
        .fn()
        .mockImplementation((_filter: unknown, update: unknown) => {
          capturedProjectUpdate = update;
          return { exec: jest.fn().mockResolvedValue(null) };
        }),
      countDocuments: jest.fn(),
    };

    const taskModel = {
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    };

    const timesheetModel = {
      aggregate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getModelToken('Project'), useValue: projectModel },
        { provide: getModelToken('Task'), useValue: taskModel },
        { provide: getModelToken('TimesheetEntry'), useValue: timesheetModel },
      ],
    }).compile();

    return {
      service: moduleRef.get(ProjectsService),
      mocks: { projectModel, taskModel, timesheetModel },
      getCapturedProjectUpdate: () => capturedProjectUpdate,
    };
  };

  it('throws BadRequestException for invalid tenantId (listProjects)', async () => {
    const { service } = await createService();

    await expect(service.listProjects('undefined')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('sanitizes tenantId from updateProject payload', async () => {
    const { service, getCapturedProjectUpdate } = await createService();

    await service.updateProject(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      {
        name: 'New',
        tenantId: '507f1f77bcf86cd799439013',
      } as unknown as Partial<Project>,
    );

    const updateArg = getCapturedProjectUpdate() as Record<string, unknown>;
    const setArg = updateArg.$set as Record<string, unknown>;

    expect(setArg.name).toBe('New');
    expect(setArg.tenantId).toBeUndefined();
  });

  it('throws BadRequestException when logTime userId missing', async () => {
    const { service } = await createService();

    await expect(
      service.logTime('507f1f77bcf86cd799439011', {
        taskId: '507f1f77bcf86cd799439012',
        projectId: '507f1f77bcf86cd799439013',
        userId: '',
        hours: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
