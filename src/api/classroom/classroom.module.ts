import { Module } from '@nestjs/common';
import { ClassRoomPermissionController } from './classroom-permission.controller';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
@Module({
  providers: [ClassroomService],
  controllers: [ClassRoomPermissionController, ClassroomController],
})
export class ClassroomModule {}
