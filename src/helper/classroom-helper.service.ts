import { SearchClassroomDto } from 'src/dto/classroom-dto/search-classroom.dto';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { ConditionWhere } from 'src/types/query.type';
import { ILike } from 'typeorm';

export class ClassroomHelper {
  static getFilterSearchClassroom = (q: SearchClassroomDto): ConditionWhere<ClassRoom> => {
    let userWhere: ConditionWhere<ClassRoom> = {};
    userWhere = {
      ...(q.name && { name: ILike(`%${q.name}%`) }),
      ...(q.classCode && { classCode: q.classCode }),
      ...(q.status && { status: q.status }),
      ...(q.classLevel && { classLevel: q.classLevel }),
      ...(q.isTeacherCreated && { isTeacherCreated: q.isTeacherCreated }),
      ...(q.teacherId && { teacherId: q.teacherId }),
    };

    return { ...userWhere };
  };
}
