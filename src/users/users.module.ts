import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SetupAdminService } from './setup-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, SetupAdminService],
  exports: [UsersService],
})
export class UsersModule {}
