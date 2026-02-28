import { AdminThemesController } from './admin-themes.controller';

describe('AdminThemesController', () => {
  let controller: AdminThemesController;

  const themesService = {
    createTheme: jest.fn().mockResolvedValue({ _id: 't1' }),
    getAllThemes: jest.fn().mockResolvedValue([]),
    getThemeById: jest.fn().mockResolvedValue({ _id: 't1' }),
    updateTheme: jest.fn().mockResolvedValue({ _id: 't1' }),
    activateTheme: jest.fn().mockResolvedValue({ _id: 't1' }),
    deactivateTheme: jest.fn().mockResolvedValue({ _id: 't1' }),
    deleteTheme: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    controller = new AdminThemesController(themesService as any);
    jest.clearAllMocks();
  });

  it('createTheme delegates to service', async () => {
    await controller.createTheme({ name: 'My Theme' } as any);
    expect(themesService.createTheme).toHaveBeenCalledWith({ name: 'My Theme' });
  });

  it('getAllThemes delegates with includeInactive=true', async () => {
    await controller.getAllThemes();
    expect(themesService.getAllThemes).toHaveBeenCalledWith(true);
  });
});
