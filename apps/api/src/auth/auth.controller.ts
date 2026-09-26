import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { SupabaseStorageService } from '../storage/supabase-storage.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';
import {
  AuthResponseDto,
  UserProfileResponseDto,
  SendOtpResponseDto,
} from './dto/auth-response.dto.js';
import { MessageResponseDto } from '../common/dto/api-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

const authThrottle = (envKey: string, fallback: number) => {
  const raw = Number(process.env[envKey]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
};

const SEND_OTP_LIMIT = authThrottle('AUTH_SEND_OTP_THROTTLE_LIMIT', 3);
const VERIFY_OTP_LIMIT = authThrottle('AUTH_VERIFY_OTP_THROTTLE_LIMIT', 5);
const REGISTER_LIMIT = authThrottle('AUTH_REGISTER_THROTTLE_LIMIT', 5);
const LOGIN_LIMIT = authThrottle('AUTH_LOGIN_THROTTLE_LIMIT', 5);

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly storageService: SupabaseStorageService,
  ) {}

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
  @ApiOperation({
    summary: 'Request OTP for phone verification or login',
    description: 'Generates and dispatches a 6-digit OTP code to a Bangladeshi mobile number (public endpoint).',
  })
  @ApiStandardResponse({
    type: SendOtpResponseDto,
    status: HttpStatus.OK,
    description: 'OTP generated and dispatched successfully',
  })
  @ApiCommonErrors([400, 429, 500])
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.phone);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: VERIFY_OTP_LIMIT, ttl: 60000 } })
  @ApiOperation({
    summary: 'Verify OTP code and authenticate',
    description: 'Validates 6-digit OTP code. If the user does not exist, registers a new CUSTOMER account automatically. Returns access & refresh tokens and sets secure HTTP-only cookies.',
  })
  @ApiStandardResponse({
    type: AuthResponseDto,
    status: HttpStatus.OK,
    description: 'OTP verified successfully; session tokens returned',
  })
  @ApiCommonErrors([400, 401, 429, 500])
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.verifyOtp(verifyOtpDto.phone, verifyOtpDto.otp);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return data;
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Reset account password with OTP',
    description: 'Verifies the OTP sent to user phone and updates account password with new credential.',
  })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
  })
  @ApiCommonErrors([400, 404, 500])
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto.phone, resetDto.otp, resetDto.newPassword);
  }

  @Post('register')
  @Throttle({ default: { limit: REGISTER_LIMIT, ttl: 60000 } })
  @ApiOperation({
    summary: 'Register new user account with credentials',
    description: 'Registers a new platform user with email, phone, and password (e.g., CUSTOMER, SELLER, RIDER).',
  })
  @ApiStandardResponse({
    type: AuthResponseDto,
    status: HttpStatus.CREATED,
    description: 'Account registered successfully with active tokens',
  })
  @ApiCommonErrors([400, 409, 429, 500])
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.registerStaff(registerDto);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return data;
  }

  @Post('login')
  @Throttle({ default: { limit: LOGIN_LIMIT, ttl: 60000 } })
  @ApiOperation({
    summary: 'Password-based user authentication',
    description: 'Authenticates administrative staff, sellers, or riders with email/phone and password.',
  })
  @ApiStandardResponse({
    type: AuthResponseDto,
    status: HttpStatus.OK,
    description: 'Login successful; tokens and profile returned',
  })
  @ApiCommonErrors([400, 401, 429, 500])
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.loginWithPassword(loginDto.emailOrPhone, loginDto.password);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return data;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Refresh access token using HTTP-only cookie, body, or header',
    description: 'Reads refresh token from secure cookie, body, or x-refresh-token header, validates signature and database hash, and issues a fresh access token.',
  })
  @ApiStandardResponse({
    type: AuthResponseDto,
    status: HttpStatus.OK,
    description: 'New access token issued successfully',
  })
  @ApiCommonErrors([400, 401, 500])
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req: any,
    @Body() body: RefreshDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.['refresh_token'] ||
      body?.refreshToken ||
      req.headers?.['x-refresh-token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing from cookies, body, or headers');
    }
    const data = await this.authService.refreshTokens(refreshToken);
    this.setCookies(res, data.accessToken, data.refreshToken);
    return data;
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Terminate session and clear cookies',
    description: 'Invalidates database refresh token and clears client session cookies.',
  })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Logged out successfully',
  })
  @ApiCommonErrors([401, 500])
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);
    this.clearCookies(res);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Retrieve authenticated user profile',
    description: 'Returns profile details and assigned roles for currently logged in session.',
  })
  @ApiStandardResponse({
    type: UserProfileResponseDto,
    status: HttpStatus.OK,
    description: 'Current user profile details',
  })
  @ApiCommonErrors([401, 404, 500])
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
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update current user personal profile',
    description: 'Modifies first name, last name, or phone number of the authenticated user.',
  })
  @ApiStandardResponse({
    type: UserProfileResponseDto,
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
  })
  @ApiCommonErrors([400, 401, 500])
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Patch('me/password')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change account password',
    description: 'Validates existing password and applies new password for the current user.',
  })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  @ApiCommonErrors([400, 401, 500])
  async updatePassword(@Request() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.id, updatePasswordDto);
  }

  @Post('me/avatar')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Upload user profile avatar image',
    description: 'Uploads a JPEG/PNG/WebP image (up to 5MB) as the profile avatar in cloud storage.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPEG, PNG, WebP up to 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiStandardResponse({
    type: UserProfileResponseDto,
    status: HttpStatus.OK,
    description: 'Avatar uploaded and profile updated with new image URL',
  })
  @ApiCommonErrors([400, 401, 500])
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const validation = this.storageService.validateImageBuffer(file.buffer);
    if (!validation.isValid) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }
    const targetPath = this.storageService.getUserProfilePath(req.user.id, validation.ext);
    const existingAvatarUrl = req.user?.avatar;
    const { publicUrl } = await this.storageService.replaceImage(
      existingAvatarUrl,
      targetPath,
      file.buffer,
      validation.mimeType,
    );
    return this.authService.updateAvatar(req.user.id, publicUrl);
  }

  @Delete('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Schedule account deletion',
    description: 'Flags authenticated account for soft deletion and scheduled purge.',
  })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Account scheduled for deletion',
  })
  @ApiCommonErrors([401, 500])
  async deleteAccount(@Request() req: any) {
    return this.authService.deleteAccount(req.user.id);
  }
}
