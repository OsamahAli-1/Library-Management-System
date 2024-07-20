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
  ApiOperation,
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
  @ApiOperation({ summary: 'Create a book (Admin)' })
  @ApiCreatedResponse({ type: Book })
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return await this.booksService.create(createBookDto);
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'get all books (Admin, User)' })
  @ApiPaginatedResponse(Book)
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedDto<Book>> {
    return await this.booksService.findAll(paginationQueryDto);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'get a book (Admin, User)' })
  @ApiOkResponse({ type: Book })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    const book = await this.booksService.findOne(id);
    return book;
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a book (Admin)' })
  @ApiOkResponse({ type: String })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<string> {
    return await this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a book (Admin)' })
  @ApiOkResponse({ type: String })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return await this.booksService.remove(id);
  }
}
