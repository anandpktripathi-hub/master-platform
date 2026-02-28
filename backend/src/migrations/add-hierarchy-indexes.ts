import mongoose from 'mongoose';
import { HierarchyNodeSchema } from '../modules/hierarchy/hierarchy.schema';
import { RoleHierarchyAssignmentSchema } from '../common/schemas/role-hierarchy.schema';
import { DomainHierarchyAssignmentSchema } from '../common/schemas/domain-hierarchy.schema';
import { PackageHierarchyAssignmentSchema } from '../common/schemas/package-hierarchy.schema';
import { BillingHierarchyAssignmentSchema } from '../common/schemas/billing-hierarchy.schema';
import { UserHierarchyAssignmentSchema } from '../common/schemas/user-hierarchy.schema';

async function addHierarchyIndexes() {
  const uri =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URI ||
    'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const HierarchyNode = mongoose.model('HierarchyNode', HierarchyNodeSchema);
  const RoleHierarchyAssignment = mongoose.model(
    'RoleHierarchyAssignment',
    RoleHierarchyAssignmentSchema,
  );
  const DomainHierarchyAssignment = mongoose.model(
    'DomainHierarchyAssignment',
    DomainHierarchyAssignmentSchema,
  );
  const PackageHierarchyAssignment = mongoose.model(
    'PackageHierarchyAssignment',
    PackageHierarchyAssignmentSchema,
  );
  const BillingHierarchyAssignment = mongoose.model(
    'BillingHierarchyAssignment',
    BillingHierarchyAssignmentSchema,
  );
  const UserHierarchyAssignment = mongoose.model(
    'UserHierarchyAssignment',
    UserHierarchyAssignmentSchema,
  );

  await HierarchyNode.collection.createIndex(
    { parent: 1, type: 1 },
    { name: 'parent_type_idx' },
  );
  await HierarchyNode.collection.createIndex(
    { type: 1, isActive: 1, parent: 1 },
    { name: 'type_active_parent_idx' },
  );

  await RoleHierarchyAssignment.collection.createIndex(
    { roleName: 1 },
    { name: 'roleName_unique', unique: true },
  );
  await DomainHierarchyAssignment.collection.createIndex(
    { domainId: 1 },
    { name: 'domainId_unique', unique: true },
  );
  await PackageHierarchyAssignment.collection.createIndex(
    { packageId: 1 },
    { name: 'packageId_unique', unique: true },
  );
  await BillingHierarchyAssignment.collection.createIndex(
    { billingId: 1 },
    { name: 'billingId_unique', unique: true },
  );
  await UserHierarchyAssignment.collection.createIndex(
    { userId: 1 },
    { name: 'userId_unique', unique: true },
  );

  await mongoose.disconnect();
  console.log('Hierarchy indexes created.');
}

addHierarchyIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
