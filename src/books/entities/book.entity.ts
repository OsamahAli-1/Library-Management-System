import { ApiProperty } from '@nestjs/swagger';
import { Borrow } from '../../borrow/entities/borrow.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column({ name: 'photo_url' })
  photoUrl: string;

  @ApiProperty()
  @Column()
  author: string;

  @ApiProperty()
  @Column({ name: 'published_date' })
  publishedDate: Date;

  @ApiProperty()
  @Column()
  isbn: string;

  @ApiProperty()
  @Column()
  summary: string;

  @ApiProperty({ default: 1 })
  @Column({ name: 'available_copies', default: 1 })
  availableCopies: number;

  @ApiProperty()
  @OneToMany(() => Borrow, (borrow) => borrow.book, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  borrows: Borrow[];
}
