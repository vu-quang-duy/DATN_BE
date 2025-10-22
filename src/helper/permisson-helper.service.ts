import { Permission } from 'src/entities/role/permission.entity';
import { RolePermission } from 'src/entities/role/role-permission.entity';
import { RoleHelper } from './role-helper.service';

export class PermissionHelper {
  static getPermissionByCode = async (code): Promise<Permission> => {
    return await Permission.findOneBy({ code });
  };

  static isPermissionChange = async (userId, permissionCode) => {
    const permissionId = await Permission.findOneBy({ code: permissionCode });
    const role = await RoleHelper.getRoleByUserId(userId);
    if (!role || !permissionId) return false;
    const isPermission = await RolePermission.findOneBy({
      code: role.roleCode,
      permissionId: permissionId.permissionId,
    });
    if (!isPermission) return false;
    return true;
  };
}
