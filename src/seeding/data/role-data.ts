import { RoleCode } from 'src/constant/role-code';
import { Role } from 'src/entities/role/role.entity';

export const RoleData: Partial<Role>[] = [
  {
    roleCode: RoleCode.ADMIN,
    name: 'Administrators on system',
  },
  {
    roleCode: RoleCode.TEACHER,
    name: 'Teacher on system',
  },
  {
    roleCode: RoleCode.USER,
    name: 'Student on system',
  },
  {
    roleCode: RoleCode.VOLUNTEER,
    name: 'Volunteer on system',
  },
  {
    roleCode: RoleCode.ADMIN_CODE_SERVICE,
    name: 'Code server administrators on system',
  },
];
