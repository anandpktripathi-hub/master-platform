import { HierarchyController } from './hierarchy.controller';

describe('HierarchyController', () => {
  let controller: HierarchyController;

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
    const res = await controller.delete('n1');
    expect(hierarchyService.deleteNode).toHaveBeenCalledWith('n1');
    expect(res).toEqual({ success: true });
  });
});
