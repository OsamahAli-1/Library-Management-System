import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Borrow } from './entities/borrow.entity';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';
import { QueryFilterBorrowDto } from './dto/query-filter-borrow.dto';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import { SortDirection } from '../common/pagination/pagination-query.dto';
import { BorrowStatus } from './constants';
import { CreateBorrowResponseDto } from './dto/create-borrow-response.dto';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow) private borrowRepository: Repository<Borrow>,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
  ) {}

  async borrow(
    userId: number,
    bookId: number,
    numberOfDays: number,
  ): Promise<CreateBorrowResponseDto> {
    const borrowRequestsPendingWithSameBook =
      await this.borrowRepository.findOne({
        where: {
          userId,
          bookId,
          status: In([BorrowStatus.PENDING, BorrowStatus.APPROVED]),
        },
      });

    if (borrowRequestsPendingWithSameBook) {
      throw new BadRequestException(
        'User already has a pending or approved borrow request for this book',
      );
    }

    const currentDate = new Date();
    const returnDate = new Date().setDate(currentDate.getDate() + numberOfDays);

    let user = null;
    let book = null;
    try {
      user = await this.usersService.findOne({
        id: userId,
      });
      book = await this.booksService.findOne(bookId);
    } catch (error) {
      Logger.error(error);
    }

    if (!user || !book) {
      throw new NotFoundException('User or book not found');
    }

    if (book.availableCopies === 0) {
      throw new NotFoundException('Book out of stock');
    }

    const borrow = this.borrowRepository.create({
      borrowDate: currentDate,
      returnDate: new Date(returnDate),
      user: user,
      book: book,
      status: BorrowStatus.PENDING,
    });
    await this.borrowRepository.save(borrow);

    await this.booksService.update(bookId, {
      availableCopies: book.availableCopies - 1,
    });

    return { requestId: borrow.id };
  }

  async findAll(
    queryFilterBorrowDto: QueryFilterBorrowDto,
  ): Promise<PaginatedDto<Borrow>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      sortDirection = SortDirection.ASC,
      status,
      user_id,
      book_id,
    } = queryFilterBorrowDto;

    const queryBuilder = this.borrowRepository.createQueryBuilder('borrow');

    if (status) {
      queryBuilder.andWhere('borrow.status = :status', { status });
    }

    if (user_id) {
      queryBuilder.andWhere('borrow.userId = :user_id', { user_id });
    }

    if (book_id) {
      queryBuilder.andWhere('borrow.bookId = :book_id', { book_id });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy(`borrow.${sortBy}`, sortDirection);

    const [data, totalCount] = await queryBuilder.getManyAndCount();

    return {
      total: totalCount,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      data: data,
    };
  }

  async findOne(id: number): Promise<Borrow> {
    const borrow = await this.borrowRepository.findOne({ where: { id } });
    if (!borrow) {
      throw new NotFoundException(`Borrow with id = ${id} not found`);
    }
    return borrow;
  }

  async approve(id: number): Promise<Borrow> {
    return await this.updateBorrowStatus(id, BorrowStatus.APPROVED);
  }

  async reject(id: number): Promise<Borrow> {
    return await this.updateBorrowStatus(id, BorrowStatus.REJECTED, true);
  }

  async return(id: number, user_id: number): Promise<string> {
    const borrow = await this.findOne(id);
    if (borrow.userId !== user_id) {
      throw new NotFoundException(
        `Borrow not found for user with id = ${user_id}`,
      );
    }
    await this.updateBorrowStatus(id, BorrowStatus.RETURNED, true);
    return `Book with borrow id = ${id} returned successfully`;
  }

  private async updateBorrowStatus(
    id: number,
    newStatus: BorrowStatus,
    incrementCopies: boolean = false,
  ): Promise<Borrow> {
    const borrow = await this.findOne(id);
    let validStatus: BorrowStatus;

    switch (newStatus) {
      case BorrowStatus.APPROVED:
        validStatus = BorrowStatus.PENDING;
        break;
      case BorrowStatus.REJECTED:
        validStatus = BorrowStatus.PENDING;
        break;
      case BorrowStatus.RETURNED:
        validStatus = BorrowStatus.APPROVED;
        break;
      default:
        throw new BadRequestException('Invalid status transition');
    }

    if (borrow.status !== validStatus) {
      throw new BadRequestException(
        `Borrow request not in the correct status for this operation`,
      );
    }

    const updated = await this.borrowRepository.update(id, {
      status: newStatus,
    });

    if (updated.affected === 0) {
      throw new NotFoundException(`Borrow with id = ${id} not found`);
    }

    if (incrementCopies) {
      const book = await this.booksService.findOne(borrow.bookId);
      await this.booksService.update(book.id, {
        availableCopies: book.availableCopies + 1,
      });
    }

    return await this.findOne(id);
  }
}
