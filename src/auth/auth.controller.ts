import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TokenDto } from './dto/token.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiCreatedResponse({ type: TokenDto })
  async signup(@Body() SignupDto: SignupDto): Promise<TokenDto> {
    return await this.authService.signup(SignupDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ type: TokenDto })
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    return await this.authService.login(loginDto);
  }
}
