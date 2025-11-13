import { ClassRoomAction } from 'src/api/classroom/classroom-permission.interface';
import { UploadAction } from 'src/api/upload/upload-permission.interface';
import { UserAction } from 'src/api/user/user.permission.interface';
import { connectSource } from 'src/config/database.config';
import { RoleCode } from 'src/constant/role-code';
import { RolePermission } from 'src/entities/role/role-permission.entity';
import { Role } from 'src/entities/role/role.entity';
import { Token } from 'src/entities/token.entity';
import { User } from 'src/entities/user/user.entity';
import { RoleHelper } from 'src/helper/role-helper.service';
import { Permission } from './../entities/role/permission.entity';
import { PermissionData } from './data/permission-data';
import { RoleData } from './data/role-data';
import { TokenData } from './data/token-data';
import {
  adminCodeServiceData,
  DefaultAdminData,
  DefaultStudentData,
  DefaultTeacherData,
  DefaultVolunteerData,
} from './data/user-data';
import { seedingEntity } from './seeding-utils';
import { VocabularyAction } from 'src/api/vocabulary/vocabulary.permission.interface';
import { TopicAction } from 'src/api/topic/topic-permission.interface';
import { QuestionAction } from 'src/api/question/question-permission.interface';

const PermissionAdminRoleCode = [
  ...Object.values(UserAction),
  ...Object.values(UploadAction),
  ...Object.values(ClassRoomAction),
  ...Object.values(VocabularyAction),
  ...Object.values(TopicAction),
  ...Object.values(QuestionAction),
];

const PermissionUserRoleCode = [
  UserAction.GetMyProfile,
  UserAction.UpdateMyProfile,
  UploadAction.File,
  UploadAction.Image,
];

const PermissionTeacherRoleCode = [
  ...PermissionUserRoleCode,
  ...Object.values(ClassRoomAction).filter((item) => item !== ClassRoomAction.APPROVE_CLASS),
  ...Object.values(VocabularyAction),
  ...Object.values(TopicAction),
  ...Object.values(QuestionAction),
];

const PermissionVolunteerRoleCode = [
  ...PermissionUserRoleCode,
  ...Object.values(VocabularyAction).filter((item) => item !== VocabularyAction.Approve_Vocabulary),
  ...Object.values(QuestionAction),
];

const seedingRolePermission = async (permissionCodes, code) => {
  console.log(`======== SEEDING ${RolePermission.name} =========`);
  for (const roleCode of permissionCodes) {
    const role = await RoleHelper.getRoleByCode(roleCode);
    if (!role) {
      console.log(`======== ${Role.name} code ${roleCode} is not exist`);
      continue;
    }

    const permission = await Permission.findOneBy({ code });
    if (!permission) {
      console.log(`======== ${Permission.name} code ${code} is not exist`);
      continue;
    }

    const rolePermission = await RolePermission.findOneBy({
      code: role.roleCode,
      permissionId: permission.permissionId,
    });

    if (rolePermission) {
      console.log(
        `======== ${RolePermission.name} code-${role.roleCode} permissionId-${permission.permissionId} is exist =========`,
      );
      continue;
    }

    await RolePermission.save({
      roleCoded: role.roleCode,
      permissionId: permission.permissionId,
    } as Partial<RolePermission>);
  }
};

const defaultSeeding = async () => {
  await connectSource();

  await seedingEntity(Token, TokenData, 'code');

  await seedingEntity(Permission, PermissionData, 'code');

  await seedingEntity(Role, RoleData, 'code');

  const adminRole = await RoleHelper.getRoleByCode(RoleCode.ADMIN);
  const teacherRole = await RoleHelper.getRoleByCode(RoleCode.TEACHER);
  const studentRole = await RoleHelper.getRoleByCode(RoleCode.USER);
  const volunteerRole = await RoleHelper.getRoleByCode(RoleCode.VOLUNTEER);
  const admCodeServiceRole = await RoleHelper.getRoleByCode(RoleCode.ADMIN_CODE_SERVICE);

  await seedingEntity(
    User,
    DefaultAdminData.map((item) => ({ ...item, code: adminRole.roleCode })),
    'email',
  );

  await seedingEntity(
    User,
    DefaultTeacherData.map((item) => ({ ...item, code: teacherRole.roleCode })),
    'email',
  );

  await seedingEntity(
    User,
    DefaultStudentData.map((item) => ({ ...item, code: studentRole.roleCode })),
    'email',
  );

  await seedingEntity(
    User,
    DefaultVolunteerData.map((item) => ({ ...item, code: volunteerRole.roleCode })),
    'email',
  );

  await seedingEntity(
    User,
    adminCodeServiceData.map((item) => ({ ...item, code: admCodeServiceRole.roleCode })),
    'email',
  );

  await seedingRolePermission(PermissionAdminRoleCode, RoleCode.ADMIN);
  await seedingRolePermission(PermissionTeacherRoleCode, RoleCode.TEACHER);
  await seedingRolePermission(PermissionUserRoleCode, RoleCode.USER);
  await seedingRolePermission(PermissionUserRoleCode, RoleCode.VOLUNTEER);
  await seedingRolePermission(PermissionAdminRoleCode, RoleCode.ADMIN_CODE_SERVICE);
  await seedingRolePermission(PermissionVolunteerRoleCode, RoleCode.VOLUNTEER);

  process.exit(1);
};

defaultSeeding();
