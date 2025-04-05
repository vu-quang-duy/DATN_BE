/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { CreateClassroomDto, UpdateClassroomDto } from 'src/dto/classroom-dto/create-classroom.dto';
import { JoinClassDto } from 'src/dto/classroom-dto/search-classroom.dto';
import { RequestAuth } from 'src/dto/common-request.dto';
import { PageOptionsDto } from 'src/dto/paginate.dto';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { User } from 'src/entities/user/user.entity';
import { ClassRoomAction, ClassRoomSummary } from './classroom-permission.interface';
import { ClassroomService } from './classroom.service';

@IsAuthController(EntityNameConst.CLASSROOM, true)
export class ClassRoomPermissionController implements Record<ClassRoomAction, any> {
  constructor(private readonly classroomService: ClassroomService) {}
  classroom__ApproveClass: any;

  @Get('/all-student/:id')
  @ApiHandleResponse({
    type: User,
    summary: ClassRoomSummary.GET_ALL_STUDENT,
  })
  async [ClassRoomAction.GET_ALL_STUDENT](
    @Param('id') id: number,
    @Req() req: RequestAuth, 
    @Query() query: PageOptionsDto,
  ) {
    return await this.classroomService.getAllStudent(id, req.user, query, ClassRoomAction.GET_ALL_STUDENT);
  }

  @Post('/')
  @ApiHandleResponse({
    type: ClassRoom,
    summary: ClassRoomSummary.CREATE_CLASS,
  })
  async [ClassRoomAction.CREATE_CLASS](@Req() req: RequestAuth, @Body() body: CreateClassroomDto) {
    return await this.classroomService.createClassroom(req.user.userId, body, ClassRoomAction.CREATE_CLASS);
  }

  @Put('/:id')
  @ApiHandleResponse({
    summary: ClassRoomSummary.UPDATE_CLASS,
    type: Boolean,
  })
  async [ClassRoomAction.UPDATE_CLASS](
    @Req() req: RequestAuth,
    @Param('id') id: number,
    @Body() body: UpdateClassroomDto,
  ) {
    return await this.classroomService.updateById(id, req.user, body, ClassRoomAction.UPDATE_CLASS);
  }

  @Put('/update-student-in-class/:id')
  @ApiHandleResponse({
    summary: 'update student in class',
    type: Boolean,
  })
  async updateStudentInClass(@Req() req: RequestAuth, @Param('id') id: number, @Body() body: { studentCode: number }) {
    return await this.classroomService.updateStudentInClass(id, req.user, body, ClassRoomAction.JOIN_CLASS);
  }

  @Delete('/:id')
  @ApiHandleResponse({
    summary: ClassRoomSummary.DELETE_CLASS,
    type: Boolean,
  })
  async [ClassRoomAction.DELETE_CLASS](@Req() req: RequestAuth, @Param('id') id: number) {
    return await this.classroomService.deleteById(id, req.user, ClassRoomAction.DELETE_CLASS);
  }

  @Post('/join/:id')
  @ApiHandleResponse({
    summary: ClassRoomSummary.JOIN_CLASS,
    type: Boolean,
  })
  async [ClassRoomAction.JOIN_CLASS](@Req() req: RequestAuth, @Param('id') id: number, @Body() body: JoinClassDto) {
    return await this.classroomService.joinClass(id, req.user, body, ClassRoomAction.JOIN_CLASS);
  }

  @Delete('/leave/:id')
  @ApiHandleResponse({
    summary: ClassRoomSummary.LEAVE_CLASS,
    type: Boolean,
  })
  async [ClassRoomAction.LEAVE_CLASS](@Req() req: RequestAuth, @Param('id') id: number, @Body() body: JoinClassDto) {
    return await this.classroomService.leaveClass(id, req.user, body, ClassRoomAction.LEAVE_CLASS);
  }
}
