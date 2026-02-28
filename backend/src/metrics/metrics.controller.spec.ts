import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  it('delegates JSON metrics to service', () => {
    const service: Pick<MetricsService, 'getMetricsJson' | 'getPrometheusText' | 'reset'> = {
      getMetricsJson: jest.fn().mockReturnValue({ ok: true }),
      getPrometheusText: jest.fn().mockReturnValue('x'),
      reset: jest.fn(),
    } as any;

    const controller = new MetricsController(service as MetricsService);
    expect(controller.getMetrics()).toEqual({ ok: true });
    expect(service.getMetricsJson).toHaveBeenCalled();
  });

  it('delegates prometheus text to service', () => {
    const service: Pick<MetricsService, 'getMetricsJson' | 'getPrometheusText' | 'reset'> = {
      getMetricsJson: jest.fn().mockReturnValue({}),
      getPrometheusText: jest.fn().mockReturnValue('prom'),
      reset: jest.fn(),
    } as any;

    const controller = new MetricsController(service as MetricsService);
    expect(controller.getPrometheusMetrics()).toBe('prom');
    expect(service.getPrometheusText).toHaveBeenCalled();
  });
});
