import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationQueryDto {
  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({ default: 10 })
  @IsInt()
  @Min(1)
  pageSize: number;

  @ApiPropertyOptional({ default: 'id' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortDirection, default: SortDirection.ASC })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}
