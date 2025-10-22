import { Permission } from 'src/entities/role/permission.entity';

export enum TopicAction {
  CREATE_TOPIC = 'topic__CreateTopic',
  UPDATE_TOPIC = 'topic__UpdateTopic',
  DELETE_TOPIC = 'topic__DeleteTopic',
}

export const TopicSummary: Record<keyof typeof TopicAction, string> = {
  CREATE_TOPIC: 'Create a new TOPIC',
  UPDATE_TOPIC: 'Update a TOPIC',
  DELETE_TOPIC: 'Delete a TOPIC',
};

export const TopicPermission: Partial<Permission>[] = Object.keys(TopicAction).map((key) => ({
  roleCode: TopicAction[key],
  name: TopicSummary[key],
}));
