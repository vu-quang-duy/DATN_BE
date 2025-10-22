import { Role } from 'src/entities/role/role.entity';
import { User } from 'src/entities/user/user.entity';

export class RoleHelper {
  static getRoleByCode = async (roleCode): Promise<Role> => {
    return await Role.findOneBy({ roleCode });
  };

  static getRoleByUserId = async (code): Promise<Role> => {
    const user = await User.findOne({
      where: { code },
      relations: { role: true },
    });
    return user?.role;
  };
}
