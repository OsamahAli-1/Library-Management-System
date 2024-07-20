import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../constants';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Borrow } from '../../borrow/entities/borrow.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  username: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @ApiProperty()
  @Column({ name: 'created_at', default: new Date() })
  createdAt: Date;

  @ApiProperty()
  @OneToMany(() => Borrow, (borrow) => borrow.user, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  borrows: Borrow[];
}
