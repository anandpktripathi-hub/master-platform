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
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { SupportService } from './support.service';
import {
  CreateTicketDto,
  TicketIdParamDto,
  UpdateTicketStatusDto,
} from './dto/support.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  private readonly logger = new Logger(SupportController.name);

  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Post('tickets')
  @ApiOperation({ summary: 'Create a support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTicket(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Body() body: CreateTicketDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!userId) throw new BadRequestException('User ID not found');
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.supportService.createTicket({
        userId: String(userId),
        tenantId,
        subject: body.subject,
        message: body.message,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createTicket] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create ticket');
    }
  }

  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @Get('tickets')
  @ApiOperation({ summary: 'List my support tickets' })
  @ApiResponse({ status: 200, description: 'Tickets returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async myTickets(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!userId) throw new BadRequestException('User ID not found');
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.supportService.listMyTickets(String(userId), tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[myTickets] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list tickets');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Get('admin/tickets')
  @ApiOperation({ summary: 'List all support tickets (admin)' })
  @ApiResponse({ status: 200, description: 'Tickets returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async allTickets() {
    try {
      return await this.supportService.listAllTickets();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[allTickets] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list all tickets');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Patch('admin/tickets/:id/status')
  @ApiOperation({ summary: 'Update support ticket status (admin)' })
  @ApiResponse({ status: 200, description: 'Ticket status updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateStatus(
    @Param() params: TicketIdParamDto,
    @Body() body: UpdateTicketStatusDto,
  ) {
    try {
      return await this.supportService.updateStatus(params.id, body.status);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateStatus] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update ticket status');
    }
  }
}

