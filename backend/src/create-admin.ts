import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { CreateUserDto } from './modules/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from './modules/users/role.types';

type CreateAdminDto = Pick<
  CreateUserDto,
  'email' | 'password' | 'name' | 'role'
>;

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = 'anand@gmail.com';
  const password = '123456';

  const hash = await bcrypt.hash(password, 10);

  try {
    const createDto: CreateAdminDto = {
      email,
      password: hash,
      name: 'Platform Admin',
      role: Role.PLATFORM_SUPER_ADMIN,
    };
    // Delete any existing user with this email first
    await usersService.deleteByEmail(email);
    const user = await usersService.create(createDto);
    console.log('Created platform admin user:', String(user.email));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error creating admin user:', message);
  }

  await app.close();
}

void bootstrap().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
