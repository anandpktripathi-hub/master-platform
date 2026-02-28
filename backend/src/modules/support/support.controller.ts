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
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { SupportService } from './support.service';
import { CreateTicketDto, UpdateTicketStatusDto } from './dto/support.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
    role?: string;
  };
}
@ApiTags('Support')
@ApiBearerAuth('bearer')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Post('tickets')
  async createTicket(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Body() body: CreateTicketDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.supportService.createTicket({
      userId: String(userId),
      tenantId,
      subject: body.subject,
      message: body.message,
    });
  }

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Get('tickets')
  async myTickets(@Req() req: AuthRequest, @Tenant() tenantId: string | undefined) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.supportService.listMyTickets(String(userId), tenantId);
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
    @Body() body: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateStatus(id, body.status);
  }
}

