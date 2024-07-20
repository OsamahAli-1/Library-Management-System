import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateBorrowDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  numberOfDays: number;
}
