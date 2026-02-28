import { HierarchyController } from './hierarchy.controller';

describe('HierarchyController', () => {
  let controller: HierarchyController;

  const nodeId = '507f1f77bcf86cd799439011';

  const hierarchyService = {
    createNode: jest.fn().mockResolvedValue({ _id: 'n1' }),
    getNodeById: jest.fn().mockResolvedValue({ _id: 'n1' }),
    getChildren: jest.fn().mockResolvedValue([]),
    updateNode: jest.fn().mockResolvedValue({ _id: 'n1' }),
    deleteNode: jest.fn().mockResolvedValue(undefined),
    getTree: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    controller = new HierarchyController(hierarchyService as any);
    jest.clearAllMocks();
  });

  it('delete returns success after service deletion', async () => {
    const res = await controller.delete({ id: nodeId } as any);
    expect(hierarchyService.deleteNode).toHaveBeenCalledWith(nodeId);
    expect(res).toEqual({ success: true });
  });
});
