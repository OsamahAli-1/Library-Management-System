import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Users } from '../common/decorators/users.decorator';
import { Role } from '../users/constants';
import { User } from '../users/entities/user.entity';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { CreateBorrowResponseDto } from './dto/create-borrow-response.dto';
import { Borrow } from './entities/borrow.entity';
import { ApiPaginatedResponse } from '../common/pagination/paginated.decorator';
import { QueryFilterBorrowDto } from './dto/query-filter-borrow.dto';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BorrowService } from './borrow.service';

@Controller('books/borrow')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Borrow Books')
export class BorrowController {
  constructor(private readonly borrowAService: BorrowService) {}
  @Get('requests')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all borrow requests (Admin)' })
  @ApiPaginatedResponse(Borrow)
  async getAllBorrowRequests(
    @Query() queryFilterBorrowDto: QueryFilterBorrowDto,
  ): Promise<PaginatedDto<Borrow>> {
    return await this.borrowAService.findAll(queryFilterBorrowDto);
  }

  @Get('requests/:requestId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a borrow request (Admin)' })
  @ApiOkResponse({ type: Borrow })
  async getBorrowRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<Borrow> {
    return await this.borrowAService.findOne(requestId);
  }

  @Post(':bookId')
  @Roles(Role.USER)
  @HttpCode(202)
  @ApiOperation({ summary: 'Borrow a book (User)' })
  @ApiOkResponse({ type: CreateBorrowResponseDto })
  async borrow(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Users() user: User,
    @Body() createBorrowDto: CreateBorrowDto,
  ): Promise<CreateBorrowResponseDto> {
    return await this.borrowAService.borrow(
      user.id,
      bookId,
      createBorrowDto.numberOfDays,
    );
  }

  @Post('return/:requestId')
  @Roles(Role.USER)
  @HttpCode(200)
  @ApiOperation({ summary: 'Return a book (User)' })
  @ApiOkResponse({ type: String })
  async return(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Users() user: User,
  ): Promise<string> {
    return await this.borrowAService.return(requestId, user.id);
  }

  @Post('approve/:requestId')
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve a borrow request (Admin)' })
  @ApiOkResponse({ type: Borrow })
  async approve(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<Borrow> {
    return await this.borrowAService.approve(requestId);
  }

  @Post('reject/:requestId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reject a borrow request (Admin)' })
  @HttpCode(200)
  @ApiOkResponse({ type: Borrow })
  async reject(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<Borrow> {
    return await this.borrowAService.reject(requestId);
  }
}
