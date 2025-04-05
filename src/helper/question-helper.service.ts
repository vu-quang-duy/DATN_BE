import { SearchQuestionDto } from 'src/dto/question/search-question.dto';
import { Topic } from 'src/entities/vocabulary/topic.entity';
import { ConditionWhere } from 'src/types/query.type';
import { ILike } from 'typeorm';
import { Question } from './../entities/question/question.entity';

export class QuestionHelper {
  static getFilterSearchQuestion = (q: SearchQuestionDto): ConditionWhere<Question> => {
    let userWhere: ConditionWhere<Topic> = {};
    userWhere = {
      ...(q.content && { content: ILike(`%${q.content}%`) }),
      ...(q.classRoomId && { classRoomId: q.classRoomId }),
      ...(q.creatorId && { creatorId: q.creatorId }),
      ...(q.questionType && { questionType: q.questionType }),
      ...(q.fileType && { fileType: q.fileType }),
    };

    return { ...userWhere };
  };

  // static findOrCreateQuestion = async (id: number) => {
  //   let question = await Question.findOne({ where: { id }, relations: ['answers'] });
  //   if (!question) {
  //     question = new Question();
  //     await
}
