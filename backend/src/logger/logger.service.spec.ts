import { AppLoggerService } from './logger.service';

jest.mock('../config/logger.config', () => {
  const transports: any[] = [{ constructor: { name: 'Console' } }];
  return {
    __esModule: true,
    default: {
      level: 'info',
      transports,
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    },
  };
});

describe('AppLoggerService', () => {
  it('returns level and transports', () => {
    const service = new AppLoggerService();
    expect(service.getLevel()).toBe('info');
    expect(service.getTransports()).toEqual(['Console']);
  });

  it('writes a test log', () => {
    const service = new AppLoggerService();
    expect(() =>
      service.writeTestLog({ level: 'info', message: 'hello', context: 'ctx' }),
    ).not.toThrow();
  });
});
