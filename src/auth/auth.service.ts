import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Role } from '../users/constants';
import { TokenDto } from './dto/token.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<TokenDto> {
    if (signupDto.password !== signupDto.confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }
    const hashewdPassword = await this.hashPassword(signupDto.password);
    const new_user: CreateUserDto = {
      ...signupDto,
      password: hashewdPassword,
      role: Role.USER,
    };
    const user = await this.userService.create(new_user);
    const token = await this.generateJwtToken(user);
    return token;
  }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const user = await this.userService.findOne({
      username: loginDto.username,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.generateJwtToken(user);
    return token;
  }

  private async generateJwtToken(user): Promise<TokenDto> {
    const payload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    const decodedToken = this.jwtService.decode(token) as any;
    const expiry = decodedToken.exp;
    return { token, expiry };
  }

  private async validatePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
