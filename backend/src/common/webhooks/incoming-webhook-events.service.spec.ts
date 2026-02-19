import { IncomingWebhookEventsService } from './incoming-webhook-events.service';

function makeModelMock() {
  const exec = (value: any) => ({ exec: async () => value });
  const selectExec = (value: any) => ({
    select: jest.fn().mockReturnThis(),
    exec: async () => value,
  });

  return {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    __exec: exec,
    __selectExec: selectExec,
  };
}

describe('IncomingWebhookEventsService', () => {
  test('acquireProcessingSlot returns acquired when update succeeds', async () => {
    const model = makeModelMock();
    model.findOneAndUpdate.mockReturnValue(model.__exec({ _id: 'abc123' }));

    const svc = new IncomingWebhookEventsService(model as any);

    const res = await svc.acquireProcessingSlot({
      provider: 'stripe',
      eventId: 'evt_1',
      eventType: 'payment_intent.succeeded',
      payloadHash: 'hash',
    });

    expect(res.state).toBe('acquired');
    expect(res.docId).toBe('abc123');
  });

  test('acquireProcessingSlot returns duplicate_processed when existing is processed', async () => {
    const model = makeModelMock();
    const dupErr: any = new Error('dup');
    dupErr.code = 11000;

    model.findOneAndUpdate.mockImplementation(() => {
      throw dupErr;
    });

    model.findOne.mockReturnValue(
      model.__selectExec({ status: 'processed', processingLockUntil: undefined }),
    );

    const svc = new IncomingWebhookEventsService(model as any);

    const res = await svc.acquireProcessingSlot({
      provider: 'stripe',
      eventId: 'evt_1',
      eventType: 'payment_intent.succeeded',
      payloadHash: 'hash',
    });

    expect(res.state).toBe('duplicate_processed');
  });

  test('acquireProcessingSlot returns in_progress when existing is not processed', async () => {
    const model = makeModelMock();
    model.findOneAndUpdate.mockReturnValue(model.__exec(null));
    model.findOne.mockReturnValue(
      model.__selectExec({ status: 'received', processingLockUntil: new Date() }),
    );

    const svc = new IncomingWebhookEventsService(model as any);

    const res = await svc.acquireProcessingSlot({
      provider: 'stripe',
      eventId: 'evt_1',
      eventType: 'payment_intent.succeeded',
      payloadHash: 'hash',
    });

    expect(res.state).toBe('in_progress');
  });

  test('markProcessed updates status and clears lock', async () => {
    const model = makeModelMock();
    model.updateOne.mockReturnValue(model.__exec({ acknowledged: true }));

    const svc = new IncomingWebhookEventsService(model as any);
    await svc.markProcessed('doc1');

    expect(model.updateOne).toHaveBeenCalled();
    const update = model.updateOne.mock.calls[0][1];
    expect(update.$set.status).toBe('processed');
  });

  test('markFailed updates status and stores error', async () => {
    const model = makeModelMock();
    model.updateOne.mockReturnValue(model.__exec({ acknowledged: true }));

    const svc = new IncomingWebhookEventsService(model as any);
    await svc.markFailed('doc1', new Error('boom'));

    const update = model.updateOne.mock.calls[0][1];
    expect(update.$set.status).toBe('failed');
    expect(update.$set.lastError.message).toBe('boom');
  });
});
