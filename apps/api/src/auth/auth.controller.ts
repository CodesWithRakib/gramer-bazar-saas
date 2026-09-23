import { Controller, Post, Body, Get, Patch, Delete, UseGuards, Request, HttpCode, HttpStatus, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

/**
 * Auth endpoint rate limits (requests per minute, per IP).
 *
 * The defaults are production-safe. Automated journeys (local E2E, load tests)
 * log in repeatedly from a single IP and would trip the limits, so each value
 * can be raised through the environment without changing the defaults.
 */
const authThrottle = (envKey: string, fallback: number) => {
  const raw = Number(process.env[envKey]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
};

const SEND_OTP_LIMIT = authThrottle('AUTH_SEND_OTP_THROTTLE_LIMIT', 3);
const VERIFY_OTP_LIMIT = authThrottle('AUTH_VERIFY_OTP_THROTTLE_LIMIT', 5);
const REGISTER_LIMIT = authThrottle('AUTH_REGISTER_THROTTLE_LIMIT', 5);
const LOGIN_LIMIT = authThrottle('AUTH_LOGIN_THROTTLE_LIMIT', 5);

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', { httpOnly: true, secure: isProd, sameSite: 'lax' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: isProd, sameSite: 'lax' });
  }

  @Post('send-otp')
  @Throttle({ default: { limit: SEND_OTP_LIMIT, ttl: 60000 } })
  @ApiOperation({ summary: 'Send OTP to a phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.phone);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: VERIFY_OTP_LIMIT, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify OTP and get tokens' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.verifyOtp(verifyOtpDto.phone, verifyOtpDto.otp);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return { user: data.user };
  }

  @Post('register')
  @Throttle({ default: { limit: REGISTER_LIMIT, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new staff member (Admin/Seller/Rider)' })
  @ApiResponse({ status: 201, description: 'Registered successfully' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.registerStaff(registerDto);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return { user: data.user };
  }

  @Post('login')
  @Throttle({ default: { limit: LOGIN_LIMIT, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with password (for admin/seller/rider)' })
  @ApiResponse({ status: 200, description: 'Logged in successfully' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.loginWithPassword(loginDto.emailOrPhone, loginDto.password);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return { user: data.user };
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing from cookies');
    }
    const data = await this.authService.refreshTokens(refreshToken);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return { user: data.user };
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);
    this.clearCookies(res);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getProfile(@Request() req: any) {
    const user = req.user;
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles?.map((r: any) => (typeof r === 'string' ? r : r.name)) || [],
    };
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Patch('me/password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async updatePassword(@Request() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.id, updatePasswordDto);
  }

  @Post('me/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload avatar for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req: any, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.user.id}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req: any, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.authService.updateAvatar(req.user.id, avatarUrl);
  }

  @Delete('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request account deletion' })
  @ApiResponse({ status: 200, description: 'Account scheduled for deletion' })
  async deleteAccount(@Request() req: any) {
    return this.authService.deleteAccount(req.user.id);
  }
}

