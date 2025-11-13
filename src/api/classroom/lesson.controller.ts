import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Lesson } from '../../entities/class/lesson.entity';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get lessons by classroom ID' })
  @ApiQuery({ name: 'classRoomId', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Returns lessons for the specified classroom' })
  @ApiResponse({ status: 400, description: 'Invalid classroom ID' })
  async getLessonsByClassroom(@Query('classRoomId') classRoomIdStr: string) {
    try {
      // Validate and parse the classRoomId
      const classRoomId = parseInt(classRoomIdStr, 10);

      if (isNaN(classRoomId)) {
        throw new HttpException('Invalid classroom ID: must be a number', HttpStatus.BAD_REQUEST);
      }

      // Fetch lessons associated with the classroom
      const lessons = await this.lessonRepository.find({
        where: { classRoomId: classRoomId },
        select: ['lessonId', 'lessonName', 'imageLocation', 'videoLocation', 'createdDate'],
        order: {
          createdDate: 'ASC', // Order by creation date
        },
      });

      return lessons;
    } catch (error) {
      // Re-throw known HttpExceptions
      if (error instanceof HttpException) {
        throw error;
      }

      // Log the error for debugging
      console.error('Error fetching lessons:', error);
      console.error('Error details:', error.message);

      // Return a generic error
      throw new HttpException('Failed to fetch lessons', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
