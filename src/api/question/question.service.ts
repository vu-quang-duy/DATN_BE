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
import { EXAM } from 'src/entities/exam/exam.entity';
import { ExamQuestion } from 'src/entities/exam/exam-question.entity';
import { ExamB } from 'src/entitiesB/exam.entity';
import { ExamVocabulary } from 'src/entities/exam/exam-vocabulary.entity';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectDataSource('dbB') private readonly dataSourceB: DataSource,
  ) {}

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
    const classRoomMap = new Map(classRooms.map((item) => [item.classroomId, item.name]));

    // ✅ Gắn thêm tên lớp + convert correct từ Buffer → boolean
    let dataWithClassName = data.map((item) => ({
      ...item,
      className: classRoomMap.get(item.classRoomId) || '',
      answerResList: item.answerResList.map((ans) => ({
        ...ans,
        correct: ans.correct?.[0] === 1, // convert Buffer to boolean
      })),
    }));

    // ✅ Filter by question name
    if (query.content && query.content.trim() !== '') {
      dataWithClassName = dataWithClassName.filter(
        (question) => question.content && question.content.toLowerCase().includes(query.content.toLowerCase()),
      );
    }

    // ✅ Filter by class name
    if (query.classRoomName && query.classRoomName.trim() !== '') {
      dataWithClassName = dataWithClassName.filter(
        (question) =>
          question.className && question.className.toLowerCase().includes(query.classRoomName.toLowerCase()),
      );
    }

    return GenerateUtil.paginate({ data: dataWithClassName, itemCount, query });
  };

  async createQuestion(body: CreateQuestionDto) {
    const { content, imageLocation, classRoomId, questionType, fileType, explanation, videoLocation } = body;

    const questionRepo = this.dataSource.getRepository(Question);

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
        explanation,
      })
      .execute();

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

  deleteList = async (body: { questionIds: number[] }) => {
    const questionRepository = this.dataSource.getRepository(Question);
    const answerRepository = this.dataSource.getRepository(Answer);
    const numericIds = body.questionIds;
    console.log('🔍 Received questionIds:', numericIds);
    console.log(
      '🔍 Types:',
      body.questionIds.map((id) => typeof id),
    );

    try {
      await answerRepository
        .createQueryBuilder()
        .delete()
        .where('question_id IN (:...ids)', { ids: numericIds })
        .execute();
      // Using query builder - more explicit
      const result = await questionRepository
        .createQueryBuilder()
        .delete()
        .from(Question)
        .where('question_id IN (:...ids)', { ids: numericIds })
        .execute();

      return result;
    } catch (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }
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
    console.log('id', id);

    // Get repositories
    const examRepository = this.dataSourceB.getRepository(ExamB);
    const examQuestionRepository = this.dataSource.getRepository(ExamQuestion);
    const classRepository = this.dataSource.getRepository(ClassRoom);
    const practiceQuestionRepository = this.dataSource.getRepository(ExamVocabulary);
    const vocabularyRepository = this.dataSource.getRepository(Vocabulary);

    // Get exam details
    const exam = await examRepository.findOne({
      where: { examId: id },
    });

    // Check if exam exists in ExamQuestion table to determine examType
    const examQuestion = await examQuestionRepository.findOne({
      where: { examId: id },
    });
    const examType = examQuestion ? 'quiz' : 'practice';

    let formattedData: any[];
    let itemCount: number;

    if (examType === 'quiz') {
      // Current logic for quiz type
      const [data, count] = await Question.findAndCount({
        where: {
          exams: {
            examId: id,
          },
        },
        relations: { answerResList: true, exams: true },
      });

      itemCount = count;

      // Get unique classRoomIds from the questions
      const classRoomIds = [...new Set(data.map((question) => question.classRoomId))];

      // Get classroom details for all unique classRoomIds
      const classRooms = await classRepository.find({
        where: { classroomId: In(classRoomIds) },
      });

      // Create a map for quick lookup
      const classRoomMap = new Map(classRooms.map((classroom) => [classroom.classroomId, classroom.name]));

      // Convert Buffer to boolean and add additional data
      formattedData = data.map((question) => {
        const updatedAnswers =
          question.answerResList?.map((answer) => {
            const correctValue = Buffer.isBuffer(answer.correct)
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
          examName: exam?.name || '',
          examType,
          classRoomName: classRoomMap.get(question.classRoomId) || '',
        };
      });
    } else {
      // Practice type logic - get vocabulary data from practiceQuestionRepository
      const [practiceData, practiceCount] = await practiceQuestionRepository.findAndCount({
        where: { examId: id },
      });

      itemCount = practiceCount;

      // Get unique vocabularyIds from practice data
      const vocabularyIds = [...new Set(practiceData.map((item) => item.vocabularyId))];

      // Get vocabulary details including topicId
      const vocabularies = await vocabularyRepository.find({
        where: { vocabularyId: In(vocabularyIds) },
      });

      // Create a map for quick vocabulary lookup
      const vocabularyMap = new Map(vocabularies.map((vocab) => [vocab.vocabularyId, vocab]));

      // For practice, the "questions" are the vocabulary items
      formattedData = practiceData.map((practiceItem) => {
        const vocabulary = vocabularyMap.get(practiceItem.vocabularyId);
        const cleanContent = practiceItem.content?.split('-')[0]?.trim() || '';

        return {
          vocabularyId: practiceItem.vocabularyId,
          content: cleanContent,
          isPrivate: vocabulary?.isPrivate || false,
          topicId: vocabulary?.topicId || null,
          examName: exam?.name || '',
          examType,
          classRoomId: exam?.classRoomId || null,
        };
      });
    }

    return GenerateUtil.paginate({
      data: formattedData,
      itemCount,
      query: {},
    });
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
    return {
      data: dataWithClassName,
      total: itemCount,
    };
  };
}
