import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, Length } from 'class-validator';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  photoUrl: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  publishedDate: Date;

  @ApiProperty()
  @IsString()
  @Length(10, 13)
  isbn: string;

  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  availableCopies: number;
}
