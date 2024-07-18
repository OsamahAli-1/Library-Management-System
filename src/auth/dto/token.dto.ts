import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  expiry: number;
}
