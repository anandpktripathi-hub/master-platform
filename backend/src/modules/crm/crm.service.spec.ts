import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrmService } from './crm.service';
import { CrmTask, CrmTaskDocument } from '../../database/schemas/crm-task.schema';
import { CrmNotificationService } from './crm-notification.service';
import { CalendarService } from '../../common/calendar/calendar.service';

describe('CrmService - calendar integration for tasks', () => {
  let service: CrmService;
  let taskModel: jest.Mocked<Model<CrmTaskDocument>>;
  let calendarService: jest.Mocked<CalendarService>;

  beforeEach(async () => {
    const mockTaskModel = {
      create: jest.fn(),
      updateOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
    } as any as jest.Mocked<Model<CrmTaskDocument>>;

    calendarService = {
      createEvent: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        { provide: getModelToken(CrmTask.name), useValue: mockTaskModel },
        { provide: CrmNotificationService, useValue: { notifyTaskAssigned: jest.fn(), notifyTaskCompleted: jest.fn() } },
        { provide: CalendarService, useValue: calendarService },
        // Unused models in this focused test
        { provide: getModelToken('CrmContact'), useValue: {} },
        { provide: getModelToken('CrmCompany'), useValue: {} },
        { provide: getModelToken('CrmDeal'), useValue: {} },
      ],
    }).compile();

    service = module.get(CrmService);
    taskModel = module.get(getModelToken(CrmTask.name));
  });

  it('creates a calendar event when creating a task with dueDate', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    const createdTask = {
      _id: new Types.ObjectId(),
      tenantId: new Types.ObjectId(tenantId),
      title: 'Follow up call',
      description: 'Discuss proposal',
      assigneeId: new Types.ObjectId(),
      dueDate: new Date(),
    } as any as CrmTaskDocument;

    (taskModel.create as jest.Mock).mockResolvedValue(createdTask);
    (taskModel.updateOne as jest.Mock).mockResolvedValue({});

    (calendarService.createEvent as jest.Mock).mockResolvedValue({ id: 'event-123' });

    await service.createTask(tenantId, {
      title: createdTask.title,
      description: createdTask.description,
      assigneeId: createdTask.assigneeId.toHexString(),
      dueDate: createdTask.dueDate
        ? createdTask.dueDate.toISOString()
        : new Date().toISOString(),
    });

    expect(calendarService.createEvent).toHaveBeenCalledTimes(1);
    expect(taskModel.updateOne).toHaveBeenCalledWith(
      { _id: createdTask._id },
      { $set: { calendarEventId: 'event-123' } },
    );
  });

  it('updates calendar event on task completion when calendarEventId exists', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();
    const taskId = new Types.ObjectId();

    const updatedTask = {
      _id: taskId,
      tenantId: new Types.ObjectId(tenantId),
      assigneeId: new Types.ObjectId(userId),
      title: 'Follow up call',
      description: 'Discuss proposal',
      completed: true,
      calendarEventId: 'event-123',
    } as any;

    (taskModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedTask);

    await service.setTaskCompleted(tenantId, userId, taskId.toHexString(), true);

    expect(calendarService.updateEvent).toHaveBeenCalledWith('event-123', {
      summary: updatedTask.title,
      description: updatedTask.description,
    });
  });

  it('deletes calendar event when deleting a task with calendarEventId', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();
    const taskId = new Types.ObjectId();

    const existingTask = {
      _id: taskId,
      tenantId: new Types.ObjectId(tenantId),
      assigneeId: new Types.ObjectId(userId),
      calendarEventId: 'event-123',
    } as any;

    (taskModel.findOne as jest.Mock).mockResolvedValue(existingTask);
    (taskModel.deleteOne as jest.Mock).mockResolvedValue({});

    await service.deleteTask(tenantId, userId, taskId.toHexString());

    expect(taskModel.deleteOne).toHaveBeenCalledWith({ _id: existingTask._id });
    expect(calendarService.deleteEvent).toHaveBeenCalledWith('event-123');
  });
});
