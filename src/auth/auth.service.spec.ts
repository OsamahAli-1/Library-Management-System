import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../users/constants';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    decode: jest.fn(),
  };

  jest.mock('bcrypt', () => ({
    hash: jest.fn((hashPassword: string) => Promise.resolve(hashPassword)),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideProvider(usersService)
      .useValue(mockJwtService)
      .overrideProvider(jwtService)
      .useValue(mockJwtService)
      .compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should throw an exception if passwords do not match', async () => {
      const signupDto: SignupDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456',
      };

      await expect(authService.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new user and return a token', async () => {
      const signupDto: SignupDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const hashedPassword = 'hashedPassword';
      const user = { id: 1, username: 'testuser', password: hashedPassword };
      const token = 'jwtToken';
      const expiry = Math.floor(Date.now() / 1000) + 3600;

      // Mock implementations
      const bcryptHash = jest.fn().mockResolvedValue(hashedPassword);
      (bcrypt.hash as jest.Mock) = bcryptHash;

      mockUsersService.create.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue(token);
      mockJwtService.decode.mockReturnValue({ exp: expiry });

      const result = await authService.signup(signupDto);

      expect(result).toEqual({ token, expiry });
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...signupDto,
        password: hashedPassword,
        role: Role.USER,
      });
    });
  });

  describe('login', () => {
    it('should throw an exception if user not found', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      mockUsersService.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an exception if password is invalid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const user = { id: 1, username: 'testuser', password: 'hashedPassword' };

      mockUsersService.findOne.mockResolvedValue(user);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a token if login is successful', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const user = { id: 1, username: 'testuser', password: 'hashedPassword' };
      const token = 'jwtToken';
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      mockUsersService.findOne.mockResolvedValue(user);
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      mockJwtService.signAsync.mockResolvedValue(token);
      mockJwtService.decode.mockReturnValue({ exp: expiry });

      const result = await authService.login(loginDto);

      expect(result).toEqual({ token, expiry });
    });
  });
});
