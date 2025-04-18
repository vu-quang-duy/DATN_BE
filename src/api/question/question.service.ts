import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Audit } from 'entity-diff';
import { ERROR_MSG } from 'src/constant/error';
import { CacheUser } from 'src/dto/common-request.dto';
import { PageDto } from 'src/dto/paginate.dto';
import { CreateQuestionDto, UpdateQuestionDto } from 'src/dto/question/create-question.dto';
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

@Injectable()
export class QuestionService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  search = async (query: SearchQuestionDto): Promise<PageDto<Question>> => {
    const [data, itemCount] = await Question.findAndCount({
      select: {
        questionId: true,
        content: true,
        classRoomId: true,
        imageLocation: true,
        videoLocation: true,
        description: true,
        createdDate: true,
        creatorId: true,
        classroom: {
          classroomId: true,
          name: true,
          classLevel: true,
        },
        answerResList: {
          questionId: true,
          content: true,
          correct: true,
          imageLocation: true,
          videoLocation: true,
          // questionId: true,
        },
      },
      where: QuestionHelper.getFilterSearchQuestion(query),
      relations: { answerResList: true, classroom: true },
      order: QueryUtil.getSort(query.orderBy, query.sortBy),
      skip: query.skip,
      take: query.take,
    });

    return GenerateUtil.paginate({ data, itemCount, query });
  };

  async createQuestion(userId: number, body: CreateQuestionDto, permissionCode) {
    // const isExistByName = await HelperUtils.existByName(Question, body.content, 'content');
    // if (isExistByName) throw new AppExistedException('content', body);

    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const question = new Question();
    question.content = body.content;
    question.description = body.description;
    question.imageLocation = body.imageLocation;
    question.classRoomId = body.classRoomId;
    question.creatorId = userId;
    question.questionType = body.questionType;
    question.fileType = body.fileType;
    question.explanation = body.explanation;
    question.videoLocation = body.videoLocation;
    await question.save();

    body.answerReqs.map(async (answer) => {
      const answerRep = new Answer();
      answerRep.content = answer.content;
      answerRep.correct = answer.correct;
      answerRep.imageLocation = answer.imageLocation;
      answerRep.videoLocation = answer.videoLocation;
      answerRep.questionId = question.questionId;

      await answerRep.save();
    });

    return question;
  }

  createListQuestion = async (userId: number, body: CreateQuestionDto[], permissionCode) => {
    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const questionList = [];

    for (let index = 0; index < body.length; index++) {
      const question = await this.createQuestion(userId, body[index], permissionCode);
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
      question = await Question.findOne({ where: { questionId, creatorId: user.userId } });
    }

    if (!question) throw new App404Exception('id', { questionId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    await question.remove();
    return true;
  };

  deleteList = async (questionIds: number[], user: CacheUser, permissionCode): Promise<any> => {
    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    if (!questionIds.length) throw new App404Exception('id', { questionId: questionIds });

    const questionList = await Question.find({ where: { questionId: In(questionIds) } });

    await this.dataSource.transaction(async (txManager) => {
      for (let index = 0; index < questionList.length; index++) {
        const question = questionList[index];
        await txManager.remove(question);
      }
    });

    return true;
  };

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

    return GenerateUtil.paginate({ data, itemCount, query: {} });
  };
}
