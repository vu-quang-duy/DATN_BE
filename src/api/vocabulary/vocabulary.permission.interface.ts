import { Permission } from 'src/entities/role/permission.entity';

export enum VocabularyAction {
  Create_Vocabulary = 'vocabulary__Create_Vocabulary',
  Update_Vocabulary = 'vocabulary__Update_Vocabulary',
  Delete_Vocabulary = 'vocabulary__Delete_Vocabulary',
  Approve_Vocabulary = 'vocabulary__Approve_Vocabulary',
}

export const VocabularySummary: Record<keyof typeof VocabularyAction, string> = {
  Create_Vocabulary: 'Create a new vocabulary',
  Update_Vocabulary: 'Update a vocabulary',
  Delete_Vocabulary: 'Delete a vocabulary',
  Approve_Vocabulary: 'Approve a vocabulary',
};

export const VocabularyPermission: Partial<Permission>[] = Object.keys(VocabularyAction).map((key) => ({
  roleCode: VocabularyAction[key],
  name: VocabularySummary[key],
}));
