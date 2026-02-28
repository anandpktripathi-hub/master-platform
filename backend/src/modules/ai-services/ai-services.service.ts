import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export interface AiCompletionRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiCompletionResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

type OpenAiChatCompletionResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: { role?: string; content?: string | null };
    text?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

type OpenAiChatCompletionRequest = {
  model: string;
  messages: Array<{ role: 'user' | 'system'; content: string }>;
  max_tokens: number;
  temperature: number;
};

/**
 * AI Services integration for OpenAI and similar providers.
 *
 * This service provides scaffolding for AI-powered features:
 * - Content generation (blog posts, product descriptions, emails)
 * - Copywriting assistance for marketing and CMS
 * - Support ticket sentiment analysis and auto-responses
 * - Analytics insights and natural-language reporting
 *
 * The implementation below calls an OpenAI-compatible provider at request
 * time. If the provider is not configured, it fails at call time rather than
 * breaking application startup.
 */
@Injectable()
export class AiServicesService {
  private getTimeoutMs(): number {
    const raw = process.env.AI_TIMEOUT_MS ?? process.env.OPENAI_TIMEOUT_MS;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30000;
  }

  private getMaxRetries(): number {
    const parsed = Number(process.env.AI_MAX_RETRIES ?? '2');
    return Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, 5) : 2;
  }

  private getMaxPromptChars(): number {
    const parsed = Number(process.env.AI_MAX_PROMPT_CHARS ?? '12000');
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 50000) : 12000;
  }

  private getMaxTokensCeiling(): number {
    const parsed = Number(process.env.AI_MAX_TOKENS ?? process.env.OPENAI_MAX_TOKENS ?? '800');
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 4096) : 800;
  }

  private getOpenAiConfig(): {
    apiKey?: string;
    baseUrl: string;
    model: string;
    timeoutMs: number;
  } {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrlRaw = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').trim();
    const baseUrl = (baseUrlRaw || 'https://api.openai.com/v1').replace(/\/$/, '');
    const modelRaw = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
    const model = modelRaw || 'gpt-4o-mini';

    return { apiKey, baseUrl, model, timeoutMs: this.getTimeoutMs() };
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;
    const status = error.response?.status;
    if (status === 429) return true;
    if (typeof status === 'number' && status >= 500) return true;
    // network errors / timeouts
    return !error.response;
  }

  private mapAiProviderError(error: unknown, operation: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        throw new ServiceUnavailableException('AI provider is not configured');
      }
      if (status === 429) {
        throw new ServiceUnavailableException('AI provider rate limited');
      }
      if (typeof status === 'number' && status >= 400 && status < 500) {
        throw new ServiceUnavailableException(`AI provider rejected the request during ${operation}`);
      }
      if (typeof status === 'number' && status >= 500) {
        throw new ServiceUnavailableException('AI provider unavailable');
      }

      const code = (error as AxiosError).code;
      if (code === 'ECONNABORTED') {
        throw new ServiceUnavailableException('AI provider timeout');
      }
      throw new ServiceUnavailableException('AI provider unavailable');
    }

    throw new ServiceUnavailableException('AI provider unavailable');
  }

  private async postOpenAiWithRetry<TResponse>(params: {
    url: string;
    apiKey: string;
    payload: unknown;
    timeoutMs: number;
  }): Promise<TResponse> {
    const maxRetries = this.getMaxRetries();
    let attempt = 0;
    while (true) {
      try {
        const res = await axios.post<TResponse>(params.url, params.payload, {
          timeout: params.timeoutMs,
          headers: {
            Authorization: `Bearer ${params.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        return res.data;
      } catch (error) {
        if (attempt >= maxRetries || !this.shouldRetry(error)) {
          throw error;
        }
        const baseDelay = 500 * Math.pow(2, attempt);
        const jitter = Math.floor(Math.random() * 200);
        await this.sleep(baseDelay + jitter);
        attempt += 1;
      }
    }
  }

  private async callOpenAiChatCompletion(params: {
    prompt: string;
    maxTokens: number;
    temperature: number;
  }): Promise<AiCompletionResponse> {
    const config = this.getOpenAiConfig();
    if (!config.apiKey) {
      throw new ServiceUnavailableException('AI provider is not configured');
    }

    const prompt = params.prompt?.toString() ?? '';
    if (!prompt.trim()) {
      throw new BadRequestException('Prompt is required');
    }

    if (prompt.length > this.getMaxPromptChars()) {
      throw new BadRequestException('Prompt too large');
    }

    const maxTokens = Math.min(
      Math.max(1, Math.floor(params.maxTokens || 1)),
      this.getMaxTokensCeiling(),
    );
    const temperature =
      typeof params.temperature === 'number' && Number.isFinite(params.temperature)
        ? Math.min(Math.max(params.temperature, 0), 2)
        : 0.7;

    try {
      const payload: OpenAiChatCompletionRequest = {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      };

      const data = await this.postOpenAiWithRetry<OpenAiChatCompletionResponse>({
        url: `${config.baseUrl}/chat/completions`,
        apiKey: config.apiKey,
        payload,
        timeoutMs: config.timeoutMs,
      });

      const model = data?.model || config.model;
      const choice0 = data?.choices?.[0];
      const text =
        (choice0?.message?.content ?? choice0?.text ?? '')?.toString() || '';
      const usage = data?.usage;

      if (!text.trim()) {
        throw new ServiceUnavailableException('AI provider returned empty output');
      }

      return {
        text,
        model,
        usage: {
          promptTokens: usage?.prompt_tokens ?? 0,
          completionTokens: usage?.completion_tokens ?? 0,
          totalTokens:
            usage?.total_tokens ??
            (usage?.prompt_tokens ?? 0) + (usage?.completion_tokens ?? 0),
        },
      };
    } catch (error) {
      this.mapAiProviderError(error, 'completion');
    }
  }

  /**
   * Generate text completion using AI (e.g., OpenAI GPT).
   *
   * In production, this method would:
   * 1. Retrieve the tenant's OpenAI API key from settings or env
   * 2. Call the OpenAI Chat Completions or Completions API
   * 3. Return the generated text and usage metrics
   *
   * For now, it validates the request and returns a placeholder
   * response so that the frontend and integration points can be
   * built and tested without requiring a live OpenAI key.
   */
  async generateCompletion(
    tenantId: string,
    request: AiCompletionRequest,
  ): Promise<AiCompletionResponse> {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new BadRequestException('Prompt is required');
    }

    // Default values are kept here for real integrations.
    const maxTokens = request.maxTokens || 500;
    const temperature = request.temperature ?? 0.7;

    // v1: always use a real provider. If not configured, fail at call time.
    return this.callOpenAiChatCompletion({
      prompt: request.prompt,
      maxTokens,
      temperature,
    });
  }

  /**
   * Analyze sentiment of text (e.g., for support tickets or reviews).
   *
   * In production, this could use OpenAI's moderation or custom
   * classification models to determine sentiment (positive/neutral/negative).
   */
  async analyzeSentiment(
    tenantId: string,
    text: string,
  ): Promise<{ sentiment: string; confidence: number }> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('Text is required');
    }

    const completion = await this.callOpenAiChatCompletion({
      prompt:
        'Classify the sentiment of the following text as exactly one of: positive, neutral, negative.\n\n' +
        `Text: "${text}"\n\n` +
        'Sentiment:',
      maxTokens: 10,
      temperature: 0,
    });

    const sentimentRaw = completion.text.trim().toLowerCase();
    const sentiment =
      sentimentRaw.includes('positive')
        ? 'positive'
        : sentimentRaw.includes('negative')
          ? 'negative'
          : 'neutral';

    return {
      sentiment,
      confidence: sentimentRaw === sentiment ? 0.9 : 0.6,
    };
  }

  /**
   * Generate content suggestions (e.g., blog post outline, product description).
   */
  async generateContentSuggestions(
    tenantId: string,
    topic: string,
    contentType: string,
  ): Promise<string[]> {
    if (!topic || !contentType) {
      throw new BadRequestException('Topic and content type are required');
    }

    const completion = await this.callOpenAiChatCompletion({
      prompt:
        `Generate 3 ${contentType} suggestions for the topic "${topic}". ` +
        'Return ONLY a valid JSON array of strings.',
      maxTokens: 250,
      temperature: 0.7,
    });

    const raw = completion.text.trim();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
        return parsed.slice(0, 3);
      }
    } catch {
      // fall through
    }

    // Fallback: split into lines/bullets
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-*\d.\s]+/, '').trim())
      .filter(Boolean);
    return lines.slice(0, 3);
  }
}
