import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<TData> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;

  data: TData[];
}
