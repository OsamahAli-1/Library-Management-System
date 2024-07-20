import { Test, TestingModule } from '@nestjs/testing';
import { BorrowService } from './borrow.service';
import { BooksService } from '../books/books.service';
import { UsersService } from '../users/users.service';
import { Borrow } from './entities/borrow.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QueryFilterBorrowDto } from './dto/query-filter-borrow.dto';
import { SortDirection } from '../common/pagination/pagination-query.dto';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import { BorrowStatus } from './constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateBorrowResponseDto } from './dto/create-borrow-response.dto';

describe('BorrowService', () => {
  let service: BorrowService;
  let booksService: BooksService;
  let usersService: UsersService;

  const mockBorrowRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    }),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockBooksService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowService,
        BooksService,
        UsersService,
        { provide: getRepositoryToken(Borrow), useValue: mockBorrowRepository },
      ],
    })
      .overrideProvider(BooksService)
      .useValue(mockBooksService)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    service = module.get<BorrowService>(BorrowService);
    booksService = module.get<BooksService>(BooksService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('borrow', () => {
    it('should create and save a new borrow', async () => {
      const userId = 1;
      const bookId = 1;
      const numberOfDays = 7;
      const currentDate = new Date();
      const returnDate = new Date(currentDate);
      returnDate.setDate(currentDate.getDate() + numberOfDays);

      const mockUser = { id: userId } as any;
      const mockBook = { id: bookId, availableCopies: 1 } as any;
      const mockBorrow = {
        id: 1,
        borrowDate: currentDate,
        returnDate,
        user: mockUser,
        book: mockBook,
        status: BorrowStatus.PENDING,
      } as any;

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockBooksService.findOne.mockResolvedValue(mockBook);
      mockBorrowRepository.create.mockReturnValue(mockBorrow);
      mockBorrowRepository.save.mockResolvedValue(mockBorrow);
      mockBooksService.update.mockResolvedValue({});

      const result: CreateBorrowResponseDto = await service.borrow(
        userId,
        bookId,
        numberOfDays,
      );
      expect(result).toEqual({ requestId: 1 });
      expect(mockUsersService.findOne).toHaveBeenCalledWith({ id: userId });
      expect(mockBooksService.findOne).toHaveBeenCalledWith(bookId);
      expect(mockBorrowRepository.create).toHaveBeenCalledWith({
        borrowDate: expect.any(Date),
        returnDate: expect.any(Date),
        user: mockUser,
        book: mockBook,
        status: BorrowStatus.PENDING,
      });
      expect(mockBorrowRepository.save).toHaveBeenCalledWith(mockBorrow);
      expect(mockBooksService.update).toHaveBeenCalledWith(bookId, {
        availableCopies: mockBook.availableCopies - 1,
      });
    });

    it('should throw NotFoundException if user or book is not found', async () => {
      const userId = 1;
      const bookId = 1;
      const numberOfDays = 7;

      mockUsersService.findOne.mockRejectedValue(new NotFoundException());
      mockBooksService.findOne.mockResolvedValue({});

      await expect(
        service.borrow(userId, bookId, numberOfDays),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if book is out of stock', async () => {
      const userId = 1;
      const bookId = 1;
      const numberOfDays = 7;

      const mockUser = { id: userId } as any;
      const mockBook = { id: bookId, availableCopies: 0 } as any;

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockBooksService.findOne.mockResolvedValue(mockBook);

      await expect(
        service.borrow(userId, bookId, numberOfDays),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user already has a pending or approved borrow request for the same book', async () => {
      const userId = 1;
      const bookId = 1;
      const numberOfDays = 7;

      const mockBorrow = {
        id: 1,
        userId,
        bookId,
        status: BorrowStatus.PENDING,
      } as any;
      mockBorrowRepository.findOne.mockResolvedValue(mockBorrow);

      await expect(
        service.borrow(userId, bookId, numberOfDays),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated borrows', async () => {
      const queryFilter: QueryFilterBorrowDto = {
        page: 1,
        pageSize: 10,
        sortBy: 'id',
        sortDirection: SortDirection.ASC,
      };

      const borrows = [new Borrow(), new Borrow()];
      const totalCount = 2;

      mockBorrowRepository
        .createQueryBuilder()
        .getManyAndCount.mockResolvedValue([borrows, totalCount]);

      const result: PaginatedDto<Borrow> = await service.findAll(queryFilter);

      expect(result.total).toBe(totalCount);
      expect(result.data).toBe(borrows);
      expect(result.currentPage).toBe(queryFilter.page);
      expect(result.pageSize).toBe(queryFilter.pageSize);
      expect(result.totalPages).toBe(
        Math.ceil(totalCount / queryFilter.pageSize),
      );
    });
  });

  describe('findOne', () => {
    it('should return a borrow if found', async () => {
      const borrow = new Borrow();
      mockBorrowRepository.findOne.mockResolvedValue(borrow);

      expect(await service.findOne(1)).toBe(borrow);
      expect(mockBorrowRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if borrow not found', async () => {
      mockBorrowRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a borrow request', async () => {
      const borrow = new Borrow();
      borrow.id = 1;
      borrow.status = BorrowStatus.PENDING;

      mockBorrowRepository.findOne
        .mockResolvedValueOnce(borrow)
        .mockResolvedValueOnce({ ...borrow, status: BorrowStatus.APPROVED });
      mockBorrowRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.approve(1);
      expect(result.status).toBe(BorrowStatus.APPROVED);
      expect(mockBorrowRepository.update).toHaveBeenCalledWith(1, {
        status: BorrowStatus.APPROVED,
      });
    });

    it('should throw BadRequestException if borrow is not in pending status', async () => {
      const borrow = new Borrow();
      borrow.status = BorrowStatus.RETURNED;

      mockBorrowRepository.findOne.mockResolvedValue(borrow);

      await expect(service.approve(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if borrow not found', async () => {
      mockBorrowRepository.findOne.mockResolvedValue(null);

      await expect(service.approve(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    it('should reject a borrow request', async () => {
      const borrow = new Borrow();
      borrow.id = 1;
      borrow.status = BorrowStatus.PENDING;

      mockBooksService.findOne.mockResolvedValue({
        id: borrow.bookId,
        availableCopies: 1,
      });

      mockBorrowRepository.findOne
        .mockResolvedValueOnce(borrow)
        .mockResolvedValueOnce({ ...borrow, status: BorrowStatus.REJECTED });
      mockBorrowRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.reject(1);
      expect(result.status).toBe(BorrowStatus.REJECTED);
      expect(mockBorrowRepository.update).toHaveBeenCalledWith(1, {
        status: BorrowStatus.REJECTED,
      });
      expect(mockBooksService.update).toHaveBeenCalledWith(borrow.bookId, {
        availableCopies: 2,
      });
    });

    it('should throw BadRequestException if borrow is not in pending status', async () => {
      const borrow = new Borrow();
      borrow.status = BorrowStatus.RETURNED;

      mockBorrowRepository.findOne.mockResolvedValue(borrow);

      await expect(service.reject(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if borrow not found', async () => {
      mockBorrowRepository.findOne.mockResolvedValue(null);

      await expect(service.reject(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('return', () => {
    it('should return a borrowed book', async () => {
      const userId = 1;
      const borrow = new Borrow();
      borrow.id = 1;
      borrow.userId = userId;
      borrow.status = BorrowStatus.APPROVED;

      mockBorrowRepository.findOne.mockResolvedValue(borrow);
      mockBorrowRepository.update.mockResolvedValue({ affected: 1 });
      mockBooksService.findOne.mockResolvedValue({
        id: borrow.bookId,
        availableCopies: 1,
      });
      mockBooksService.update.mockResolvedValue({});

      const result = await service.return(borrow.id, userId);
      expect(result).toBe(
        `Book with borrow id = ${borrow.id} returned successfully`,
      );
      expect(mockBorrowRepository.update).toHaveBeenCalledWith(borrow.id, {
        status: BorrowStatus.RETURNED,
      });
      expect(mockBooksService.update).toHaveBeenCalledWith(borrow.bookId, {
        availableCopies: 2,
      });
    });

    it('should throw NotFoundException if borrow not found for the user', async () => {
      const userId = 1;
      const borrow = new Borrow();
      borrow.id = 1;
      borrow.userId = 2;

      mockBorrowRepository.findOne.mockResolvedValue(borrow);

      await expect(service.return(borrow.id, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if borrow not found', async () => {
      const userId = 1;
      const borrowId = 1;

      mockBorrowRepository.findOne.mockResolvedValue(null);

      await expect(service.return(borrowId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
