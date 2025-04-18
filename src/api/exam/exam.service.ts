import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Audit } from 'entity-diff';
import { ERROR_MSG } from 'src/constant/error';
import { CacheUser } from 'src/dto/common-request.dto';
import { CreateExamDto, UpdateExamDto } from 'src/dto/exam/create-exam.dto';
import { SaveExamDto } from 'src/dto/exam/save-exam.dto';
import { SearchExamAttemptDto, SearchExamDto } from 'src/dto/exam/search-exam.dto';
import { PageDto } from 'src/dto/paginate.dto';
import { ExamQuestion } from 'src/entities/exam/exam-question.entity';
import { EXAM } from 'src/entities/exam/exam.entity';
import { StudentAnswer } from 'src/entities/question/student-answer.entity';
import { ExamHelper } from 'src/helper/exam-helper.service';
import { PermissionHelper } from 'src/helper/permisson-helper.service';
import { RoleHelper } from 'src/helper/role-helper.service';
import { App404Exception, AppException, AppExistedException } from 'src/middleware/app-error-handler';
import { CondUtil } from 'src/utils/condition';
import { GenerateUtil } from 'src/utils/generate';
import { HelperUtils } from 'src/utils/helpers';
import { QueryUtil } from 'src/utils/query';
import { DataSource, In } from 'typeorm';
import { ExamAttempt } from './../../entities/exam/exam-attempt.entity';

@Injectable()
export class ExamService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  search = async (query: SearchExamDto): Promise<PageDto<EXAM>> => {
    const [data, itemCount] = await EXAM.findAndCount({
      select: {
        examId: true,
        name: true,
        classRoomId: true,
        description: true,
        createdDate: true,
        creatorId: true,
        numberOfQuestions: true,
        private: true,
        classroom: {
          classroomId: true,
          name: true,
          classLevel: true,
        },
      },
      where: ExamHelper.getFilterSearchExam(query),
      relations: { classroom: true },
      order: QueryUtil.getSort(query.orderBy, query.sortBy),
      skip: query.skip,
      take: query.take,
    });

    return GenerateUtil.paginate({ data, itemCount, query });
  };

  searchAllExamAttemptForUser = async (userId, query: SearchExamAttemptDto, permissionCode) => {
    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) {
      throw new App404Exception('permissionCode', { permissionCode });
    }

    const [data, itemCount] = await ExamAttempt.findAndCount({
      select: {
        userExamId: true,
        score: true,
        createdDate: true,
        studentId: true,
        isFinished: true,
        exam: {
          examId: true,
          name: true,
          classRoomId: true,
          numberOfQuestions: true,
          private: true,
          classroom: {
            classroomId: true,
            name: true,
            classLevel: true,
          },
        },
      },
      where: {
        studentId: userId,
        ...ExamHelper.getFilterSearchExamAttempt(query),
      },
      relations: { exam: { classroom: true } },
      order: QueryUtil.getSort(query.orderBy, query.sortBy),
      skip: query.skip,
      take: query.take,
    });

    return GenerateUtil.paginate({ data, itemCount, query });
  };

  async create(userId: number, body: CreateExamDto, permissionCode) {
    const isExistByName = await HelperUtils.existByName(EXAM, body.name, 'name');
    if (isExistByName) throw new AppExistedException('name', body);

    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const exam = new EXAM();
    await this.dataSource.transaction(async (txEntityManager) => {
      exam.name = body.name;
      exam.description = body.description;
      exam.classRoomId = body.classRoomId;
      exam.private = body.private;
      exam.creatorId = userId;
      exam.numberOfQuestions = body.numberOfQuestions;
      exam.thumbnailPath = body.thumbnailPath;

      await txEntityManager.save(exam);

      if (body.questionIds && body.questionIds.length > 0) {
        const examQuestions = body.questionIds.map((questionId) => {
          const examQuestion = new ExamQuestion();
          examQuestion.questionId = questionId;
          examQuestion.examId = exam.examId;
          return examQuestion;
        });

        // Lưu examQuestions
        await txEntityManager.save(ExamQuestion, examQuestions);
      }
    });

    return await this.getById(exam.examId);
  }

  getById = async (examId: number): Promise<EXAM> => {
    const exam = await EXAM.findOne({
      select: {
        classroom: {
          classroomId: true,
          name: true,
          classLevel: true,
        },
        creator: {
          createdDate: true,
          name: true,
        },
        questions: {
          questionId: true,
        },
      },
      where: { examId },
      relations: { classroom: true, creator: true, questions: true },
    });
    if (!exam) throw new App404Exception('id', { examId });
    return exam;
  };

  updateById = async (examId: number, user: CacheUser, body: UpdateExamDto, permissionCode: string): Promise<EXAM> => {
    const exam = await EXAM.findOne({ where: { examId }, relations: { questions: true } });
    if (!exam) throw new App404Exception('id', { examId });

    if (body.name != exam.name) {
      const isExistByName = await HelperUtils.existByName(EXAM, body.name, 'name');
      if (isExistByName) throw new AppExistedException('name', body);
    }

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const oldExam = JSON.stringify(exam);
    const oldQuestion = JSON.stringify(exam.questions.map((q) => q.examId));

    CondUtil.saveIfChanged(exam, body, ['name', 'thumbnailPath', 'numberOfQuestions', 'description']);
    const audit = new Audit();
    const diffAnswer = audit.diff(JSON.parse(oldExam), JSON.parse(JSON.stringify(exam)));
    const diffQuestion = audit.diff(JSON.parse(oldQuestion), JSON.parse(JSON.stringify(body.questionIds)));
    if (!diffAnswer.length && !diffQuestion.length) throw new AppException(ERROR_MSG.HAVE_NOT_ANY_CHANGE);

    const currentQuestionIds = exam.questions.map((q) => q.questionId);

    const questionIdsToDelete = currentQuestionIds.filter((id) => !body.questionIds.includes(id));
    const questionIdsToAdd = body.questionIds.filter((id) => !currentQuestionIds.includes(id));

    await Promise.all([
      questionIdsToDelete.length && ExamQuestion.delete({ examId: exam.examId, questionId: In(questionIdsToDelete) }),
      questionIdsToAdd.length &&
        questionIdsToAdd.map(async (questionId) => {
          const examQuestion = new ExamQuestion();
          examQuestion.questionId = questionId;
          examQuestion.examId = exam.examId;
          await examQuestion.save();
        }),
    ]);
    exam.numberOfQuestions = body.questionIds.length;
    await exam.save();
    return await this.getById(exam.examId);
  };

  deleteById = async (examId: number, user: CacheUser, permissionCode): Promise<any> => {
    let exam;
    const userRole = await RoleHelper.getRoleByUserId(user.userId);
    if (userRole.roleCode === 'ADMIN') {
      exam = await EXAM.findOne({ where: { examId } });
    } else {
      exam = await EXAM.findOne({ where: { examId, creatorId: user.userId } });
    }

    if (!exam) throw new App404Exception('id', { examId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    await exam.remove();
    return true;
  };

  addExamsForUser = async (userId, examIds, permissionCode) => {
    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    if (examIds.length === 0) throw new AppException(ERROR_MSG.HAVE_NOT_ANY_CHANGE);

    await this.dataSource.transaction(async (txEntityManager) => {
      await Promise.all(
        examIds.map(async (examId) => {
          const isExist = await ExamAttempt.findOneBy({ studentId: userId, examId: examId });
          if (isExist) return true;
          const examAttempt = new ExamAttempt();
          examAttempt.studentId = userId;
          examAttempt.examId = examId;
          return await txEntityManager.save(examAttempt);
        }),
      );

      return true;
    });
  };

  deleteExamAttempt = async (user: CacheUser, userExamId, permissionCode) => {
    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    let examAttempt;
    if (user.code === 'ADMIN') {
      examAttempt = await ExamAttempt.findOneBy({ userExamId });
    } else {
      examAttempt = await ExamAttempt.findOneBy({ userExamId, studentId: user.userId });
    }
    if (!examAttempt) throw new App404Exception('id', { userExamId });

    await examAttempt.remove();
  };

  getExamsSaved = async (examId) => {
    const examAttempts = await StudentAnswer.find({
      where: {
        examAttempt: {
          examId,
        },
      },
      relations: {
        examAttempt: true,
      },
    });

    if (!examAttempts) throw new App404Exception('examId', { examId });

    return examAttempts;
  };

  saveExamsSaved = async (userId, body: SaveExamDto[], score) => {
    const examAttempt = await ExamAttempt.findOne({
      where: {
        studentId: userId,
        examId: body[0].examId,
      },
    });

    if (!examAttempt) throw new App404Exception('examId', { examId: body[0].examId });

    await this.dataSource.transaction(async (txEntityManager) => {
      examAttempt.score = score;
      examAttempt.isFinished = true;
      await txEntityManager.save(examAttempt);

      const studentAnswers = await StudentAnswer.find({
        where: {
          examAttempt: {
            studentId: userId,
            examId: body[0].examId,
          },
        },
        relations: {
          examAttempt: true,
        },
      });

      if (studentAnswers.length === 0) {
        await Promise.all(
          body.map(async (item) => {
            const studentAnswer = new StudentAnswer();
            studentAnswer.questionId = item.questionId;
            studentAnswer.selectedAnswers = [...item.selectedAnswers];
            studentAnswer.answeredAt = new Date();
            studentAnswer.examAttemptId = examAttempt.userExamId;
            await studentAnswer.save();
          }),
        );
      } else {
        await Promise.all(
          body.map(async (item, index) => {
            const studentAnswer = await StudentAnswer.findOne({
              where: {
                questionId: item.questionId,
                examAttemptId: studentAnswers[index].examAttemptId,
              },
            });

            studentAnswer.selectedAnswers = [...item.selectedAnswers];
            studentAnswer.answeredAt = new Date();
            await studentAnswer.save();
          }),
        );
      }
    });
  };
}
