import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { TokenDto } from './dto/token.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should return a token on successful signup', async () => {
      const signupDto: SignupDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const tokenDto: TokenDto = {
        token: 'jwtToken',
        expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      mockAuthService.signup.mockResolvedValue(tokenDto);

      const result = await mockAuthService.signup(signupDto);

      expect(result).toEqual(tokenDto);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto);
    });

    it('should throw a BadRequestException if passwords do not match', async () => {
      const signupDto: SignupDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456',
      };

      mockAuthService.signup.mockRejectedValue(
        new BadRequestException('Password and confirm password do not match'),
      );

      await expect(controller.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const tokenDto: TokenDto = {
        token: 'jwtToken',
        expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      mockAuthService.login.mockResolvedValue(tokenDto);

      const result = await controller.login(loginDto);

      expect(result).toEqual(tokenDto);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
