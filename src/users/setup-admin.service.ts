import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './constants';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SetupAdminService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.setupAdminUser();
  }

  private async setupAdminUser() {
    const createUserDto: CreateUserDto = {
      username: this.configService.get('ADMIN_USERNAME'),
      email: this.configService.get('ADMIN_EMAIL'),
      password: await bcrypt.hash(this.configService.get('ADMIN_PASSWORD'), 10),
      role: Role.ADMIN,
    };
    try {
      await this.usersService.create(createUserDto);
    } catch (error) {
      Logger.error('Admin user already exists');
    }
  }
}
