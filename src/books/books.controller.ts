import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { ApiPaginatedResponse } from '../common/pagination/paginated.decorator';
import { Book } from './entities/book.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/constants';

@Controller('books')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: Book })
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return await this.booksService.create(createBookDto);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiPaginatedResponse(Book)
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedDto<Book>> {
    return await this.booksService.findAll(paginationQueryDto);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOkResponse({ type: Book })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    const book = await this.booksService.findOne(id);
    return book;
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: String })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<string> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: String })
  remove(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.booksService.remove(id);
  }
}
