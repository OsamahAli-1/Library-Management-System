import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import {
  PaginationQueryDto,
  SortDirection,
} from '../common/pagination/pagination-query.dto';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import { BorrowStatus } from '../borrow/constants';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private bookRepository: Repository<Book>,
  ) {}
  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return await this.bookRepository.save(book);
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedDto<Book>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      sortDirection = SortDirection.ASC,
    } = paginationQueryDto;
    const [data, totalCount] = await this.bookRepository.findAndCount({
      take: pageSize,
      skip: (page - 1) * pageSize,
      order: {
        [sortBy]: sortDirection.toLowerCase(),
      },
    });
    return {
      total: totalCount,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      data: data,
    };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with id = ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<string> {
    const book = await this.bookRepository.update(id, updateBookDto);
    if (book.affected === 0) {
      throw new NotFoundException(`Book with id = ${id} not found`);
    }
    return `Book with id = ${id} updated successfully`;
  }

  async remove(id: number): Promise<string> {
    const preventDeleteStatuses = [BorrowStatus.PENDING, BorrowStatus.APPROVED];
    const bookToDelete = await this.findOne(id);

    const hasPreventDeleteRequests = bookToDelete.borrows.some(
      (borrowRequest) => preventDeleteStatuses.includes(borrowRequest.status),
    );
    if (hasPreventDeleteRequests) {
      throw new ConflictException(
        'Cannot delete book with pending or approved borrow requests',
      );
    }

    const book = await this.bookRepository.delete(id);
    if (book.affected === 0) {
      throw new NotFoundException(`Book with id = ${id} not found`);
    }
    return `Book with id = ${id} deleted successfully`;
  }
}
