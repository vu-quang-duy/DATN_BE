import { Body, Get, Param, Post, Query } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { LoginResponse } from 'src/dto/common-response.dto';
import { LoginDto } from 'src/dto/user-dto/login.dto';
import { SearchStudentDto, SearchUserDto, SearchUserStatisticDto } from 'src/dto/user-dto/search-user.dto';
import { User } from 'src/entities/user/user.entity';
import { UserService } from './user.service';
import { RegisterDto, VerifyEmailDto } from 'src/dto/user-dto/register.dto';
import { UserStatistic } from 'src/entities/user/user-statistic.entity';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';

@IsAuthController(EntityNameConst.USER, false)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/health-check')
  async healthCheck() {
    try {
      const averageScore = await ExamAttempt.createQueryBuilder('examAttempt')
        .select('AVG(examAttempt.score)', 'averageScore')
        .where('examAttempt.studentId = :userId', { userId: 2 })
        .getRawOne();

      console.log('Average Score:', averageScore.averageScore);
    } catch (error) {}
  }

  @Post('/login')
  @ApiHandleResponse({
    summary: 'Login account with username password',
    type: LoginResponse,
  })
  async login(@Body() body: LoginDto) {
    return await this.userService.login(body);
  }

  @Get('/student-list')
  @ApiHandleResponse({ type: User, summary: 'Get class joined' })
  async getStudentList(@Query() query: SearchStudentDto) {
    return await this.userService.getStudentList(query);
  }

  @Get('/search')
  @ApiHandleResponse({
    summary: 'Get data for author list',
    type: User,
  })
  async search(@Query() query: SearchUserDto) {
    return await this.userService.search(query);
  }

  @Get('/statistics/:id')
  @ApiHandleResponse({ type: UserStatistic, summary: 'Get user statistics' })
  async getStatisticsById(@Param('id') id: number) {
    return await this.userService.getStatisticsById(id);
  }

  @Get('/search-statistics')
  @ApiHandleResponse({ type: UserStatistic, summary: 'Get user statistics' })
  async searchStatistics(@Query() query: SearchUserStatisticDto) {
    return await this.userService.searchStatistics(query);
  }

  @Get('/:id')
  @ApiHandleResponse({
    summary: 'Get user info by id',
    type: User,
  })
  async getProfileById(@Param('id') id: number) {
    return await this.userService.getProfileById(id);
  }

  @Post('/register')
  @ApiHandleResponse({
    summary: 'register account with username password',
    type: RegisterDto,
  })
  async register(@Body() body: RegisterDto) {
    return await this.userService.register(body);
  }

  @Post('/register/verify-otp')
  async verify(@Body() body: VerifyEmailDto): Promise<string> {
    return this.userService.verify(body.email, body.otpNum);
  }
}
