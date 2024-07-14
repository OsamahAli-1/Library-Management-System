import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ name: 'photo_url' })
  photoUrl: string;

  @Column()
  author: string;

  @Column({ name: 'published_date' })
  publishedDate: Date;

  @Column()
  isbn: string;

  @Column()
  summary: string;

  @Column({ name: 'available_copies', default: 1 })
  availableCopies: number;
}
