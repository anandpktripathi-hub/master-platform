import { MetricsService } from './metrics.service';
import { MetricsMiddleware } from '../common/middleware/metrics.middleware';

describe('MetricsService', () => {
  it('returns JSON metrics payload', () => {
    jest.spyOn(MetricsMiddleware, 'getMetrics').mockReturnValue({
      totalRequests: 2,
      requestsByMethod: { GET: 2 },
      requestsByPath: { '/x': 2 },
      responsesByStatus: { '200': 2 },
      totalResponseTime: 30,
      maxResponseTime: 20,
      minResponseTime: 10,
    });

    const service = new MetricsService();
    const res = service.getMetricsJson();

    expect(res.requests.total).toBe(2);
    expect(res.responses.avgResponseTime).toBe(15);
    expect(res.responses.maxResponseTime).toBe(20);
    expect(res.responses.minResponseTime).toBe(10);
  });

  it('renders Prometheus text', () => {
    jest.spyOn(MetricsMiddleware, 'getMetrics').mockReturnValue({
      totalRequests: 1,
      requestsByMethod: { GET: 1 },
      requestsByPath: { '/x': 1 },
      responsesByStatus: { '500': 1 },
      totalResponseTime: 5,
      maxResponseTime: 5,
      minResponseTime: 5,
    });

    const service = new MetricsService();
    const text = service.getPrometheusText();

    expect(text).toContain('http_requests_total 1');
    expect(text).toContain('http_responses_total{status="500"} 1');
  });
});
