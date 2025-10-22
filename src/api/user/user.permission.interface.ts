import { Permission } from 'src/entities/role/permission.entity';

export enum UserAction {
  GetMyProfile = 'user__GetMyProfile',
  UpdateMyProfile = 'user__UpdateMyProfile',
  Authorization = 'user__AuthorizationTeacher',
  ChangePassword = 'user__ChangePassword',
}

export const UserSummary: Record<keyof typeof UserAction, string> = {
  GetMyProfile: 'Get user profile by JWT',
  UpdateMyProfile: 'Update user profile by JWT',
  Authorization: 'Authorization teacher by JWT',
  ChangePassword: 'Change password by JWT',
};

export const UserPermission: Partial<Permission>[] = Object.keys(UserAction).map((key) => ({
  roleCode: UserAction[key],
  name: UserSummary[key],
}));
