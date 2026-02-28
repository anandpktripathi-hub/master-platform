import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AiServicesController } from './ai-services.controller';
import { AiServicesService } from './ai-services.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('AiServicesController', () => {
  let controller: AiServicesController;

  const aiServices = {
    generateCompletion: jest.fn(),
    analyzeSentiment: jest.fn(),
    generateContentSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AiServicesController],
      providers: [{ provide: AiServicesService, useValue: aiServices }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AiServicesController);
    jest.clearAllMocks();
  });

  it('rejects completion when tenant missing', async () => {
    await expect(
      controller.generateCompletion(undefined, { prompt: 'hi' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('calls service for completion', async () => {
    aiServices.generateCompletion.mockResolvedValue({ ok: true });

    await controller.generateCompletion('t1', { prompt: 'hi', maxTokens: 10 });

    expect(aiServices.generateCompletion).toHaveBeenCalledWith('t1', {
      prompt: 'hi',
      maxTokens: 10,
    });
  });

  it('calls service for sentiment', async () => {
    aiServices.analyzeSentiment.mockResolvedValue({ sentiment: 'neutral' });

    await controller.analyzeSentiment('t1', { text: 'hello' });

    expect(aiServices.analyzeSentiment).toHaveBeenCalledWith('t1', 'hello');
  });

  it('calls service for suggestions', async () => {
    aiServices.generateContentSuggestions.mockResolvedValue(['a']);

    await controller.generateContentSuggestions('t1', {
      topic: 'SaaS',
      contentType: 'blog',
    });

    expect(aiServices.generateContentSuggestions).toHaveBeenCalledWith(
      't1',
      'SaaS',
      'blog',
    );
  });
});
