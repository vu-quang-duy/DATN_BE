/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Audit } from 'entity-diff';
import { ERROR_MSG } from 'src/constant/error';
import { CacheUser } from 'src/dto/common-request.dto';
import { PageDto } from 'src/dto/paginate.dto';
import { CreateQuestionDto, CreateMultipleQuestionsDto, UpdateQuestionDto } from 'src/dto/question/create-question.dto';
import { SearchQuestionDto } from 'src/dto/question/search-question.dto';
import { Answer } from 'src/entities/question/answer.entity';
import { PermissionHelper } from 'src/helper/permisson-helper.service';
import { QuestionHelper } from 'src/helper/question-helper.service';
import { RoleHelper } from 'src/helper/role-helper.service';
import { App404Exception, AppException } from 'src/middleware/app-error-handler';
import { CondUtil } from 'src/utils/condition';
import { GenerateUtil } from 'src/utils/generate';
import { QueryUtil } from 'src/utils/query';
import { DataSource, In } from 'typeorm';
import { Question } from './../../entities/question/question.entity';
import { QuestionB } from 'src/entitiesB/question.entity';
import { AnswerB } from 'src/entitiesB/answer.entity';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { query } from 'express';

@Injectable()
export class QuestionService {
  constructor(@InjectDataSource() private dataSource: DataSource,
@InjectDataSource('dbB') private readonly dataSourceB: DataSource) {}

search = async (query: SearchQuestionDto) => {
  const questionAlias = 'question';
  const answerAlias = 'answer';

  const qb = this.dataSource
    .getRepository(Question)
    .createQueryBuilder(questionAlias)
    .leftJoinAndSelect(`${questionAlias}.answerResList`, answerAlias, `${answerAlias}.correct = 1`)
    .where(QuestionHelper.getFilterSearchQuestion(query))
    .orderBy(`${questionAlias}.questionId`, 'DESC')
    .skip(query.skip)
    .take(query.take);

  const [data, itemCount] = await qb.getManyAndCount();

  // ✅ Lấy classRoomId duy nhất từ danh sách câu hỏi
  const classRoomIds = [...new Set(data.map((item) => item.classRoomId))];

  // ✅ Lấy tên lớp từ bảng classRoom
  const classRepo = this.dataSource.getRepository(ClassRoom);
  const classRooms = await classRepo.find({
    where: { classroomId: In(classRoomIds) },
  });

  // ✅ Map classRoomId → name
  const classRoomMap = new Map(
    classRooms.map((item) => [item.classroomId, item.name])
  );

  // ✅ Gắn thêm tên lớp + convert correct từ Buffer → boolean
  const dataWithClassName = data.map((item) => ({
    ...item,
    className: classRoomMap.get(item.classRoomId) || '',
    answerResList: item.answerResList.map((ans) => ({
      ...ans,
      correct: ans.correct?.[0] === 1, // convert Buffer to boolean
    })),
  }));

  // ✅ Log kiểm tra
  dataWithClassName.forEach((item) => {
    console.log('q', item)
    console.log(`Question ${item.questionId}:`, item.answerResList);
  });

  return GenerateUtil.paginate({ data: dataWithClassName, itemCount, query });
};


  async createQuestion(body: CreateQuestionDto) {
    const {content, imageLocation, classRoomId, questionType, fileType, explanation, videoLocation} = body;
  
    const questionRepo = this.dataSource.getRepository(Question)

    const question = await questionRepo
    .createQueryBuilder()
    .insert()
    .into(Question)
    .values({
      content,
      imageLocation,
      classRoomId,
      questionType,
      fileType,
      videoLocation,
      explanation
    })
    .execute()

    const questionId = question.identifiers[0].questionId;
    
    body.answerReqs.map(async (answer) => {
      const answerRep = new Answer();
      answerRep.content = answer.content;
      answerRep.correct = Buffer.from([answer.correct ? 1 : 0]);
      answerRep.imageLocation = answer.imageLocation;
      answerRep.videoLocation = answer.videoLocation;
      answerRep.questionId = questionId;
      await answerRep.save();
    });

    return question;
  }

  createListQuestion = async (body: CreateQuestionDto[]) => {
    const questionList = [];

    for (let index = 0; index < body.length; index++) {
      const question = await this.createQuestion(body[index]);
      questionList.push(question);
    }
    return questionList;
  };

  getById = async (questionId: number): Promise<Question> => {
    const question = await Question.findOne({
      select: {
        classroom: {
          classroomId: true,
          name: true,
          classLevel: true,
        },
        answerResList: {
          // id: true,
          content: true,
          correct: true,
          imageLocation: true,
          videoLocation: true,
          questionId: true,
        },
      },
      where: { questionId },
      relations: { classroom: true, answerResList: true },
    });
    if (!question) throw new App404Exception('id', { questionId });
    return question;
  };

  updateById = async (
    questionId: number,
    user: CacheUser,
    body: UpdateQuestionDto,
    permissionCode: string,
  ): Promise<Question> => {
    const question = await Question.findOne({
      select: {
        answerResList: {
          // id: true,
          content: true,
          correct: true,
          imageLocation: true,
          videoLocation: true,
          questionId: true,
        },
      },
      where: { questionId },
      relations: { answerResList: true },
    });
    if (!question) throw new App404Exception('id', { questionId });

    // if (body.content != question.content) {
    //   const isExistByName = await HelperUtils.existByName(Question, body.content, 'content');
    //   if (isExistByName) throw new AppExistedException('content', body);
    // }

    const oldQuestion = JSON.stringify(question);

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    CondUtil.saveIfChanged(question, body, [
      'content',
      'imageLocation',
      'classroomId',
      'description',
      'explanation',
      'fileType',
      'videoLocation',
      'questionType',
    ]);

    const oldAnswer = JSON.stringify(question.answerResList);
    const newAnswer = JSON.stringify(body.updateAnswerReqs);

    const audit = new Audit();
    const diffAnswer = audit.diff(JSON.parse(oldAnswer), JSON.parse(newAnswer));
    const diffQuestion = audit.diff(JSON.parse(oldQuestion), JSON.parse(JSON.stringify(question)));
    if (!diffAnswer.length && !diffQuestion.length) throw new AppException(ERROR_MSG.HAVE_NOT_ANY_CHANGE);

    body.updateAnswerReqs.map(async (answer) => {
      let answerRep = await Answer.findOne({ where: { answerId: answer.answerId } });
      if (!answerRep) answerRep = new Answer();
      answerRep.questionId = question.questionId;
      CondUtil.saveIfChanged(answerRep, answer, ['content', 'correct', 'imageLocation', 'videoLocation']);

      await answerRep.save();
    });

    return await question.save();
  };

  deleteById = async (questionId: number, user: CacheUser, permissionCode): Promise<any> => {
    let question;
    const userRole = await RoleHelper.getRoleByUserId(user.userId);
    if (userRole.roleCode === 'ADMIN') {
      question = await Question.findOne({ where: { questionId } });
    } else {
      question = await Question.findOne({ where: { questionId } });
    }

    if (!question) throw new App404Exception('id', { questionId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    await question.remove();
    return true;
  };

deleteList = async (body: { questionIds: string[] }) => {
  console.log('🧾 Full body:', body);
  const questionRepository = this.dataSource.getRepository(Question);
  
  const numericIds = body.questionIds
    ?.map(id => parseInt(id, 10))
    .filter(id => !isNaN(id) && id > 0);
     
  console.log('🔢 Numeric IDs:', numericIds);
     
  if (!numericIds || numericIds.length === 0) {
    throw new Error('No valid question IDs provided');
  }
     
  try {
    // Using query builder - more explicit
    const result = await questionRepository
      .createQueryBuilder()
      .delete()
      .from(Question)
      .where('question_id IN (:...ids)', { ids: numericIds })
      .execute();
         
    console.log('🗑️ Delete result:', result);
    return result;
       
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
}

  deleteAnswers = async (answerId: number, user: CacheUser, permissionCode): Promise<any> => {
    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const answer = await Answer.findOne({ where: { answerId } });

    if (!answer) throw new App404Exception('id', { answerId });

    await answer.remove();

    return true;
  };

getQuestionOfExam = async (id: number): Promise<PageDto<Question>> => {
  const [data, itemCount] = await Question.findAndCount({
    where: {
      exams: {
        examId: id,
      },
    },
    relations: { answerResList: true, exams: true },
  });

  // Convert Buffer to boolean
  const formattedData = data.map((question) => {
  const updatedAnswers = question.answerResList?.map((answer) => {
    const correctValue =
      Buffer.isBuffer(answer.correct)
        ? answer.correct[0] === 1
        : (answer.correct as { data: number[] })?.data?.[0] === 1;

    return {
      ...answer,
      correct: correctValue,
    };
  }) || [];

    return {
      ...question,
      answerResList: updatedAnswers,
    };
  });

  return GenerateUtil.paginate({ data: formattedData, itemCount, query: {} });
};

  getListQuestionClass = async (classRoomId?: any) => {
  const questionAlias = 'question';
  const answerAlias = 'answer';

  const qb = this.dataSource
    .getRepository(Question)
    .createQueryBuilder(questionAlias)
    .leftJoinAndSelect(`${questionAlias}.answerResList`, answerAlias)
    .where(`${questionAlias}.classRoomId = :classRoomId`, { classRoomId })
    .orderBy(`${questionAlias}.questionId`, 'DESC');

  const [data, itemCount] = await qb.getManyAndCount();

  // ✅ Lấy classRoomId duy nhất từ danh sách câu hỏi
  const classRepo = this.dataSource.getRepository(ClassRoom);
  const classRoom = await classRepo.findOne({
    where: { classroomId: classRoomId },
  });

  const className = classRoom?.name || '';

  const dataWithClassName = data.map((item) => ({
    ...item,
    className,
    answerResList: item.answerResList.map((ans) => ({
      ...ans,
      correct: typeof ans.correct === 'boolean' ? ans.correct : ans.correct?.[0] === 1,
    })),
  }));
  console.log('da',dataWithClassName)
  return {
    data: dataWithClassName,
    total: itemCount,
  };
};
}
