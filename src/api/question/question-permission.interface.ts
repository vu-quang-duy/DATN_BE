import { Permission } from 'src/entities/role/permission.entity';

export enum QuestionAction {
  CREATE_QUESTION = 'question__CreateQuestion',
  UPDATE_QUESTION = 'question__UpdateQuestion',
  DELETE_QUESTION = 'question__DeleteQuestion',
  ADD_LIST_QUESTION = 'question__AddListQuestion',
  DELETE_LIST_QUESTION = 'question__DeleteListQuestion',
}

export const QuestionSummary: Record<keyof typeof QuestionAction, string> = {
  CREATE_QUESTION: 'Create a new question',
  UPDATE_QUESTION: 'Update a question',
  DELETE_QUESTION: 'Delete a question',
  ADD_LIST_QUESTION: 'Add list question',
  DELETE_LIST_QUESTION: 'Delete list question',
};

export const QuestionPermission: Partial<Permission>[] = Object.keys(QuestionAction).map((key) => ({
  roleCode: QuestionAction[key],
  name: QuestionSummary[key],
}));
