import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from '../../database/schemas/account.schema';
import {
  Transaction,
  TransactionSchema,
} from '../../database/schemas/transaction.schema';
import { Invoice, InvoiceSchema } from '../../database/schemas/invoice.schema';
import { Bill, BillSchema } from '../../database/schemas/bill.schema';
import { Goal, GoalSchema } from '../../database/schemas/goal.schema';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { RolesGuard } from '../../guards/roles.guard';
import { WorkspaceModule } from '../../workspaces/workspace.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Bill.name, schema: BillSchema },
      { name: Goal.name, schema: GoalSchema },
    ]),
    WorkspaceModule,
  ],
  controllers: [AccountingController],
  providers: [AccountingService, RolesGuard],
})
export class AccountingModule {}
