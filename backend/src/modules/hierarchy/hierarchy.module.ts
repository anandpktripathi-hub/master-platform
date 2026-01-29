import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HierarchyNode, HierarchyNodeSchema } from './hierarchy.schema';
import { HierarchyService } from './hierarchy.service';
import { HierarchyController } from './hierarchy.controller';
import { RoleHierarchyAssignment, RoleHierarchyAssignmentSchema } from '@common-schemas/role-hierarchy.schema';
import { RoleHierarchyService } from './role-hierarchy.service';
import { RoleHierarchyController } from './role-hierarchy.controller';
import { DomainHierarchyAssignment, DomainHierarchyAssignmentSchema } from '@common-schemas/domain-hierarchy.schema';
import { DomainHierarchyService } from './domain-hierarchy.service';
import { DomainHierarchyController } from './domain-hierarchy.controller';
import { PackageHierarchyAssignment, PackageHierarchyAssignmentSchema } from '@common-schemas/package-hierarchy.schema';
import { PackageHierarchyService } from './package-hierarchy.service';
import { PackageHierarchyController } from './package-hierarchy.controller';
import { BillingHierarchyAssignment, BillingHierarchyAssignmentSchema } from '@common-schemas/billing-hierarchy.schema';
import { BillingHierarchyService } from './billing-hierarchy.service';
import { BillingHierarchyController } from './billing-hierarchy.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HierarchyNode.name, schema: HierarchyNodeSchema },
      { name: RoleHierarchyAssignment.name, schema: RoleHierarchyAssignmentSchema },
      { name: DomainHierarchyAssignment.name, schema: DomainHierarchyAssignmentSchema },
      { name: PackageHierarchyAssignment.name, schema: PackageHierarchyAssignmentSchema },
      { name: BillingHierarchyAssignment.name, schema: BillingHierarchyAssignmentSchema },
    ]),
  ],
  providers: [
    HierarchyService,
    RoleHierarchyService,
    DomainHierarchyService,
    PackageHierarchyService,
    BillingHierarchyService,
  ],
  controllers: [
    HierarchyController,
    RoleHierarchyController,
    DomainHierarchyController,
    PackageHierarchyController,
    BillingHierarchyController,
  ],
  exports: [
    HierarchyService,
    RoleHierarchyService,
    DomainHierarchyService,
    PackageHierarchyService,
    BillingHierarchyService,
  ],
})
export class HierarchyModule {}
