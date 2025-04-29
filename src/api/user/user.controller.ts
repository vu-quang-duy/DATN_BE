import { Body, Get, Param, Post, Put, Query, ParseIntPipe } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { LoginResponse } from 'src/dto/common-response.dto';
import { LoginDto } from 'src/dto/user-dto/login.dto';
import { UpdateUserDto } from 'src/dto/user-dto/update-user.dto';
import { SearchStudentDto, SearchTeacherDto, SearchUserDto, SearchClassDto, SearchSchoolDto, SearchUserStatisticDto } from 'src/dto/user-dto/search-user.dto';
import { User } from 'src/entities/user/user.entity';
import { UserService } from './user.service';
import { RegisterDto, VerifyEmailDto } from 'src/dto/user-dto/register.dto';
import { UserStatistic } from 'src/entities/user/user-statistic.entity';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { VocabularyView } from 'src/entities/vocabulary/vocabulary-view.entity';
import { PartView } from 'src/entities/class/part-view.entity';

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
  @ApiHandleResponse({ type: User, summary: 'Get student list' })
  async getStudentList(@Query() query: SearchStudentDto) {
    return await this.userService.getStudentList(query);
  }

  @Get('/teacher-list')
  @ApiHandleResponse({ type: User, summary: 'Get teacher list' })
  async getTeacherList(@Query() query: SearchTeacherDto) {
    return await this.userService.getTeacherList(query);
  }

  @Get('/school-list')
  @ApiHandleResponse({ type: User, summary: 'Get school list' })
  async getSchoolList(@Query() query: SearchSchoolDto) {
    return await this.userService.getSchoolList(query);
  }

  @Get('/class-list')
  @ApiHandleResponse({ type: User, summary: 'Get class list' })
  async getClassList(@Query() query: SearchClassDto) {
    return await this.userService.getClassList(query);
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

  @Post('/vocabulary/view')
  @ApiHandleResponse({ type: VocabularyView, summary: 'add vocabulary view' })
  async viewVocabulary(
    // @Param('id', ParseIntPipe) vocabularyId: number, 
    @Body('vocabularyId') vocabularyId: number,
    // @Body() body: any
    @Body('userId') userId: number
  ) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return await this.userService.viewVocabulary(userId, vocabularyId); 
  }

  @Get('/vocabulary/recent-view/:id')
  @ApiHandleResponse({type: VocabularyView, summary: 'Get recent vocabulary views by user ID', isArray: true})
  async getRecentVocabViews(
    // @Body('userId') userId: number, 
    @Param('id', ParseIntPipe)  userId: number
  ) {
    return this.userService.getRecentVocabularyViews(userId);
  }

  @Post('/lesson/view')
  @ApiHandleResponse({ type: PartView, summary: 'add lesson view' })
  async viewLesson(
    @Body('lessonId') lessonId: number,
    @Body('userId') userId: number
  ) {
    // console.log('Received partId:', partId);
    if (!userId) {
      throw new Error('userId is required');
    }
    return await this.userService.viewLesson(userId, lessonId); 
  }

  @Get('/lesson/recent-view/:id')
  @ApiHandleResponse({type: PartView, summary: 'Get recent lesson views by user ID', isArray: true})
  async getRecentLessonViews(
    // @Body('userId') userId: number, 
    @Param('id', ParseIntPipe)  userId: number
  ) {
    return this.userService.getRecentLessonViews(userId);
  }

  @Get('/lesson/full-view/:id')
  @ApiHandleResponse({type: PartView, summary: 'Get full lesson views by user ID', isArray: true})
  async getFullLessonViews(
    @Param('id', ParseIntPipe)  userId: number
  ) {
    return this.userService.getFullLessonViews(userId);
  }

  @Get('/vocabulary/full-view/:id')
  @ApiHandleResponse({type: VocabularyView, summary: 'Get full vocabulary views by user ID', isArray: true})
  async getFullVocabularyViews(
    @Param('id', ParseIntPipe)  userId: number
  ) {
    return this.userService.getFullVocabularyViews(userId);
  }

  @Get('/test/full-view/:id')
  @ApiHandleResponse({type: ExamAttempt, summary: 'Get full test completed by user ID', isArray: true})
  async getFullTestsCompleted(
    @Param('id', ParseIntPipe)  userId: number
  ) {
    return this.userService.getFullTestsCompleted(userId);
  }

  @Put('/:id')
  @ApiHandleResponse({ type: User, summary: 'Update User' })
  async updateUser(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return await this.userService.updateUser(id, body);
  }

  @Put('/delete/:id')
  @ApiHandleResponse({ type: User, summary: 'Delete User' })
  async deleteStudent(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }

  @Post('/create-student')
  @ApiHandleResponse({ type: User, summary: 'create new student' })
  async createStudent(@Body() body: UpdateUserDto) {
    return await this.userService.createStudent(body); 
  }

  @Post('/create-teacher')
  @ApiHandleResponse({ type: User, summary: 'create new teacher' })
  async createTeacher(@Body() body: UpdateUserDto) {
    return await this.userService.createTeacher(body); 
  }

}
