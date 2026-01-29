import { Controller, Get } from '@nestjs/common';

@Controller('cms/menu')
export class CmsMenuController {
  @Get()
  async getMenu() {
      // TODO: Replace with real DB logic
      return {
        menuItems: [
          { id: 1, name: 'Main Menu', items: ['Home', 'About', 'Contact'] },
          { id: 2, name: 'Footer Menu', items: ['Privacy', 'Terms'] },
        ],
      };
  }
}
