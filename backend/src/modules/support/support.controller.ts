import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { SupportService } from './support.service';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
    role?: string;
  };
}

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  async createTicket(
    @Req() req: AuthRequest,
    @Body() body: { subject?: string; message?: string },
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    if (!body.subject || !body.message) {
      throw new BadRequestException('Subject and message are required');
    }
    return this.supportService.createTicket({
      userId,
      tenantId: req.user?.tenantId,
      subject: body.subject,
      message: body.message,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  async myTickets(@Req() req: AuthRequest) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    return this.supportService.listMyTickets(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Get('admin/tickets')
  async allTickets() {
    return this.supportService.listAllTickets();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Patch('admin/tickets/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status?: 'open' | 'in_progress' | 'resolved' | 'closed' },
  ) {
    if (!body.status) throw new BadRequestException('Status is required');
    return this.supportService.updateStatus(id, body.status);
  }
}
