import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { CacheUser } from 'src/dto/common-request.dto';
import { RoleCode } from 'src/constant/role-code';
import { AppException, App404Exception } from 'src/middleware/app-error-handler';
import { ERROR_MSG } from 'src/constant/error';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
import { StudentAnswer } from 'src/entities/question/student-answer.entity';
import { Question } from 'src/entities/question/question.entity';
import { Answer } from 'src/entities/question/answer.entity';
import { EXAM } from 'src/entities/exam/exam.entity';
import { ExamVocabulary } from 'src/entities/exam/exam-vocabulary.entity';
import { ExamVideo } from 'src/entities/exam/exam-video.entity';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { ClassTeacher } from 'src/entities/class/class-teacher.entity';
import { User } from 'src/entities/user/user.entity';
import { ExamB } from 'src/entitiesB/exam.entity';
import {
  ExamStatisticsOverviewQueryDto,
  QuizExamStatisticsQueryDto,
  PracticeExamStatisticsQueryDto,
  MyStatisticsQueryDto,
  ExamType,
} from './dto/exam-statistics-filter.dto';
import {
  ExamStatisticsOverviewResponseDto,
  QuizExamStatisticsResponseDto,
  QuizResultDetailResponseDto,
  PracticeExamStatisticsResponseDto,
  PracticeResultDetailResponseDto,
  MyStatisticsResponseDto,
} from './dto/exam-statistics-response.dto';

@Injectable()
export class ExamStatisticsService {
  constructor(@InjectDataSource('dbB') private readonly dataSourceB: DataSource) {}

  async getOverview(
    user: CacheUser,
    query: ExamStatisticsOverviewQueryDto,
  ): Promise<ExamStatisticsOverviewResponseDto> {
    const { isAdmin, isTeacher } = this.ensureAdminOrTeacher(user);

    // Get teacher's classroom IDs if teacher
    let teacherClassIds: number[] = [];
    if (isTeacher && !isAdmin) {
      teacherClassIds = await this.getTeacherClassroomIds(user.userId);
    }

    // Build date range filter
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
    const toDate = query.toDate ? new Date(query.toDate) : undefined;

    // Fetch quiz exams from dbB
    const quizExamsData =
      query.examType === 'practice' ? [] : await this.fetchQuizExamsOverview(teacherClassIds, query.classroomId, fromDate, toDate);

    // Fetch practice exams from dbB
    const practiceExamsData =
      query.examType === 'quiz' ? [] : await this.fetchPracticeExamsOverview(teacherClassIds, query.classroomId, fromDate, toDate);

    // Calculate summary
    const summary = this.calculateOverviewSummary(quizExamsData, practiceExamsData);

    // Build chart data
    const chartData = this.buildOverviewChartData(quizExamsData, practiceExamsData);

    return {
      summary,
      quizExams: quizExamsData,
      practiceExams: practiceExamsData,
      chartData,
    };
  }

  async getQuizExamStatistics(
    user: CacheUser,
    examId: number,
    query: QuizExamStatisticsQueryDto,
  ): Promise<QuizExamStatisticsResponseDto> {
    const { isAdmin, isTeacher } = this.ensureAdminOrTeacher(user);

    // Check if teacher has access to this exam
    if (isTeacher && !isAdmin) {
      const hasAccess = await this.checkTeacherHasAccessToExam(user.userId, examId);
      if (!hasAccess) {
        throw new AppException({
          code: ERROR_MSG.PERMISSION_DENIED,
          message: 'You do not have access to this exam',
          status: HttpStatus.FORBIDDEN,
        });
      }
    }

    // Fetch exam info
    const examInfo = await this.fetchQuizExamInfo(examId);

    // Fetch student results with pagination
    const studentResultsData = await this.fetchQuizStudentResults(examId, query);

    // Calculate score distribution from all data (before pagination)
    const allStudentScores = await this.getAllQuizStudentScores(examId);
    const scoreDistribution = this.calculateScoreDistribution(allStudentScores);

    // Analyze questions
    const questionAnalysis = await this.analyzeQuizQuestions(examId);

    return {
      exam: examInfo,
      students: studentResultsData.data,
      totalStudents: studentResultsData.totalCount,
      pagination: {
        page: studentResultsData.page,
        take: studentResultsData.take,
        pageCount: studentResultsData.pageCount,
        totalCount: studentResultsData.totalCount,
      },
      scoreDistribution,
      questionAnalysis,
    };
  }

  async getQuizResultDetail(
    user: CacheUser,
    examId: number,
    userId: number,
  ): Promise<QuizResultDetailResponseDto> {
    this.validatePermissions(user, userId);

    // Get exam info
    const exam = await this.dataSourceB.getRepository(ExamB).findOne({
      where: { examId },
    });

    if (!exam) {
      throw new App404Exception('examId', { examId });
    }

    const questionCount = await Question.createQueryBuilder('question')
      .innerJoin('question.exams', 'examQuestion')
      .where('examQuestion.examId = :examId', { examId })
      .getCount();

    // Get student info
    const student = await User.findOne({
      where: { userId },
      relations: ['studentProfile'],
    });

    if (!student) {
      throw new App404Exception('userId', { userId });
    }

    // Get latest attempt for this student
    const attempt = await ExamAttempt.createQueryBuilder('attempt')
      .where('attempt.examId = :examId', { examId })
      .andWhere('attempt.studentId = :studentId', { studentId: userId })
      .orderBy('attempt.userExamId', 'DESC')
      .getOne();

    if (!attempt) {
      throw new AppException({
        code: 'NO_ATTEMPT_FOUND',
        message: 'No attempt found for this student',
        status: HttpStatus.NOT_FOUND,
      });
    }

    // Get all questions with student answers
    const questions = await this.fetchQuizResultQuestions(examId, attempt.userExamId);

    // Calculate summary
    const correctAnswers = questions.filter((q) => q.isCorrect).length;
    const wrongAnswers = questions.filter((q) => !q.isCorrect && q.selectedAnswers.length > 0).length;
    const unanswered = questions.filter((q) => q.selectedAnswers.length === 0).length;

    // Get the latest student answer timestamp as submission time
    const latestAnswer = await StudentAnswer.createQueryBuilder('sa')
      .where('sa.examAttemptId = :attemptId', { attemptId: attempt.userExamId })
      .orderBy('sa.answeredAt', 'DESC')
      .getOne();

    const submittedAt = latestAnswer?.answeredAt || latestAnswer?.createdDate || new Date();

    return {
      exam: {
        examId,
        examName: exam.name,
        totalQuestions: questionCount,
      },
      student: {
        studentId: userId,
        studentName: student.name,
        studentCode: student.studentProfile?.studentCode || '',
      },
      attempt: {
        userExamId: attempt.userExamId,
        score: attempt.score ? Number(attempt.score) : 0,
        isFinished: attempt.isFinished,
        submittedAt,
      },
      questions,
      summary: {
        totalQuestions: questionCount,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalScore: attempt.score ? Number(attempt.score) : 0,
        percentage: questionCount > 0 ? Number(((correctAnswers / questionCount) * 100).toFixed(2)) : 0,
      },
    };
  }

  async getPracticeExamStatistics(
    user: CacheUser,
    examId: number,
    query: PracticeExamStatisticsQueryDto,
  ): Promise<PracticeExamStatisticsResponseDto> {
    const { isAdmin, isTeacher } = this.ensureAdminOrTeacher(user);

    // Check if teacher has access to this exam
    if (isTeacher && !isAdmin) {
      const hasAccess = await this.checkTeacherHasAccessToExam(user.userId, examId);
      if (!hasAccess) {
        throw new AppException({
          code: ERROR_MSG.PERMISSION_DENIED,
          message: 'You do not have access to this exam',
          status: HttpStatus.FORBIDDEN,
        });
      }
    }

    // Fetch exam info from dbB
    const exam = await this.dataSourceB.getRepository(ExamB).findOne({
      where: { examId },
    });

    if (!exam) {
      throw new App404Exception('examId', { examId });
    }

    // Count vocabularies in this exam
    const vocabularyCount = await ExamVocabulary.count({ where: { examId } });

    // Get practice attempts
    const attempts = await PracticeExamAttempt.find({ where: { examId } });

    const totalAttempts = attempts.length;
    const gradedAttempts = attempts.filter((a) => a.score !== null && a.score !== undefined);
    const gradedCount = gradedAttempts.length;
    const pendingCount = totalAttempts - gradedCount;

    const averageScore =
      gradedCount > 0
        ? Number((gradedAttempts.reduce((sum, a) => sum + Number(a.score || 0), 0) / gradedCount).toFixed(2))
        : 0;

    // Fetch student results with pagination
    const studentResultsData = await this.fetchPracticeStudentResults(examId, query);

    // Calculate score distribution from all data (before pagination)
    const allStudentScores = await this.getAllPracticeStudentScores(examId);
    const ungradedCount = allStudentScores.filter((s) => s === null).length;
    const scoreDistribution = {
      ...this.calculateScoreDistribution(allStudentScores),
      ungraded: ungradedCount,
    };

    // Analyze vocabularies
    const vocabularyAnalysis = await this.analyzePracticeVocabularies(examId);

    return {
      exam: {
        examId,
        examName: exam.name,
        vocabularyCount,
        totalAttempts,
        averageScore,
        gradedCount,
        pendingCount,
      },
      students: studentResultsData.data,
      totalStudents: studentResultsData.totalCount,
      pagination: {
        page: studentResultsData.page,
        take: studentResultsData.take,
        pageCount: studentResultsData.pageCount,
        totalCount: studentResultsData.totalCount,
      },
      scoreDistribution,
      vocabularyAnalysis,
    };
  }

  async getPracticeResultDetail(
    user: CacheUser,
    examId: number,
    userId: number,
  ): Promise<PracticeResultDetailResponseDto> {
    this.validatePermissions(user, userId);

    // Get exam info
    const exam = await this.dataSourceB.getRepository(ExamB).findOne({
      where: { examId },
    });

    if (!exam) {
      throw new App404Exception('examId', { examId });
    }

    const vocabularyCount = await ExamVocabulary.count({ where: { examId } });

    // Get student info
    const student = await User.findOne({
      where: { userId },
      relations: ['studentProfile'],
    });

    if (!student) {
      throw new App404Exception('userId', { userId });
    }

    // Get latest practice attempt for this student
    const attempt = await PracticeExamAttempt.createQueryBuilder('attempt')
      .where('attempt.examId = :examId', { examId })
      .andWhere('attempt.studentId = :studentId', { studentId: userId })
      .orderBy('attempt.userPracticeId', 'DESC')
      .getOne();

    if (!attempt) {
      throw new AppException({
        code: 'NO_ATTEMPT_FOUND',
        message: 'No attempt found for this student',
        status: HttpStatus.NOT_FOUND,
      });
    }

    // Get vocabularies with videos
    const vocabularies = await this.fetchPracticeResultVocabularies(examId, userId);

    // Calculate summary
    const videosSubmitted = vocabularies.filter((v) => v.videoUrl).length;
    const aiMatchCount = vocabularies.filter((v) => v.aiMatched).length;
    const aiAccuracy = vocabularyCount > 0 ? Number(((aiMatchCount / vocabularyCount) * 100).toFixed(2)) : 0;

    const isGraded = attempt.score !== null && attempt.score !== undefined;

    return {
      exam: {
        examId,
        examName: exam.name,
        vocabularyCount,
      },
      student: {
        studentId: userId,
        studentName: student.name,
        studentCode: student.studentProfile?.studentCode || '',
      },
      attempt: {
        userPracticeId: attempt.userPracticeId,
        score: attempt.score ? Number(attempt.score) : undefined,
        isFinished: attempt.isFinished,
        isGraded,
        submittedAt: attempt.createdDate || new Date(),
        gradedAt: isGraded ? attempt.createdDate : undefined,
      },
      vocabularies,
      summary: {
        totalVocabularies: vocabularyCount,
        videosSubmitted,
        aiMatchCount,
        aiAccuracy,
        totalScore: attempt.score ? Number(attempt.score) : undefined,
        isGraded,
      },
    };
  }

  async getMyStatistics(user: CacheUser, query: MyStatisticsQueryDto): Promise<MyStatisticsResponseDto> {
    const userId = user.userId;

    // Get student info
    const student = await User.findOne({
      where: { userId },
      relations: ['studentProfile'],
    });

    if (!student) {
      throw new App404Exception('userId', { userId });
    }

    // Build date range
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
    const toDate = query.toDate ? new Date(query.toDate) : undefined;

    // Fetch quiz attempts
    let quizAttempts: any[] = [];
    if (query.examType !== ExamType.PRACTICE) {
      quizAttempts = await this.fetchMyQuizAttempts(userId, fromDate, toDate);
    }

    // Fetch practice attempts
    let practiceAttempts: any[] = [];
    if (query.examType !== ExamType.QUIZ) {
      practiceAttempts = await this.fetchMyPracticeAttempts(userId, fromDate, toDate);
    }

    // Build quiz exams stats
    const quizExamsStats = this.buildQuizExamsStats(quizAttempts);

    // Build practice exams stats
    const practiceExamsStats = await this.buildPracticeExamsStats(practiceAttempts);

    // Build progress chart
    const progressChart = this.buildProgressChart(quizAttempts, practiceAttempts);

    // Build performance trend
    const performanceTrend = this.buildPerformanceTrend(quizAttempts, practiceAttempts, fromDate, toDate);

    return {
      student: {
        userId,
        name: student.name,
        studentCode: student.studentProfile?.studentCode || '',
      },
      quizExams: quizExamsStats,
      practiceExams: practiceExamsStats,
      progressChart,
      performanceTrend,
    };
  }

  // ========== HELPER METHODS ==========

  private async fetchMyQuizAttempts(userId: number, fromDate?: Date, toDate?: Date) {
    const qb = ExamAttempt.createQueryBuilder('attempt')
      .innerJoin('attempt.exam', 'exam')
      .select([
        'attempt.userExamId AS userExamId',
        'attempt.examId AS examId',
        'attempt.score AS score',
        'attempt.isFinished AS isFinished',
        'exam.name AS examName',
      ])
      .where('attempt.studentId = :userId', { userId });

    if (fromDate) {
      qb.andWhere('attempt.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('attempt.createdAt <= :toDate', { toDate });
    }

    const results = await qb.orderBy('attempt.userExamId', 'ASC').getRawMany();

    if (!results.length) return [];

    // Get unique exam IDs and fetch question counts in batch
    const examIds = [...new Set(results.map((r) => Number(r.examId)))];
    const questionCountMap = new Map<number, number>();

    for (const examId of examIds) {
      const count = await Question.createQueryBuilder('question')
        .innerJoin('question.exams', 'examQuestion')
        .where('examQuestion.examId = :examId', { examId })
        .getCount();
      questionCountMap.set(examId, count);
    }

    // Get correct answers for each attempt
    const enriched = await Promise.all(
      results.map(async (result) => {
        const correctAnswers = await this.countCorrectAnswers(result.userExamId, result.examId);
        const questionCount = questionCountMap.get(Number(result.examId)) || 0;

        return {
          examId: Number(result.examId),
          examName: result.examName,
          score: result.score ? Number(result.score) : 0,
          isFinished: !!result.isFinished,
          correctAnswers,
          totalQuestions: questionCount,
        };
      }),
    );

    return enriched;
  }

  private async fetchMyPracticeAttempts(userId: number, fromDate?: Date, toDate?: Date) {
    const qb = PracticeExamAttempt.createQueryBuilder('attempt')
      .select(['attempt.userPracticeId', 'attempt.examId', 'attempt.score', 'attempt.isFinished', 'attempt.createdDate'])
      .where('attempt.studentId = :userId', { userId });

    if (fromDate) {
      qb.andWhere('attempt.createdDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('attempt.createdDate <= :toDate', { toDate });
    }

    const results = await qb.orderBy('attempt.createdDate', 'ASC').getRawMany();

    // Get exam names from dbB
    const examIds = results.map((r) => Number(r.attempt_examId)).filter(Boolean);
    let examMap = new Map<number, string>();
    if (examIds.length) {
      const exams = await this.dataSourceB.getRepository(ExamB).find({
        where: { examId: In(examIds) },
      });
      examMap = new Map(exams.map((e) => [Number(e.examId), e.name]));
    }

    return results.map((result) => ({
      examId: Number(result.attempt_examId),
      examName: examMap.get(Number(result.attempt_examId)) || 'Practice Exam',
      score: result.attempt_score ? Number(result.attempt_score) : null,
      isFinished: !!result.attempt_isFinished,
      isGraded: result.attempt_score !== null,
    }));
  }

  private buildQuizExamsStats(attempts: any[]) {
    const groupedByExam = new Map<number, any[]>();
    attempts.forEach((attempt) => {
      if (!groupedByExam.has(attempt.examId)) {
        groupedByExam.set(attempt.examId, []);
      }
      groupedByExam.get(attempt.examId)!.push(attempt);
    });

    const exams = Array.from(groupedByExam.entries()).map(([examId, examAttempts]) => {
      const latest = examAttempts[examAttempts.length - 1];
      return {
        examId,
        examName: latest.examName,
        score: latest.score,
        percentage: latest.totalQuestions > 0 ? Number(((latest.correctAnswers / latest.totalQuestions) * 100).toFixed(2)) : 0,
        correctAnswers: latest.correctAnswers,
        totalQuestions: latest.totalQuestions,
        attemptCount: examAttempts.length,
        lastSubmittedAt: latest.submittedAt || new Date(),
      };
    });

    const completedExams = exams.filter((e) => e.score > 0).length;
    const scores = exams.map((e) => e.score).filter((s) => s > 0);
    const averageScore = scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0;
    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore = scores.length ? Math.min(...scores) : 0;

    return {
      totalAttempts: attempts.length,
      completedExams,
      averageScore,
      highestScore,
      lowestScore,
      exams,
    };
  }

  private async buildPracticeExamsStats(attempts: any[]) {
    const groupedByExam = new Map<number, any[]>();
    attempts.forEach((attempt) => {
      if (!groupedByExam.has(attempt.examId)) {
        groupedByExam.set(attempt.examId, []);
      }
      groupedByExam.get(attempt.examId)!.push(attempt);
    });

    // Batch fetch vocabulary counts for all exams
    const examIds = Array.from(groupedByExam.keys());
    const vocabularyCountMap = new Map<number, number>();
    for (const examId of examIds) {
      const count = await ExamVocabulary.count({ where: { examId } });
      vocabularyCountMap.set(examId, count);
    }

    const exams = Array.from(groupedByExam.entries()).map(([examId, examAttempts]) => {
      const latest = examAttempts[examAttempts.length - 1];
      return {
        examId,
        examName: latest.examName,
        score: latest.score,
        isGraded: latest.isGraded,
        vocabularyCount: vocabularyCountMap.get(examId) || 0,
        attemptCount: examAttempts.length,
        lastSubmittedAt: latest.createdDate || new Date(),
      };
    });

    const gradedExams = exams.filter((e) => e.isGraded).length;
    const pendingExams = exams.length - gradedExams;
    const scores = exams.map((e) => e.score).filter((s) => s !== null && s > 0) as number[];
    const averageScore = scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0;
    const highestScore = scores.length ? Math.max(...scores) : 0;

    // Calculate overall AI accuracy from attempts
    let totalAiMatches = 0;
    let totalVideos = 0;
    for (const attempt of attempts) {
      if (attempt.aiMatchCount !== undefined && attempt.totalVideos !== undefined) {
        totalAiMatches += attempt.aiMatchCount;
        totalVideos += attempt.totalVideos;
      }
    }
    const aiAccuracy = totalVideos > 0 ? Number(((totalAiMatches / totalVideos) * 100).toFixed(2)) : 0;

    return {
      totalAttempts: attempts.length,
      gradedExams,
      pendingExams,
      averageScore,
      highestScore,
      aiAccuracy,
      exams,
    };
  }

  private buildProgressChart(quizAttempts: any[], practiceAttempts: any[]) {
    const labels: string[] = [];
    const quizScores: number[] = [];
    const practiceScores: number[] = [];

    quizAttempts.forEach((attempt) => {
      labels.push(attempt.examName);
      quizScores.push(attempt.score);
      practiceScores.push(0);
    });

    practiceAttempts.forEach((attempt) => {
      labels.push(attempt.examName);
      quizScores.push(0);
      practiceScores.push(attempt.score || 0);
    });

    return { labels, quizScores, practiceScores };
  }

  private buildPerformanceTrend(
    quizAttempts: any[],
    practiceAttempts: any[],
    fromDate?: Date,
    toDate?: Date,
  ) {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const calculateAverage = (attempts: any[], periodFromDate?: Date) => {
      const filtered = periodFromDate
        ? attempts.filter((a) => {
            const attemptDate = a.submittedAt || a.createdDate;
            if (!attemptDate) return true;
            return new Date(attemptDate) >= periodFromDate;
          })
        : attempts;
      const scores = filtered.map((a) => a.score).filter((s) => s !== null && s > 0);
      return scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0;
    };

    return {
      last7Days: {
        quizAvg: calculateAverage(quizAttempts, last7Days),
        practiceAvg: calculateAverage(practiceAttempts, last7Days),
      },
      last30Days: {
        quizAvg: calculateAverage(quizAttempts, last30Days),
        practiceAvg: calculateAverage(practiceAttempts, last30Days),
      },
      overall: {
        quizAvg: calculateAverage(quizAttempts),
        practiceAvg: calculateAverage(practiceAttempts),
      },
    };
  }

  private async fetchQuizExamsOverview(
    teacherClassIds: number[],
    classroomId: number | undefined,
    fromDate: Date | undefined,
    toDate: Date | undefined,
  ) {
    const qb = ExamAttempt.createQueryBuilder('attempt')
      .innerJoin('attempt.exam', 'exam')
      .leftJoin('exam.classroom', 'classroom')
      .leftJoin('attempt.student', 'student')
      .select('exam.examId', 'examId')
      .addSelect('exam.name', 'examName')
      .addSelect('exam.classRoomId', 'classroomId')
      .addSelect('classroom.name', 'classroomName')
      .addSelect('COUNT(DISTINCT attempt.studentId)', 'totalStudents')
      .addSelect('AVG(CASE WHEN attempt.isFinished = 1 THEN attempt.score ELSE NULL END)', 'averageScore')
      .addSelect('MAX(CASE WHEN attempt.isFinished = 1 THEN attempt.score ELSE NULL END)', 'highestScore')
      .addSelect('MIN(CASE WHEN attempt.isFinished = 1 THEN attempt.score ELSE NULL END)', 'lowestScore')
      .addSelect('COUNT(DISTINCT CASE WHEN attempt.isFinished = 1 THEN attempt.studentId END)', 'completedStudents')
      .groupBy('exam.examId');

    if (teacherClassIds.length) {
      qb.andWhere('exam.classRoomId IN (:...teacherClassIds)', { teacherClassIds });
    }

    if (classroomId) {
      qb.andWhere('exam.classRoomId = :classroomId', { classroomId });
    }

    if (fromDate) {
      qb.andWhere('attempt.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('attempt.createdAt <= :toDate', { toDate });
    }

    const rows = await qb.getRawMany();

    return rows.map((row) => ({
      examId: Number(row.examId),
      examName: row.examName,
      classroomId: Number(row.classroomId),
      classroomName: row.classroomName || 'Unknown',
      totalStudents: Number(row.totalStudents) || 0,
      averageScore: row.averageScore ? Number(Number(row.averageScore).toFixed(2)) : 0,
      highestScore: row.highestScore ? Number(Number(row.highestScore).toFixed(2)) : 0,
      lowestScore: row.lowestScore ? Number(Number(row.lowestScore).toFixed(2)) : 0,
      completionRate:
        Number(row.totalStudents) > 0
          ? Number(((Number(row.completedStudents) / Number(row.totalStudents)) * 100).toFixed(2))
          : 0,
    }));
  }

  private async fetchPracticeExamsOverview(
    teacherClassIds: number[],
    classroomId: number | undefined,
    fromDate: Date | undefined,
    toDate: Date | undefined,
  ) {
    const qb = PracticeExamAttempt.createQueryBuilder('attempt')
      .select('attempt.examId', 'examId')
      .addSelect('COUNT(DISTINCT attempt.studentId)', 'totalStudents')
      .addSelect('AVG(CASE WHEN attempt.isFinished = 1 AND attempt.score IS NOT NULL THEN attempt.score ELSE NULL END)', 'averageScore')
      .addSelect('MAX(CASE WHEN attempt.isFinished = 1 AND attempt.score IS NOT NULL THEN attempt.score ELSE NULL END)', 'highestScore')
      .addSelect('MIN(CASE WHEN attempt.isFinished = 1 AND attempt.score IS NOT NULL THEN attempt.score ELSE NULL END)', 'lowestScore')
      .addSelect('COUNT(DISTINCT CASE WHEN attempt.isFinished = 1 THEN attempt.studentId END)', 'completedStudents')
      .groupBy('attempt.examId');

    if (fromDate) {
      qb.andWhere('attempt.createdDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('attempt.createdDate <= :toDate', { toDate });
    }

    const rows = await qb.getRawMany();
    const examIds = rows.map((r) => Number(r.examId)).filter(Boolean);

    if (!examIds.length) return [];

    // Fetch exam details from dbB
    const exams = await this.dataSourceB.getRepository(ExamB).find({
      where: { examId: In(examIds) },
    });

    const examMap = new Map(exams.map((e) => [Number(e.examId), e]));

    // Filter by teacher classrooms and requested classroom
    let filteredRows = rows;
    if (teacherClassIds.length || classroomId) {
      filteredRows = rows.filter((row) => {
        const exam = examMap.get(Number(row.examId));
        if (!exam) return false;
        if (classroomId && Number(exam.classRoomId) !== classroomId) return false;
        if (teacherClassIds.length && !teacherClassIds.includes(Number(exam.classRoomId))) return false;
        return true;
      });
    }

    // Get classroom names
    const classroomIds = Array.from(new Set(exams.map((e) => Number(e.classRoomId)).filter(Boolean)));
    let classroomMap = new Map<number, string>();
    if (classroomIds.length) {
      const classrooms = await ClassRoom.find({ where: { classroomId: In(classroomIds) } });
      classroomMap = new Map(classrooms.map((c) => [Number(c.classroomId), c.name]));
    }

    return filteredRows.map((row) => {
      const exam = examMap.get(Number(row.examId));
      return {
        examId: Number(row.examId),
        examName: exam?.name || 'Practice Exam',
        classroomId: exam?.classRoomId ? Number(exam.classRoomId) : 0,
        classroomName: exam?.classRoomId ? classroomMap.get(Number(exam.classRoomId)) || 'Unknown' : 'Unknown',
        totalStudents: Number(row.totalStudents) || 0,
        averageScore: row.averageScore ? Number(Number(row.averageScore).toFixed(2)) : 0,
        highestScore: row.highestScore ? Number(Number(row.highestScore).toFixed(2)) : 0,
        lowestScore: row.lowestScore ? Number(Number(row.lowestScore).toFixed(2)) : 0,
        completionRate:
          Number(row.totalStudents) > 0
            ? Number(((Number(row.completedStudents) / Number(row.totalStudents)) * 100).toFixed(2))
            : 0,
      };
    });
  }

  private calculateOverviewSummary(quizExams: any[], practiceExams: any[]) {
    const totalQuizAttempts = quizExams.reduce((sum, e) => sum + e.totalStudents, 0);
    const totalPracticeAttempts = practiceExams.reduce((sum, e) => sum + e.totalStudents, 0);

    const quizScores = quizExams.map((e) => e.averageScore).filter((s) => s > 0);
    const practiceScores = practiceExams.map((e) => e.averageScore).filter((s) => s > 0);

    const avgQuiz = quizScores.length ? Number((quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(2)) : 0;
    const avgPractice = practiceScores.length
      ? Number((practiceScores.reduce((a, b) => a + b, 0) / practiceScores.length).toFixed(2))
      : 0;

    const totalAttempts = totalQuizAttempts + totalPracticeAttempts;
    const totalCompleted = quizExams.reduce((sum, e) => sum + (e.totalStudents * e.completionRate) / 100, 0) +
      practiceExams.reduce((sum, e) => sum + (e.totalStudents * e.completionRate) / 100, 0);

    return {
      totalQuizExams: quizExams.length,
      totalPracticeExams: practiceExams.length,
      totalAttempts,
      totalGraded: Math.round(totalCompleted),
      totalPending: Math.round(totalAttempts - totalCompleted),
      averageQuizScore: avgQuiz,
      averagePracticeScore: avgPractice,
      overallCompletionRate: totalAttempts > 0 ? Number(((totalCompleted / totalAttempts) * 100).toFixed(2)) : 0,
    };
  }

  private buildOverviewChartData(quizExams: any[], practiceExams: any[]) {
    const labels: string[] = [];
    const quizScores: number[] = [];
    const practiceScores: number[] = [];

    quizExams.forEach((exam) => {
      labels.push(exam.examName);
      quizScores.push(exam.averageScore);
      practiceScores.push(0);
    });

    practiceExams.forEach((exam) => {
      labels.push(exam.examName);
      quizScores.push(0);
      practiceScores.push(exam.averageScore);
    });

    return { labels, quizScores, practiceScores };
  }

  private async fetchQuizExamInfo(examId: number) {
    const exam = await this.dataSourceB.getRepository(ExamB).findOne({
      where: { examId },
    });

    if (!exam) {
      throw new App404Exception('examId', { examId });
    }

    // Count questions
    const questionCount = await Question.createQueryBuilder('question')
      .innerJoin('question.exams', 'examQuestion')
      .where('examQuestion.examId = :examId', { examId })
      .getCount();

    // Count total attempts
    const totalAttempts = await ExamAttempt.count({ where: { examId } });

    // Calculate average score and pass rate
    const stats = await ExamAttempt.createQueryBuilder('attempt')
      .select('AVG(CASE WHEN attempt.isFinished = 1 AND attempt.score IS NOT NULL THEN attempt.score ELSE NULL END)', 'averageScore')
      .addSelect('COUNT(CASE WHEN attempt.isFinished = 1 AND attempt.score >= 5 THEN 1 END)', 'passedCount')
      .addSelect('COUNT(CASE WHEN attempt.isFinished = 1 THEN 1 END)', 'finishedCount')
      .where('attempt.examId = :examId', { examId })
      .getRawOne();

    const averageScore = stats.averageScore ? Number(Number(stats.averageScore).toFixed(2)) : 0;
    const passRate =
      Number(stats.finishedCount) > 0 ? Number(((Number(stats.passedCount) / Number(stats.finishedCount)) * 100).toFixed(2)) : 0;

    return {
      examId,
      examName: exam.name,
      questionCount,
      totalAttempts,
      averageScore,
      passRate,
    };
  }

  private async fetchQuizStudentResults(examId: number, query: QuizExamStatisticsQueryDto) {
    // Get question count once for this exam (not per student)
    const questionCount = await Question.createQueryBuilder('question')
      .innerJoin('question.exams', 'examQuestion')
      .where('examQuestion.examId = :examId', { examId })
      .getCount();

    // Get latest attempt per student
    const subQuery = ExamAttempt.createQueryBuilder('sub')
      .select('MAX(sub.userExamId)', 'latestAttemptId')
      .where('sub.examId = :examId', { examId })
      .groupBy('sub.studentId')
      .getQuery();

    const qb = ExamAttempt.createQueryBuilder('attempt')
      .innerJoin('attempt.student', 'student')
      .leftJoin('student.studentProfile', 'profile')
      .leftJoin('student.classStudents', 'classStudent')
      .leftJoin('classStudent.classroom', 'classroom')
      .select([
        'attempt.userExamId AS userExamId',
        'student.userId AS studentId',
        'student.name AS studentName',
        'profile.studentCode AS studentCode',
        'classroom.classroomId AS classroomId',
        'classroom.name AS classroomName',
        'attempt.score AS score',
        'attempt.isFinished AS isFinished',
      ])
      .where(`attempt.userExamId IN (${subQuery})`)
      .setParameter('examId', examId);

    if (query.classroomId) {
      qb.andWhere('classroom.classroomId = :classroomId', { classroomId: query.classroomId });
    }

    const results = await qb.getRawMany();

    // Batch get attempt counts for all students
    const studentIds = results.map((r) => Number(r.studentId));
    const attemptCountMap = new Map<number, number>();
    if (studentIds.length) {
      const attemptCounts = await ExamAttempt.createQueryBuilder('attempt')
        .select('attempt.studentId', 'studentId')
        .addSelect('COUNT(*)', 'count')
        .where('attempt.examId = :examId', { examId })
        .andWhere('attempt.studentId IN (:...studentIds)', { studentIds })
        .groupBy('attempt.studentId')
        .getRawMany();

      attemptCounts.forEach((ac) => {
        attemptCountMap.set(Number(ac.studentId), Number(ac.count));
      });
    }

    // Batch get latest submission timestamps
    const attemptIds = results.map((r) => Number(r.userExamId));
    const timestampMap = new Map<number, Date>();
    if (attemptIds.length) {
      const timestamps = await StudentAnswer.createQueryBuilder('sa')
        .select('sa.examAttemptId', 'attemptId')
        .addSelect('MAX(sa.answeredAt)', 'lastAnsweredAt')
        .where('sa.examAttemptId IN (:...attemptIds)', { attemptIds })
        .groupBy('sa.examAttemptId')
        .getRawMany();

      timestamps.forEach((ts) => {
        timestampMap.set(Number(ts.attemptId), ts.lastAnsweredAt || new Date());
      });
    }

    // Enrich results with correct answers
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        const correctAnswers = await this.countCorrectAnswers(result.userExamId, examId);
        const attemptCount = attemptCountMap.get(Number(result.studentId)) || 1;
        const lastSubmittedAt = timestampMap.get(Number(result.userExamId)) || new Date();

        return {
          studentId: Number(result.studentId),
          studentName: result.studentName || '',
          studentCode: result.studentCode || '',
          classroomId: result.classroomId ? Number(result.classroomId) : 0,
          classroomName: result.classroomName || 'No classroom',
          score: result.score ? Number(result.score) : 0,
          correctAnswers,
          totalQuestions: questionCount,
          percentage: questionCount > 0 ? Number(((correctAnswers / questionCount) * 100).toFixed(2)) : 0,
          isFinished: !!result.isFinished,
          attemptCount,
          lastSubmittedAt,
        };
      }),
    );

    // Apply sorting
    const orderBy = query.orderBy || 'score';
    const sortBy = query.sortBy || 'DESC';

    enrichedResults.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (orderBy) {
        case 'score':
          aVal = a.score;
          bVal = b.score;
          break;
        case 'name':
          aVal = a.studentName;
          bVal = b.studentName;
          break;
        case 'submittedAt':
          aVal = a.lastSubmittedAt.getTime();
          bVal = b.lastSubmittedAt.getTime();
          break;
        default:
          aVal = a.score;
          bVal = b.score;
      }

      if (sortBy === 'ASC') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = enrichedResults.length;
    const page = query.page || 0;
    const take = query.take || 10;
    const skip = page * take;
    const paginatedResults = enrichedResults.slice(skip, skip + take);

    return {
      data: paginatedResults,
      totalCount,
      page,
      take,
      pageCount: Math.ceil(totalCount / take),
    };
  }

  private async countCorrectAnswers(attemptId: number, examId: number): Promise<number> {
    const studentAnswers = await StudentAnswer.find({
      where: { examAttemptId: attemptId },
      relations: ['question'],
    });

    let correctCount = 0;

    for (const studentAnswer of studentAnswers) {
      const allAnswers = await Answer.find({
        where: { questionId: studentAnswer.questionId },
      });

      const correctAnswerIds = allAnswers
        .filter((a) => a.correct && a.correct[0] === 1)
        .map((a) => Number(a.answerId));
      const selectedIds = studentAnswer.selectedAnswers || [];

      const questionType = studentAnswer.question.questionType;
      const isCorrect = this.checkAnswerCorrectness(selectedIds, correctAnswerIds, questionType);

      if (isCorrect) correctCount++;
    }

    return correctCount;
  }

  private async fetchPracticeResultVocabularies(examId: number, userId: number) {
    const examVocabularies = await ExamVocabulary.find({
      where: { examId },
      relations: ['vocabulary'],
      order: { vocabularyExamId: 'ASC' },
    });

    // Get all videos for this exam and user
    const videos = await ExamVideo.find({
      where: { examId, userId },
    });

    const vocabularyDetails = examVocabularies.map((examVocab, index) => {
      // Match video by index (assumption: videos are submitted in order)
      const video = videos[index];

      const vocabularyContent = examVocab.vocabulary?.content || examVocab.content || 'Unknown';
      const aiAnswer = video?.aiAnswer || null;
      const aiMatched = !!(aiAnswer && aiAnswer.trim() !== '');

      return {
        vocabularyId: examVocab.vocabularyId,
        vocabularyContent,
        instruction: `Biểu diễn - ${vocabularyContent}`,
        videoUrl: video?.videoUrl || '',
        aiAnswer,
        aiMatched,
      };
    });

    return vocabularyDetails;
  }

  private async fetchPracticeStudentResults(examId: number, query: PracticeExamStatisticsQueryDto) {
    // Get latest attempt per student
    const subQuery = PracticeExamAttempt.createQueryBuilder('sub')
      .select('MAX(sub.userPracticeId)', 'latestAttemptId')
      .where('sub.examId = :examId', { examId })
      .groupBy('sub.studentId')
      .getQuery();

    const qb = PracticeExamAttempt.createQueryBuilder('attempt')
      .innerJoin('attempt.student', 'student')
      .leftJoin('student.studentProfile', 'profile')
      .leftJoin('student.classStudents', 'classStudent')
      .leftJoin('classStudent.classroom', 'classroom')
      .select([
        'attempt.userPracticeId AS userPracticeId',
        'student.userId AS studentId',
        'student.name AS studentName',
        'profile.studentCode AS studentCode',
        'classroom.classroomId AS classroomId',
        'classroom.name AS classroomName',
        'attempt.score AS score',
        'attempt.isFinished AS isFinished',
        'attempt.createdDate AS createdDate',
      ])
      .where(`attempt.userPracticeId IN (${subQuery})`)
      .setParameter('examId', examId);

    if (query.classroomId) {
      qb.andWhere('classroom.classroomId = :classroomId', { classroomId: query.classroomId });
    }

    if (query.gradingStatus === 'graded') {
      qb.andWhere('attempt.score IS NOT NULL');
    } else if (query.gradingStatus === 'pending') {
      qb.andWhere('attempt.score IS NULL');
    }

    const results = await qb.getRawMany();

    // Enrich with AI accuracy and video count
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        // Count videos submitted
        const videoCount = await ExamVideo.count({
          where: { examId, userId: result.studentId },
        });

        // Calculate AI accuracy
        const aiAccuracy = await this.calculateAIAccuracy(examId, result.studentId);

        // Count total attempts for this student
        const attemptCount = await PracticeExamAttempt.count({
          where: { examId, studentId: result.studentId },
        });

        const isGraded = result.score !== null && result.score !== undefined;

        return {
          studentId: Number(result.studentId),
          studentName: result.studentName || '',
          studentCode: result.studentCode || '',
          classroomId: result.classroomId ? Number(result.classroomId) : 0,
          classroomName: result.classroomName || 'No classroom',
          score: result.score ? Number(result.score) : undefined,
          isFinished: !!result.isFinished,
          isGraded,
          attemptCount,
          lastSubmittedAt: result.createdDate || new Date(),
          gradedAt: isGraded ? result.createdDate : undefined,
          aiAccuracy,
          videoCount,
        };
      }),
    );

    // Apply sorting
    const orderBy = query.orderBy || 'score';
    const sortBy = query.sortBy || 'DESC';

    enrichedResults.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (orderBy) {
        case 'score':
          aVal = a.score || 0;
          bVal = b.score || 0;
          break;
        case 'name':
          aVal = a.studentName;
          bVal = b.studentName;
          break;
        case 'submittedAt':
          aVal = a.lastSubmittedAt.getTime();
          bVal = b.lastSubmittedAt.getTime();
          break;
        default:
          aVal = a.score || 0;
          bVal = b.score || 0;
      }

      if (sortBy === 'ASC') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = enrichedResults.length;
    const page = query.page || 0;
    const take = query.take || 10;
    const skip = page * take;
    const paginatedResults = enrichedResults.slice(skip, skip + take);

    return {
      data: paginatedResults,
      totalCount,
      page,
      take,
      pageCount: Math.ceil(totalCount / take),
    };
  }

  private async analyzePracticeVocabularies(examId: number) {
    const examVocabularies = await ExamVocabulary.find({
      where: { examId },
      relations: ['vocabulary'],
    });

    // Get all videos for this exam
    const allVideos = await ExamVideo.find({
      where: { examId },
    });

    // Group videos by user
    const videosByUser = new Map<number, ExamVideo[]>();
    allVideos.forEach((video) => {
      if (!videosByUser.has(video.userId)) {
        videosByUser.set(video.userId, []);
      }
      videosByUser.get(video.userId)!.push(video);
    });

    const analysis = examVocabularies.map((examVocab, index) => {
      let totalSubmissions = 0;
      let aiMatchCount = 0;

      // Count submissions and matches for this vocabulary position
      videosByUser.forEach((userVideos) => {
        const video = userVideos[index];
        if (video) {
          totalSubmissions++;
          if (video.aiAnswer && video.aiAnswer.trim() !== '') {
            aiMatchCount++;
          }
        }
      });

      const aiMatchRate = totalSubmissions > 0 ? Number(((aiMatchCount / totalSubmissions) * 100).toFixed(2)) : 0;

      return {
        vocabularyId: examVocab.vocabularyId,
        content: examVocab.vocabulary?.content || examVocab.content || 'Unknown',
        instruction: `Biểu diễn - ${examVocab.vocabulary?.content || examVocab.content || 'Unknown'}`,
        totalSubmissions,
        aiMatchRate,
      };
    });

    return analysis;
  }

  private async fetchQuizResultQuestions(examId: number, attemptId: number) {
    // Get all questions for this exam
    const questions = await Question.createQueryBuilder('question')
      .innerJoin('question.exams', 'examQuestion')
      .where('examQuestion.examId = :examId', { examId })
      .orderBy('question.questionId', 'ASC')
      .getMany();

    // Get student answers for this attempt
    const studentAnswers = await StudentAnswer.find({
      where: { examAttemptId: attemptId },
    });

    const studentAnswerMap = new Map(studentAnswers.map((sa) => [Number(sa.questionId), sa]));

    // Build question details
    const questionDetails = await Promise.all(
      questions.map(async (question) => {
        const studentAnswer = studentAnswerMap.get(Number(question.questionId));
        const selectedIds = studentAnswer?.selectedAnswers || [];

        // Get all answers for this question
        const allAnswers = await Answer.find({
          where: { questionId: question.questionId },
          order: { answerId: 'ASC' },
        });

        const correctAnswerIds = allAnswers.filter((a) => a.correct && a.correct[0] === 1).map((a) => Number(a.answerId));

        // Build selected answers
        const selectedAnswers = allAnswers
          .filter((a) => selectedIds.includes(Number(a.answerId)))
          .map((a) => ({
            answerId: Number(a.answerId),
            content: a.content,
            isCorrect: a.correct && a.correct[0] === 1,
            isSelected: true,
          }));

        // Build correct answers
        const correctAnswers = allAnswers
          .filter((a) => a.correct && a.correct[0] === 1)
          .map((a) => ({
            answerId: Number(a.answerId),
            content: a.content,
            isCorrect: true,
            isSelected: selectedIds.includes(Number(a.answerId)),
          }));

        // Check if answer is correct
        const isCorrect = this.checkAnswerCorrectness(selectedIds, correctAnswerIds, question.questionType);

        // Calculate points (simplified - 1 point per correct answer)
        const maxPoints = 1;
        const points = isCorrect ? maxPoints : 0;

        return {
          questionId: question.questionId,
          questionContent: question.content,
          questionType: question.questionType === 'ONE_ANSWER' ? ('single' as const) : ('multiple' as const),
          imageLocation: question.imageLocation,
          videoLocation: question.videoLocation,
          selectedAnswers,
          correctAnswers,
          isCorrect,
          points,
          maxPoints,
        };
      }),
    );

    return questionDetails;
  }

  private async analyzeQuizQuestions(examId: number) {
    const questions = await Question.createQueryBuilder('question')
      .innerJoin('question.exams', 'examQuestion')
      .where('examQuestion.examId = :examId', { examId })
      .getMany();

    const analysis = await Promise.all(
      questions.map(async (question) => {
        // Count total student answers for this question
        const totalAttempts = await StudentAnswer.count({
          where: { questionId: question.questionId, examId },
        });

        // Count correct answers
        const studentAnswers = await StudentAnswer.find({
          where: { questionId: question.questionId, examId },
        });

        const allAnswers = await Answer.find({
          where: { questionId: question.questionId },
        });

        const correctAnswerIds = allAnswers
          .filter((a) => a.correct && a.correct[0] === 1)
          .map((a) => Number(a.answerId));
        let correctCount = 0;

        for (const studentAnswer of studentAnswers) {
          const selectedIds = studentAnswer.selectedAnswers || [];
          const questionType = question.questionType;
          const isCorrect = this.checkAnswerCorrectness(selectedIds, correctAnswerIds, questionType);
          if (isCorrect) correctCount++;
        }

        const correctRate = totalAttempts > 0 ? Number(((correctCount / totalAttempts) * 100).toFixed(2)) : 0;

        // Determine difficulty
        let difficulty: 'easy' | 'medium' | 'hard';
        if (correctRate >= 70) difficulty = 'easy';
        else if (correctRate >= 40) difficulty = 'medium';
        else difficulty = 'hard';

        return {
          questionId: question.questionId,
          questionContent: question.content,
          correctRate,
          totalAttempts,
          difficulty,
        };
      }),
    );

    return analysis;
  }

  private ensureAdminOrTeacher(user: CacheUser): { isAdmin: boolean; isTeacher: boolean } {
    const code = user.code?.toUpperCase();
    const isAdmin = code === RoleCode.ADMIN;
    const isTeacher = code === RoleCode.TEACHER;

    if (!isAdmin && !isTeacher) {
      throw new AppException({
        code: ERROR_MSG.PERMISSION_DENIED,
        message: 'Only admin or teacher can access exam statistics',
        status: HttpStatus.FORBIDDEN,
      });
    }

    return { isAdmin, isTeacher };
  }

  private validatePermissions(user: CacheUser, targetUserId: number): void {
    const code = user.code?.toUpperCase();
    const isAdmin = code === RoleCode.ADMIN;
    const isTeacher = code === RoleCode.TEACHER;
    const isStudent = code === RoleCode.USER;

    // Students can only view their own results
    if (isStudent && user.userId !== targetUserId) {
      throw new AppException({
        code: ERROR_MSG.PERMISSION_DENIED,
        message: 'Students can only view their own results',
        status: HttpStatus.FORBIDDEN,
      });
    }

    // Admin and teachers can view any student's results (classroom filtering will be applied separately)
  }

  private async getTeacherClassroomIds(teacherId: number): Promise<number[]> {
    const rows = await ClassTeacher.createQueryBuilder('classTeacher')
      .select('classTeacher.classroomId', 'classroomId')
      .where('classTeacher.teacherId = :teacherId', { teacherId })
      .getRawMany();

    return rows.map((item) => Number(item.classroomId)).filter(Boolean);
  }

  private async checkTeacherHasAccessToExam(teacherId: number, examId: number): Promise<boolean> {
    const teacherClassIds = await this.getTeacherClassroomIds(teacherId);
    if (!teacherClassIds.length) return false;

    // Check if exam belongs to any of teacher's classrooms
    const exam = await this.dataSourceB.getRepository(ExamB).findOne({
      where: { examId },
    });

    if (!exam || !exam.classRoomId) return false;
    return teacherClassIds.includes(Number(exam.classRoomId));
  }

  private calculateScoreDistribution(scores: (number | null)[]) {
    const distribution = {
      '0-2': 0,
      '2-4': 0,
      '4-6': 0,
      '6-8': 0,
      '8-10': 0,
    };

    scores.forEach((score) => {
      if (score === null || score === undefined) return;
      const s = Number(score);
      if (s >= 0 && s < 2) distribution['0-2']++;
      else if (s >= 2 && s < 4) distribution['2-4']++;
      else if (s >= 4 && s < 6) distribution['4-6']++;
      else if (s >= 6 && s < 8) distribution['6-8']++;
      else if (s >= 8 && s <= 10) distribution['8-10']++;
    });

    return distribution;
  }

  private async getAllQuizStudentScores(examId: number): Promise<number[]> {
    // Get latest attempt per student and their scores
    const subQuery = ExamAttempt.createQueryBuilder('sub')
      .select('MAX(sub.userExamId)', 'latestAttemptId')
      .where('sub.examId = :examId', { examId })
      .groupBy('sub.studentId')
      .getQuery();

    const results = await ExamAttempt.createQueryBuilder('attempt')
      .select('attempt.score', 'score')
      .where(`attempt.userExamId IN (${subQuery})`)
      .setParameter('examId', examId)
      .getRawMany();

    return results.map((r) => (r.score !== null ? Number(r.score) : null)).filter((s) => s !== null);
  }

  private async getAllPracticeStudentScores(examId: number): Promise<(number | null)[]> {
    // Get latest attempt per student and their scores
    const subQuery = PracticeExamAttempt.createQueryBuilder('sub')
      .select('MAX(sub.userPracticeId)', 'latestAttemptId')
      .where('sub.examId = :examId', { examId })
      .groupBy('sub.studentId')
      .getQuery();

    const results = await PracticeExamAttempt.createQueryBuilder('attempt')
      .select('attempt.score', 'score')
      .where(`attempt.userPracticeId IN (${subQuery})`)
      .setParameter('examId', examId)
      .getRawMany();

    return results.map((r) => (r.score !== null ? Number(r.score) : null));
  }

  private checkAnswerCorrectness(
    selectedAnswerIds: number[],
    correctAnswerIds: number[],
    questionType: any,
  ): boolean {
    const isSingleAnswer = questionType === 'ONE_ANSWER';
    if (isSingleAnswer) {
      return selectedAnswerIds.length === 1 && correctAnswerIds.includes(selectedAnswerIds[0]);
    } else {
      // multiple choice: must select all correct answers and no incorrect ones
      if (selectedAnswerIds.length !== correctAnswerIds.length) return false;
      return selectedAnswerIds.every((id) => correctAnswerIds.includes(id));
    }
  }

  private async calculateAIAccuracy(examId: number, userId: number): Promise<number> {
    const videos = await ExamVideo.createQueryBuilder('video')
      .where('video.examId = :examId', { examId })
      .andWhere('video.userId = :userId', { userId })
      .getMany();

    if (!videos.length) return 0;

    const matchedCount = videos.filter((video) => video.aiAnswer && video.aiAnswer.trim() !== '').length;
    return Number(((matchedCount / videos.length) * 100).toFixed(2));
  }
}
