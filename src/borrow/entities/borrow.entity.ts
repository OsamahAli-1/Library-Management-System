import { Book } from '../../books/entities/book.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BorrowStatus } from '../constants';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

@Entity()
export class Borrow {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'borrow_date' })
  borrowDate: Date;

  @ApiProperty()
  @Column({ name: 'return_date' })
  returnDate: Date;

  @ApiProperty()
  @Column({ type: 'enum', enum: BorrowStatus, default: BorrowStatus.PENDING })
  status: BorrowStatus;

  @ApiProperty()
  @Column()
  userId: number;

  @ApiProperty()
  @Column()
  bookId: number;

  @ManyToOne(() => User, (user) => user.borrows, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'userId' })
  user: User;

  @ManyToOne(() => Book, (book) => book.borrows, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'bookId' })
  book: Book;
}
