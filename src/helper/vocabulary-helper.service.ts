import { SearchVocabularyDto } from 'src/dto/vocabulary-dto/search-vocabulary.dto';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';
import { ConditionWhere } from 'src/types/query.type';
import { ILike } from 'typeorm';

export class VocabularyHelper {
  static getFilterSearchVocabulary = (q: SearchVocabularyDto): ConditionWhere<Vocabulary> => {
    let where: ConditionWhere<Vocabulary> = {};
    where = {
      ...(q.content && { content: ILike(`%${q.content}%`) }),
      ...(q.vocabularyType && { vocabularyType: q.vocabularyType }),
      ...(q.status && { status: q.status }),
      ...(q.topicId && { topicId: q.topicId }),
      ...(q.classroomId && { classroomId: q.classroomId }),
      ...(q.creatorId && { creatorId: q.creatorId }),
      ...(q.isPrivate === undefined ? {} : { isPrivate: q.isPrivate }),
    };

    return { ...where };
  };
}
