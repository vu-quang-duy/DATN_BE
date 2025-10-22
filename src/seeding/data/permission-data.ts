import { ClassRoomPermission } from 'src/api/classroom/classroom-permission.interface';
import { QuestionPermission } from 'src/api/question/question-permission.interface';
import { TopicPermission } from 'src/api/topic/topic-permission.interface';
import { UploadPermission } from 'src/api/upload/upload-permission.interface';
import { UserPermission } from 'src/api/user/user.permission.interface';
import { VocabularyPermission } from 'src/api/vocabulary/vocabulary.permission.interface';
import { Permission } from 'src/entities/role/permission.entity';

export const PermissionData: Partial<Permission>[] = [
  ...UserPermission,
  ...UploadPermission,
  ...ClassRoomPermission,
  ...VocabularyPermission,
  ...TopicPermission,
  ...QuestionPermission,
];
