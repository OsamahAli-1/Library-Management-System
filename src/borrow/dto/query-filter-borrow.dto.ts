import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { BorrowStatus } from '../constants';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFilterBorrowDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: BorrowStatus })
  @IsEnum(BorrowStatus)
  @IsOptional()
  status?: BorrowStatus;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  user_id?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  book_id?: number;
}
