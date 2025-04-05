import { Permission } from 'src/entities/role/permission.entity';

export enum ExamAction {
  CREATE_EXAM = 'exam__CreateExam',
  UPDATE_EXAM = 'exam__UpdateExam',
  DELETE_EXAM = 'exam__DeleteExam',
  ADD_EXAMS_FOR_USER = 'exam__AddExamsForUser',
  SEARCH_ALL_EXAMS_FOR_USER = 'exam__SearchAllExamsForUser',
  DELETE_EXAM_ATTEMPT = 'exam__DeleteExamAttempt',
}

export const ExamSummary: Record<keyof typeof ExamAction, string> = {
  CREATE_EXAM: 'Create a new EXAM',
  UPDATE_EXAM: 'Update a EXAM',
  DELETE_EXAM: 'Delete a EXAM',
  ADD_EXAMS_FOR_USER: 'Add exams for user',
  SEARCH_ALL_EXAMS_FOR_USER: 'Search all exams for user',
  DELETE_EXAM_ATTEMPT: 'Delete exam attempt',
};

export const ExamPermission: Partial<Permission>[] = Object.keys(ExamAction).map((key) => ({
  roleCode: ExamAction[key],
  name: ExamSummary[key],
}));
