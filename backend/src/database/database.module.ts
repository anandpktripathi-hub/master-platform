import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.DATABASE_URL ||
          'mongodb://localhost:27017/master-platform',
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
