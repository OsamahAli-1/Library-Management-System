import { forwardRef, Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from './entities/borrow.entity';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';
import { BorrowController } from './borrow.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrow]),
    UsersModule,
    JwtModule,
    BooksModule,
  ],
  providers: [BorrowService],
  controllers: [BorrowController],
})
export class BorrowModule {}
