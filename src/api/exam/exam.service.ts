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
// import { ExamAttemptB } from './../../entitiesB/exam-attempt.entity';
import { ExamB } from './../../entitiesB/exam.entity';
import { ExamScoringDto, ResetExamDto } from 'src/dto/exam/exam-score.dto';
@Injectable()
export class ExamService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectDataSource('dbB') private readonly dataSourceB: DataSource) {}
  

  search = async (query: SearchExamDto): Promise<PageDto<EXAM>> => {
    const [data, itemCount] = await EXAM.findAndCount({
      select: {
        examId: true,
        name: true,
        classRoomId: true,
        createdDate: true,
        creatorId: true,
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

  getListExam = async (query: SearchExamAttemptDto) => {
    const examRepo = this.dataSourceB.getRepository(ExamB);
    const examAttemptRepo = this.dataSource.getRepository(ExamAttempt);
  
    // 1. Lấy toàn bộ bài kiểm tra (exam)
    const exams = await examRepo
      .createQueryBuilder("exam")
      .select(["exam.examId", "exam.name"])
      .getMany();

    // 2. Lấy toàn bộ exam attempt của user
    const examAttempts = await examAttemptRepo
      .createQueryBuilder("user_exam_mapping")
      .select([
        "user_exam_mapping.score",
        "user_exam_mapping.studentId",
        "user_exam_mapping.isFinished",
        "user_exam_mapping.examId",
      ])
      .where("user_exam_mapping.studentId = :studentId", { studentId: query.userId })
      .getMany();

    // 3. Gộp attempt theo examId
    const attemptMap: Record<number, any> = {};
  
    examAttempts.forEach(item => {
      if (!attemptMap[item.examId]) {
        attemptMap[item.examId] = {
          ...item,
          attemptCount: item.isFinished ? 1 : 0,
        };
      } else {
        const existing = attemptMap[item.examId];
  
        // Update score cao nhất
        if (item.score > existing.score) {
          existing.score = item.score;
        }
  
        // Nếu có lần nào finish thì isFinished = true
        if (item.isFinished) {
          existing.isFinished = true;
        }
  
        // Cộng thêm attemptCount nếu lần này finish
        existing.attemptCount += item.isFinished ? 1 : 0;
      }
    });
  
    // 4. Merge kết quả: bài đã làm + bài chưa làm
    const finalData = exams.map(exam => {
      const attempt = attemptMap[exam.examId];
  
      if (attempt) {
        return {
          studentId: attempt.studentId,
          examId: exam.examId,
          examName: exam.name,
          score: attempt.score,
          isFinished: attempt.isFinished,
          attemptCount: attempt.attemptCount,
        };
      } else {
        // Bài chưa làm
        return {
          studentId: query.userId,
          examId: exam.examId,
          examName: exam.name,
          score: 0,
          isFinished: false,
          attemptCount: 0,
        };
      }
    });
  
    // 5. Sắp xếp và paginate
    const validOrderFields = ["examId", "score", "studentId", "isFinished"];
    const orderField = query.orderBy && validOrderFields.includes(query.orderBy)
      ? query.orderBy
      : "examId";
  
    const orderDirection = query.sortBy?.toUpperCase() === "ASC" ? "ASC" : "DESC";
  
    finalData.sort((a, b) => {
      if (orderDirection === "ASC") {
        return a[orderField] > b[orderField] ? 1 : -1;
      } else {
        return a[orderField] < b[orderField] ? 1 : -1;
      }
    });
  
    const paginatedData = finalData.slice(query.skip, query.skip + query.take);

    return GenerateUtil.paginate({ data: paginatedData, itemCount: finalData.length, query });
  };
  
  
  async create(userId: number, body: CreateExamDto, permissionCode) {
    const isExistByName = await HelperUtils.existByName(EXAM, body.name, 'name');
    if (isExistByName) throw new AppExistedException('name', body);

    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const exam = new EXAM();
    await this.dataSource.transaction(async (txEntityManager) => {
      exam.name = body.name;
      exam.classRoomId = body.classRoomId;
      exam.private = body.private;
      exam.creatorId = userId;

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

  async examScoring(body: ExamScoringDto) {
    const { examId, score, userId, isFinished } = body;

    const examBRepo = this.dataSource.getRepository(ExamAttempt);
      await examBRepo
            .createQueryBuilder()
            .insert()
            .into(ExamAttempt)
            .values({
              studentId: userId,
              examId,
              score,
              isFinished
            })
            .execute();
    return { success: true };
  }

  async resetExam(examId: number, body: ResetExamDto) {
    const { userId } = body;
    
    const examAttemptRepo = this.dataSource.getRepository(ExamAttempt);
    
    // Check if the exam exists for this user
    const existingAttempts = await examAttemptRepo
      .createQueryBuilder("attempt")
      .where("attempt.studentId = :userId AND attempt.examId = :examId", 
             { userId, examId })
      .getMany();

    // Calculate current attempt count and highest score
    const finishedAttempts = existingAttempts.filter(attempt => attempt.isFinished);
    const attemptCount = finishedAttempts.length;
    
    // Find highest score
    let highestScore = 0;
    if (finishedAttempts.length > 0) {
      highestScore = Math.max(...finishedAttempts.map(attempt => attempt.score));
    }
    
    // Create a new attempt record with isFinished = false
    await examAttemptRepo
      .createQueryBuilder()
      .insert()
      .into(ExamAttempt)
      .values({
        studentId: userId,
        examId,
        score: 0,
        isFinished: false,
      })
      .execute();
    
    return { 
      success: true, 
      message: 'Exam reset successfully', 
      attemptCount, 
      highestScore 
    };
  }
}
