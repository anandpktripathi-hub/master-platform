import { BadRequestException } from '@nestjs/common';
import { AiServicesService } from './ai-services.service';

describe('AiServicesService', () => {
  let service: AiServicesService;

  beforeEach(() => {
    service = new AiServicesService();
  });

  it('rejects empty prompt', async () => {
    await expect(
      service.generateCompletion('t1', { prompt: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns simulated completion', async () => {
    const res = await service.generateCompletion('t1', {
      prompt: 'hello world',
      maxTokens: 25,
      temperature: 0.2,
    });

    expect(res.model).toContain('simulated');
    expect(res.text).toContain('AI-generated response');
    expect(res.usage.totalTokens).toBeGreaterThan(0);
  });

  it('rejects empty sentiment text', async () => {
    await expect(service.analyzeSentiment('t1', '')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects missing suggestion inputs', async () => {
    await expect(
      service.generateContentSuggestions('t1', '', 'blog'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
