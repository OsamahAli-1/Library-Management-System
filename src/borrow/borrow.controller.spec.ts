import { Test, TestingModule } from '@nestjs/testing';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { Borrow } from './entities/borrow.entity';
import { User } from '../users/entities/user.entity';
import { CreateBorrowResponseDto } from './dto/create-borrow-response.dto';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { QueryFilterBorrowDto } from './dto/query-filter-borrow.dto';
import { PaginatedDto } from '../common/pagination/paginated.dto';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('BorrowController', () => {
  let controller: BorrowController;
  let borrowService: BorrowService;

  const mockBorrowService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    borrow: jest.fn(),
    return: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      controllers: [BorrowController],
      providers: [BorrowService],
    })
      .overrideProvider(BorrowService)
      .useValue(mockBorrowService)
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BorrowController>(BorrowController);
    borrowService = module.get<BorrowService>(BorrowService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllBorrowRequests', () => {
    it('should call findAll and return paginated borrow requests', async () => {
      const result: PaginatedDto<Borrow> = {
        total: 0,
        pageSize: 0,
        currentPage: 0,
        totalPages: 1,
        data: [],
      };
      mockBorrowService.findAll.mockResolvedValue(result);

      expect(
        await controller.getAllBorrowRequests(new QueryFilterBorrowDto()),
      ).toBe(result);
      expect(mockBorrowService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBorrowRequest', () => {
    it('should call findOne and return a borrow request', async () => {
      const result = new Borrow();
      mockBorrowService.findOne.mockResolvedValue(result);

      expect(await controller.getBorrowRequest(1)).toBe(result);
      expect(mockBorrowService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('borrow', () => {
    it('should call borrow and return a borrow response', async () => {
      const result = new CreateBorrowResponseDto();
      const user = new User();
      user.id = 1;
      const createBorrowDto = new CreateBorrowDto();
      createBorrowDto.numberOfDays = 7;
      mockBorrowService.borrow.mockResolvedValue(result);

      expect(await controller.borrow(1, user, createBorrowDto)).toBe(result);
      expect(mockBorrowService.borrow).toHaveBeenCalledWith(user.id, 1, 7);
    });
  });

  describe('return', () => {
    it('should call return and return a success message', async () => {
      const result = 'Book returned successfully';
      const user = new User();
      user.id = 1;
      mockBorrowService.return.mockResolvedValue(result);

      expect(await controller.return(1, user)).toBe(result);
      expect(mockBorrowService.return).toHaveBeenCalledWith(1, user.id);
    });
  });

  describe('approve', () => {
    it('should call approve and return the approved borrow request', async () => {
      const result = new Borrow();
      mockBorrowService.approve.mockResolvedValue(result);

      expect(await controller.approve(1)).toBe(result);
      expect(mockBorrowService.approve).toHaveBeenCalledWith(1);
    });
  });

  describe('reject', () => {
    it('should call reject and return the rejected borrow request', async () => {
      const result = new Borrow();
      mockBorrowService.reject.mockResolvedValue(result);

      expect(await controller.reject(1)).toBe(result);
      expect(mockBorrowService.reject).toHaveBeenCalledWith(1);
    });
  });
});
