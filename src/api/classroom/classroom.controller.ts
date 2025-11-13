import { Get, Param, Query } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { User } from 'src/entities/user/user.entity';
import { ClassroomService } from './classroom.service';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { SearchClassroomDto } from 'src/dto/classroom-dto/search-classroom.dto';

@IsAuthController(EntityNameConst.CLASSROOM, false)
export class ClassroomController {
  constructor(private readonly classRoomService: ClassroomService) {}

  @Get('/all')
  @ApiHandleResponse({
    summary: 'Get classroom list',
    type: ClassRoom,
  })
  async search(@Query() query: SearchClassroomDto) {
    return await this.classRoomService.search(query);
  }

  @Get('/:id')
  @ApiHandleResponse({
    summary: 'Get classroom info by id',
    type: User,
  })
  async getProfileById(@Param('id') id: number) {
    return await this.classRoomService.getById(id);
  }
}
