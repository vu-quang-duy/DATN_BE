import { Permission } from 'src/entities/role/permission.entity';

export enum UploadAction {
  File = 'upload__File',
  Image = 'upload__Image',
  // GetAll = 'upload__GetAll',
  // GetMyUploads = 'upload__GetMyUploads',
}

export const UploadSummary: Record<keyof typeof UploadAction, string> = {
  File: 'Upload a file to storage',
  Image: 'Upload a image to storage',
  // GetAll: 'Get all upload on system',
  // GetMyUploads: 'Get my upload list',
};

export const UploadPermission: Partial<Permission>[] = Object.keys(UploadAction).map((key) => ({
  roleCode: UploadAction[key],
  name: UploadSummary[key],
}));
