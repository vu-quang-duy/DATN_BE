/* eslint-disable @typescript-eslint/no-unused-vars */
import { SearchExamAttemptDto, SearchExamDto } from 'src/dto/exam/search-exam.dto';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { EXAM } from 'src/entities/exam/exam.entity';
import { ConditionWhere } from 'src/types/query.type';
import { ILike } from 'typeorm';

export class ExamHelper {
  static getFilterSearchExam = (q: SearchExamDto): ConditionWhere<EXAM> => {
    let userWhere: ConditionWhere<EXAM> = {};
    userWhere = {
      ...(q.name && { name: ILike(`%${q.name}%`) }),
      ...(q.classRoomId && { classRoomId: q.classRoomId }),
      ...(q.creatorId && { creatorId: q.creatorId }),
      ...(q.isPrivate !== undefined && { private: q.isPrivate }),
    };

    return { ...userWhere };
  };

  // static getFilterSearchExamAttempt = (q: SearchExamAttemptDto): ConditionWhere<ExamAttempt> => {
  //   let where: ConditionWhere<ExamAttempt> = {};
  //   let examWhere: ConditionWhere<EXAM> = {};
  //   where = {
  //     ...(q.studentId && { studentId: q.studentId }),
  //     ...(q.isFinished && { isFinished: q.isFinished }),
  //     ...(q.examId && { examId: q.examId }),
  //   };

  //   examWhere = { ...(q.classRoomId && { classRoomId: q.classRoomId }) };

  //   return { ...where, exam: { ...examWhere } };
  // };
}
