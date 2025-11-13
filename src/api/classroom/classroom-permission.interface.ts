import { Permission } from 'src/entities/role/permission.entity';

export enum ClassRoomAction {
  CREATE_CLASS = 'classroom__CreateClass',
  JOIN_CLASS = 'classroom__JoinClass',
  LEAVE_CLASS = 'classroom__LeaveClass',
  UPDATE_CLASS = 'classroom__UpdateClass',
  APPROVE_CLASS = 'classroom__ApproveClass',
  DELETE_CLASS = 'classroom__DeleteClass',
  GET_ALL_STUDENT = 'classroom__GetAllStudent',
}

export const ClassRoomSummary: Record<keyof typeof ClassRoomAction, string> = {
  CREATE_CLASS: 'Create a new class',
  JOIN_CLASS: 'Join a class',
  LEAVE_CLASS: 'Leave a class',
  UPDATE_CLASS: 'Update a class',
  APPROVE_CLASS: 'Approve a class',
  DELETE_CLASS: 'Delete a class',
  GET_ALL_STUDENT: 'Get all student in class',
};

export const ClassRoomPermission: Partial<Permission>[] = Object.keys(ClassRoomAction).map((key) => ({
  roleCode: ClassRoomAction[key],
  name: ClassRoomSummary[key],
}));
