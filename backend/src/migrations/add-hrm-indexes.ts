import mongoose from 'mongoose';
import { EmployeeSchema } from '../database/schemas/employee.schema';
import { AttendanceSchema } from '../database/schemas/attendance.schema';
import { LeaveRequestSchema } from '../database/schemas/leave-request.schema';
import { JobPostingSchema } from '../database/schemas/job-posting.schema';
import { TrainingSessionSchema } from '../database/schemas/training-session.schema';

async function addHrmIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Employee = mongoose.model('Employee', EmployeeSchema);
  const Attendance = mongoose.model('Attendance', AttendanceSchema);
  const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);
  const JobPosting = mongoose.model('JobPosting', JobPostingSchema);
  const TrainingSession = mongoose.model(
    'TrainingSession',
    TrainingSessionSchema,
  );

  await Employee.collection.createIndex(
    { tenantId: 1, email: 1 },
    { unique: true, name: 'tenantId_1_email_1' },
  );

  await Attendance.collection.createIndex(
    { tenantId: 1, employeeId: 1, date: 1 },
    { unique: true, name: 'tenantId_1_employeeId_1_date_1' },
  );

  await LeaveRequest.collection.createIndex(
    { tenantId: 1, employeeId: 1, startDate: 1, endDate: 1 },
    { name: 'tenantId_1_employeeId_1_startDate_1_endDate_1' },
  );

  await JobPosting.collection.createIndex(
    { tenantId: 1, status: 1 },
    { name: 'tenantId_1_status_1' },
  );

  await TrainingSession.collection.createIndex(
    { tenantId: 1, startDate: 1 },
    { name: 'tenantId_1_startDate_1' },
  );

  await mongoose.disconnect();
  console.log('HRM indexes created/ensured.');
}

addHrmIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
