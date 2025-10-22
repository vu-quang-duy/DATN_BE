import { SearchTopicDto } from 'src/dto/topic/search-topic.dto';
import { Topic } from 'src/entities/vocabulary/topic.entity';
import { ConditionWhere } from 'src/types/query.type';
import { ILike } from 'typeorm';

export class TopicHelper {
  static getFilterSearchTopic = (q: SearchTopicDto): ConditionWhere<Topic> => {
    let userWhere: ConditionWhere<Topic> = {};
    userWhere = {
      ...(q.name && { name: ILike(`%${q.name}%`) }),
      ...(q.classroomId && { classroomId: q.classroomId }),
      ...(q.creatorId && { creatorId: q.creatorId }),
      isCommon: q.isCommon,
    };

    return { ...userWhere };
  };
}
