// Script to import users from CSV and create/update them in the database using UsersService.bulkCreate
// Place this file in backend/scripts/import-users-from-csv.ts

import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';


async function main() {
  // Allow custom CSV path via command-line argument
  const csvArg = process.argv[2];
  const defaultCsv = path.resolve(__dirname, '../../Email ID Creation.csv');
  const csvPath = csvArg ? path.resolve(process.cwd(), csvArg) : defaultCsv;
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Map CSV fields to CreateUserDto
  const users: CreateUserDto[] = records.map((row: any) => {
    // Compose name from first, (middle), last
    const name = [row['First Name'], row['Last Name']].filter(Boolean).join(' ');
    return {
      name,
      email: row['Email'],
      password: row['Password'],
      company: row['Company'],
      // Optionally map role, isActive, tenantId, etc. if needed
    };
  });

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const result = await usersService.bulkCreate(users);
  console.log('Bulk user import result:', result);
  await app.close();
}

main().catch((err) => {
  console.error('Error importing users:', err);
  process.exit(1);
});
