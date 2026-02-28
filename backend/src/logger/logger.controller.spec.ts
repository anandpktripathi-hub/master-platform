import { Test } from '@nestjs/testing';
import { LoggerController } from './logger.controller';
import { AppLoggerService } from './logger.service';

describe('LoggerController', () => {
  it('returns status payload', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LoggerController],
      providers: [
        {
          provide: AppLoggerService,
          useValue: {
            getLevel: jest.fn().mockReturnValue('info'),
            getTransports: jest.fn().mockReturnValue(['Console']),
            writeTestLog: jest.fn(),
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(LoggerController);
    expect(controller.getLoggerStatus()).toEqual({
      level: 'info',
      transports: ['Console'],
    });
  });
});
