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
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { ApiPaginatedResponse } from '../common/pagination/paginated.decorator';
import { Book } from './entities/book.entity';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedDto } from '../common/pagination/paginated.dto';

@Controller('books')
@ApiTags('Books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiCreatedResponse({ type: Book })
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return await this.booksService.create(createBookDto);
  }

  @Get()
  @ApiPaginatedResponse(Book)
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedDto<Book>> {
    return await this.booksService.findAll(paginationQueryDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: Book })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    const book = await this.booksService.findOne(id);
    return book;
  }

  @Put(':id')
  @ApiOkResponse({ type: String })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<string> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: String })
  remove(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.booksService.remove(id);
  }
}
