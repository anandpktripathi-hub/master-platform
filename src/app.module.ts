import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),  // 👈 this line ADD/KEEP inside 'imports', not after 'export'
    // add other modules, for example AuthModule here if needed later
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
