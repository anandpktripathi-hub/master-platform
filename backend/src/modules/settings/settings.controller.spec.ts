import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { EmailService } from './email.service';

describe('SettingsController', () => {
  let controller: SettingsController;

  const settingsServiceMock = {
    getGroupAdmin: jest.fn(),
    upsertGroup: jest.fn(),
  };

  const emailServiceMock = {
    sendTestEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: settingsServiceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    controller = module.get(SettingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getBasic maps group items into BasicSettingsDto', async () => {
    settingsServiceMock.getGroupAdmin.mockResolvedValue({
      items: {
        'basic.settings': {
          siteTitle: 'My Site',
          siteTagLine: 'Tag',
          footerCopyright: '©',
          siteLogo: 'logo.png',
          siteWhiteLogo: 'logo-white.png',
          siteFavicon: 'favicon.ico',
        },
      },
    });

    const res = await controller.getBasic();

    expect(settingsServiceMock.getGroupAdmin).toHaveBeenCalledWith('basic');
    expect(res).toEqual({
      siteTitle: 'My Site',
      siteTagLine: 'Tag',
      footerCopyright: '©',
      siteLogo: 'logo.png',
      siteWhiteLogo: 'logo-white.png',
      siteFavicon: 'favicon.ico',
    });
  });

  it('updateBasic upserts using expected group', async () => {
    settingsServiceMock.upsertGroup.mockResolvedValue({
      items: {
        'basic.settings': {
          siteTitle: 'My Site',
          siteTagLine: 'Tag',
          footerCopyright: '©',
          siteLogo: 'logo.png',
          siteWhiteLogo: 'logo-white.png',
          siteFavicon: 'favicon.ico',
        },
      },
    });

    const dto = {
      siteTitle: 'My Site',
      siteTagLine: 'Tag',
      footerCopyright: '©',
      siteLogo: 'logo.png',
      siteWhiteLogo: 'logo-white.png',
      siteFavicon: 'favicon.ico',
    };

    const res = await controller.updateBasic(dto as any);

    expect(settingsServiceMock.upsertGroup).toHaveBeenCalledWith(
      'basic',
      expect.arrayContaining([
        expect.objectContaining({
          key: 'basic.settings',
          scope: 'GLOBAL',
          value: dto,
        }),
      ]),
    );
    expect(res.siteTitle).toBe('My Site');
  });

  it('sendTestEmail triggers email service and returns success payload', async () => {
    emailServiceMock.sendTestEmail.mockResolvedValue(undefined);

    const res = await controller.sendTestEmail({
      testRecipient: 'test@example.com',
    });

    expect(emailServiceMock.sendTestEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
    expect(res).toEqual({
      success: true,
      message: 'Test email sent to test@example.com',
    });
  });

  it('getReportsPublic reads the reports settings group', async () => {
    settingsServiceMock.getGroupAdmin.mockResolvedValue({
      items: {
        'reports.settings': {
          defaultStartMonthOffset: 2,
          defaultStatusFilter: ['paid'],
        },
      },
    });

    const res = await controller.getReportsPublic();

    expect(settingsServiceMock.getGroupAdmin).toHaveBeenCalledWith('reports');
    expect(res).toEqual({
      defaultStartMonthOffset: 2,
      defaultStatusFilter: ['paid'],
    });
  });
});
