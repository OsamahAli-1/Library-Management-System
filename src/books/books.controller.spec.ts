import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import {
  PaginationQueryDto,
  SortDirection,
} from '../common/pagination/pagination-query.dto';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('BooksController', () => {
  let controller: BooksController;

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService],
    })
      .overrideProvider(BooksService)
      .useValue(mockBooksService)
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        photoUrl: 'https://google.com',
        author: 'Author Name',
        publishedDate: new Date(),
        isbn: '1234567890',
        summary: 'Summary',
        availableCopies: 1,
      };
      const book: Book = new Book();
      mockBooksService.create.mockResolvedValue(book);

      expect(await controller.create(createBookDto)).toBe(book);
      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of books', async () => {
      const paginationQueryDto: PaginationQueryDto = {
        page: 1,
        pageSize: 10,
        sortBy: 'id',
        sortDirection: SortDirection.ASC,
      };
      const paginatedBooks: PaginatedDto<Book> = {
        total: 1,
        pageSize: 10,
        currentPage: 1,
        totalPages: 1,
        data: [new Book()],
      };
      mockBooksService.findAll.mockResolvedValue(paginatedBooks);

      expect(await controller.findAll(paginationQueryDto)).toBe(paginatedBooks);
      expect(mockBooksService.findAll).toHaveBeenCalledWith(paginationQueryDto);
    });

    it('should return an empty paginated list if no books are found', async () => {
      const paginationQueryDto: PaginationQueryDto = {
        page: 1,
        pageSize: 10,
        sortBy: 'id',
        sortDirection: SortDirection.ASC,
      };
      const paginatedBooks: PaginatedDto<Book> = {
        total: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 0,
        data: [],
      };
      mockBooksService.findAll.mockResolvedValue(paginatedBooks);

      expect(await controller.findAll(paginationQueryDto)).toBe(paginatedBooks);
      expect(mockBooksService.findAll).toHaveBeenCalledWith(paginationQueryDto);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const book: Book = new Book();
      mockBooksService.findOne.mockResolvedValue(book);

      expect(await controller.findOne(1)).toBe(book);
      expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if no book is found by id', async () => {
      mockBooksService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(2)).rejects.toThrow(NotFoundException);
      expect(mockBooksService.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
        photoUrl: 'https://google.com',
        author: 'Updated Author',
        publishedDate: new Date(),
        isbn: '0987654321',
        summary: 'Updated Summary',
        availableCopies: 1,
      };
      const message = 'Book with id = 1 updated successfully';
      mockBooksService.update.mockResolvedValue(message);

      expect(await controller.update(1, updateBookDto)).toBe(message);
      expect(mockBooksService.update).toHaveBeenCalledWith(1, updateBookDto);
    });

    it('should throw NotFoundException if no book is found to update', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
        photoUrl: 'https://google.com',
        author: 'Updated Author',
        publishedDate: new Date(),
        isbn: '0987654321',
        summary: 'Updated Summary',
        availableCopies: 1,
      };
      mockBooksService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(2, updateBookDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBooksService.update).toHaveBeenCalledWith(2, updateBookDto);
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      const message = 'Book with id = 1 deleted successfully';
      mockBooksService.remove.mockResolvedValue(message);

      expect(await controller.remove(1)).toBe(message);
      expect(mockBooksService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if no book is found to delete', async () => {
      mockBooksService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(2)).rejects.toThrow(NotFoundException);
      expect(mockBooksService.remove).toHaveBeenCalledWith(2);
    });
  });
});
