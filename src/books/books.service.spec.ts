import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import {
  PaginationQueryDto,
  SortDirection,
} from '../common/pagination/pagination-query.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksService', () => {
  let service: BooksService;
  let repository: Repository<Book>;

  const mockBookRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockBookRepository },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new book', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        photoUrl: 'https://google.com',
        author: 'Test Author',
        publishedDate: new Date(),
        isbn: '1234567890',
        summary: 'Test Summary',
        availableCopies: 1,
      };

      const book = new Book();
      Object.assign(book, createBookDto);

      mockBookRepository.create.mockReturnValue(book);
      mockBookRepository.save.mockResolvedValue(book);

      expect(await service.create(createBookDto)).toEqual(book);
      expect(mockBookRepository.create).toHaveBeenCalledWith(createBookDto);
      expect(mockBookRepository.save).toHaveBeenCalledWith(book);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const paginationQueryDto: PaginationQueryDto = {
        page: 1,
        pageSize: 10,
        sortBy: 'id',
        sortDirection: SortDirection.ASC,
      };

      const books: Book[] = [new Book(), new Book()];
      const totalCount = 2;

      mockBookRepository.findAndCount.mockResolvedValue([books, totalCount]);

      const result: PaginatedDto<Book> =
        await service.findAll(paginationQueryDto);

      expect(result.total).toBe(totalCount);
      expect(result.data).toBe(books);
      expect(result.currentPage).toBe(paginationQueryDto.page);
      expect(result.pageSize).toBe(paginationQueryDto.pageSize);
      expect(result.totalPages).toBe(
        Math.ceil(totalCount / paginationQueryDto.pageSize),
      );
    });
  });

  describe('findOne', () => {
    it('should return a book if found', async () => {
      const book = new Book();
      mockBookRepository.findOne.mockResolvedValue(book);

      expect(await service.findOne(1)).toBe(book);
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if book not found', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book if found', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Title' };

      mockBookRepository.update.mockResolvedValue({ affected: 1 });

      expect(await service.update(1, updateBookDto)).toBe(
        `Book with id = 1 updated successfully`,
      );
      expect(mockBookRepository.update).toHaveBeenCalledWith(1, updateBookDto);
    });

    it('should throw NotFoundException if book not found', async () => {
      const updateBookDto: UpdateBookDto = { title: 'Updated Title' };

      mockBookRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(1, updateBookDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a book if found', async () => {
      mockBookRepository.delete.mockResolvedValue({ affected: 1 });

      expect(await service.remove(1)).toBe(
        `Book with id = 1 deleted successfully`,
      );
      expect(mockBookRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if book not found', async () => {
      mockBookRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
