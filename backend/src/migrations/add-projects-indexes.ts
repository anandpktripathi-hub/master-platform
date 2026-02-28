import mongoose from 'mongoose';
import { ProjectSchema } from '../database/schemas/project.schema';
import { TaskSchema } from '../database/schemas/task.schema';
import { TimesheetEntrySchema } from '../database/schemas/timesheet.schema';

async function addProjectsIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Project = mongoose.model('Project', ProjectSchema);
  const Task = mongoose.model('Task', TaskSchema);
  const TimesheetEntry = mongoose.model('TimesheetEntry', TimesheetEntrySchema);

  // Keep migrations aligned with schema-defined indexes.
  await Project.collection.createIndex(
    { tenantId: 1, status: 1 },
    { name: 'tenantId_1_status_1' },
  );

  await Task.collection.createIndex(
    { tenantId: 1, projectId: 1, status: 1 },
    { name: 'tenantId_1_projectId_1_status_1' },
  );

  await TimesheetEntry.collection.createIndex(
    { tenantId: 1, projectId: 1, date: 1 },
    { name: 'tenantId_1_projectId_1_date_1' },
  );

  await mongoose.disconnect();
  console.log('Project/Task/TimesheetEntry indexes created/ensured.');
}

addProjectsIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
