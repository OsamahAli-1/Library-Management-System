import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<TData> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty()
  CurrentPage: number;

  @ApiProperty()
  TotalPages: number;

  results: TData[];
}
