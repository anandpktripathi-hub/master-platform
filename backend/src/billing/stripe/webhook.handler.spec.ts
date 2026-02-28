import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StripeWebhookHandler } from './webhook.handler';
import type { StripeService } from './stripe.service';
import type { IncomingWebhookEventsService } from '../../common/webhooks/incoming-webhook-events.service';
import type { Request } from 'express';

describe('StripeWebhookHandler', () => {
  const stripeServiceMock = {
    getWebhookSigningSecret: jest.fn(),
    constructWebhookEvent: jest.fn(),
    handleWebhook: jest.fn(),
  };

  const incomingEventsMock = {
    acquireProcessingSlot: jest.fn(),
    markProcessed: jest.fn(),
    markFailed: jest.fn(),
  };

  const makeReq = (
    overrides: Partial<Request> & { body?: unknown } = {},
  ): Request =>
    ({
      headers: {},
      body: Buffer.from(JSON.stringify({ hello: 'world' })),
      ...overrides,
    }) as unknown as Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws 400 when stripe-signature header is missing', async () => {
    const handler = new StripeWebhookHandler(
      stripeServiceMock as unknown as StripeService,
      incomingEventsMock as unknown as IncomingWebhookEventsService,
    );

    await expect(handler.handle(makeReq())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws 400 when raw body middleware is not applied', async () => {
    const handler = new StripeWebhookHandler(
      stripeServiceMock as unknown as StripeService,
      incomingEventsMock as unknown as IncomingWebhookEventsService,
    );

    await expect(
      handler.handle(
        makeReq({
          headers: { 'stripe-signature': 'sig' },
          body: { not: 'a-buffer' },
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 500 when signing secret is not configured', async () => {
    stripeServiceMock.getWebhookSigningSecret.mockResolvedValue('');

    const handler = new StripeWebhookHandler(
      stripeServiceMock as unknown as StripeService,
      incomingEventsMock as unknown as IncomingWebhookEventsService,
    );

    await expect(
      handler.handle(
        makeReq({
          headers: { 'stripe-signature': 'sig' },
        }),
      ),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('returns duplicate response when slot is not acquired', async () => {
    stripeServiceMock.getWebhookSigningSecret.mockResolvedValue('whsec_test');
    stripeServiceMock.constructWebhookEvent.mockReturnValue({
      id: 'evt_1',
      type: 'invoice.paid',
      account: 'acct_1',
    });
    incomingEventsMock.acquireProcessingSlot.mockResolvedValue({
      state: 'duplicate_processed',
    });

    const handler = new StripeWebhookHandler(
      stripeServiceMock as unknown as StripeService,
      incomingEventsMock as unknown as IncomingWebhookEventsService,
    );

    const res = await handler.handle(
      makeReq({ headers: { 'stripe-signature': 'sig' } }),
    );

    expect(res).toEqual({
      received: true,
      duplicate: true,
      state: 'duplicate_processed',
    });
    expect(stripeServiceMock.handleWebhook).not.toHaveBeenCalled();
  });

  it('processes webhook when slot is acquired', async () => {
    stripeServiceMock.getWebhookSigningSecret.mockResolvedValue('whsec_test');
    stripeServiceMock.constructWebhookEvent.mockReturnValue({
      id: 'evt_2',
      type: 'invoice.payment_succeeded',
    });
    incomingEventsMock.acquireProcessingSlot.mockResolvedValue({
      state: 'acquired',
      docId: 'doc_1',
    });
    stripeServiceMock.handleWebhook.mockResolvedValue(undefined);
    incomingEventsMock.markProcessed.mockResolvedValue(undefined);

    const handler = new StripeWebhookHandler(
      stripeServiceMock as unknown as StripeService,
      incomingEventsMock as unknown as IncomingWebhookEventsService,
    );

    const res = await handler.handle(
      makeReq({ headers: { 'stripe-signature': 'sig' } }),
    );

    expect(res).toEqual({ received: true });
    expect(stripeServiceMock.handleWebhook).toHaveBeenCalledTimes(1);
    expect(incomingEventsMock.markProcessed).toHaveBeenCalledWith('doc_1');
  });
});
