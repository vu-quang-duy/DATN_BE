import { ClassStudent } from './../../entities/class/class-student.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateClassroomDto, UpdateClassroomDto } from 'src/dto/classroom-dto/create-classroom.dto';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { PermissionHelper } from 'src/helper/permisson-helper.service';
import { App404Exception, AppException, AppExistedException } from 'src/middleware/app-error-handler';
import { HelperUtils } from 'src/utils/helpers';
import { DataSource } from 'typeorm';
import { ClassRoomAction } from './classroom-permission.interface';
import { CacheUser } from 'src/dto/common-request.dto';
import { CondUtil } from 'src/utils/condition';
import { ERROR_MSG } from 'src/constant/error';
import { RoleHelper } from 'src/helper/role-helper.service';
import { SearchClassroomDto } from 'src/dto/classroom-dto/search-classroom.dto';
import { PageDto } from 'src/dto/paginate.dto';
import { ClassroomHelper } from 'src/helper/classroom-helper.service';
import { QueryUtil } from 'src/utils/query';
import { GenerateUtil } from 'src/utils/generate';
import { User } from 'src/entities/user/user.entity';
import { AppStatus } from 'src/types/common';

@Injectable()
export class ClassroomService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  search = async (query: SearchClassroomDto): Promise<PageDto<ClassRoom>> => {
    const [data, itemCount] = await ClassRoom.findAndCount({
      select: {
        classroomId: true,
        name: true,
        createdAt: true,
        description: true,
        thumbnailPath: true,
        status: true,
        classLevel: true,
        teacherId: true,
        classCode: true,
        slug: true,
        teacher: {
          userId: true,
          name: true,
        },
      },
      where: ClassroomHelper.getFilterSearchClassroom(query),
      relations: { teacher: true },
      order: QueryUtil.getSort(query.orderBy, query.sortBy),
      skip: query.skip,
      take: query.take,
    });

    return GenerateUtil.paginate({ data, itemCount, query });
  };

  getAllStudent = async (classroomId: number, cacheUser: CacheUser, query, permissionCode): Promise<any> => {
    const isPermission = await PermissionHelper.isPermissionChange(cacheUser.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const [data, itemCount] = await ClassStudent.findAndCount({
      select: {
        classStudentId: true,
        studentId: true,
        student: {
          userId: true,
          username: true,
          email: true,
        },
      },
      relations: { student: true },
      where: { classroomId: classroomId },
    });

    return GenerateUtil.paginate({ data, itemCount, query });
  };

  async createClassroom(userId: number, body: CreateClassroomDto, permissionCode) {
    const isExistByName = await HelperUtils.existByName(ClassRoom, body.name, 'name');
    if (isExistByName) throw new AppExistedException('name', body);

    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    if (body.teacherId) {
      const teacher = await User.findOneBy({ userId: body.teacherId, role: { roleCode: 'TEACHER' } });
      if (!teacher) throw new App404Exception('teacherId', { teacherId: body.teacherId });
    }

    const userRole = await RoleHelper.getRoleByUserId(userId);

    const classroom = new ClassRoom();

    classroom.name = body.name;
    classroom.teacherId = body.teacherId;
    classroom.description = body.description;
    classroom.thumbnailPath = body.thumbnailPath;
    classroom.classCode = body.classCode || HelperUtils.generateRandomClassCode();
    classroom.isTeacherCreated = true;
    classroom.classLevel = body.classLevel;

    if (userRole.roleCode === 'ADMIN') {
      classroom.isTeacherCreated = false;
      classroom.status = AppStatus.APPROVED;
    }

    await classroom.save();
    return classroom;
  }

  getById = async (classroomId: number): Promise<ClassRoom> => {
    const classRoom = await ClassRoom.findOne({
      select: {
        teacher: {
          userId: true,
          username: true,
        },
      },
      where: { classroomId },
      relations: { teacher: true },
    });
    if (!classRoom) throw new App404Exception('id', { classroomId });
    return classRoom;
  };

  updateById = async (
    classroomId: number,
    user: CacheUser,
    body: UpdateClassroomDto,
    permissionCode: string,
  ): Promise<ClassRoom> => {
    let classroom;
    if (user.code === 'ADMIN') {
      classroom = await ClassRoom.findOne({ where: { classroomId } });
    } else {
      classroom = await ClassRoom.findOne({ where: { classroomId, teacherId: user.userId } });
    }
    if (!classroom) throw new App404Exception('id', { classroomId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    CondUtil.saveIfChanged(classroom, body, ['name', 'description', 'thumbnailPath']);

    if (!!body.status && body.status !== classroom.status) {
      const isPermission = await PermissionHelper.isPermissionChange(user.userId, ClassRoomAction.APPROVE_CLASS);
      if (!isPermission) throw new AppException(ERROR_MSG.PERMISSION_DENIED);
      classroom.status = body.status;
    }

    await classroom.save();
    return classroom;
  };

  deleteById = async (classroomId: number, user: CacheUser, permissionCode): Promise<ClassRoom> => {
    const userRole = await RoleHelper.getRoleByUserId(user.userId);
    if (userRole.roleCode === 'ADMIN') {
      const classroom = await ClassRoom.findOne({ where: { classroomId } });
      if (!classroom) throw new App404Exception('id', { classroomId });
      await classroom.remove();
      return classroom;
    }

    const classroom = await ClassRoom.findOne({ where: { classroomId, teacherId: user.userId } });
    if (!classroom) throw new App404Exception('id', { classroomId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    await classroom.remove();
    return classroom;
  };

  joinClass = async (classroomId: number, user: CacheUser, body, permissionCode): Promise<any> => {
    const classroom = await ClassRoom.findOne({ where: { classroomId, status: AppStatus.APPROVED } });
    if (!classroom) throw new App404Exception('id', { classroomId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const student = await User.findOne({ where: { studentProfile: { studentCode: body.studentCode } } });
    if (!student) throw new App404Exception('userId', { userId: body.studentCode });

    const classStudentExist = await ClassStudent.findOne({
      where: { studentId: student.userId },
    });
    if (classStudentExist) throw new AppExistedException('studentId', { studentId: body.studentCode });

    const classStudent = new ClassStudent();

    classStudent.classroomId = classroom.classroomId;
    classStudent.studentId = student.userId;

    await classStudent.save();
    return true;
  };

  leaveClass = async (classroomId: number, user: CacheUser, body, permissionCode): Promise<any> => {
    const classroom = await ClassRoom.findOne({ where: { classroomId } });
    if (!classroom) throw new App404Exception('id', { classroomId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const student = await User.findOne({ where: { studentProfile: { studentCode: body.studentCode } } });
    const classStudent = await ClassStudent.findOne({ where: { classroomId: classroom.classroomId, studentId: student.userId } });
    if (!classStudent) throw new App404Exception('studentId', { studentId: body.studentId });

    await classStudent.remove();
    return true;
  };

  updateStudentInClass = async (classroomId: number, user: CacheUser, body, permissionCode): Promise<any> => {
    const classroom = await ClassRoom.findOne({ where: { classroomId } });
    if (!classroom) throw new App404Exception('id', { classroomId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const student = await User.findOne({ where: { studentProfile: { studentCode: body.studentCode } } });
    const classStudent = await ClassStudent.findOne({ where: { studentId: student.userId } });
    if (!classStudent) throw new App404Exception('studentId', { studentId: body.studentCode });

    classStudent.classroomId = classroomId;

    return await classStudent.save();
  };
}
