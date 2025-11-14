import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { In, DataSource } from 'typeorm';
import { CacheUser } from 'src/dto/common-request.dto';
import {
  StatisticsCompletionStatus,
  StatisticsStudentFilterDto,
  StudentStatisticsQueryDto,
} from 'src/dto/statistics/statistics-filter.dto';
import {
  StatisticAttemptSummaryDto,
  StatisticSubjectDto,
  StatisticTimelinePointDto,
  StudentStatisticsResponseDto,
  StatisticOverviewDto,
  StatisticActivityDto,
  StatisticFilterMetaDto,
  StatisticDailyAverageDto,
  StatisticPerformanceCollectionDto,
  StatisticStudentInfoDto,
} from 'src/dto/statistics/statistics-response.dto';
import { GenerateUtil } from 'src/utils/generate';
import { User } from 'src/entities/user/user.entity';
import { ClassTeacher } from 'src/entities/class/class-teacher.entity';
import { UserStatistic } from 'src/entities/user/user-statistic.entity';
import { UserLog } from 'src/entities/user/user-log.entity';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
import { Topic } from 'src/entities/vocabulary/topic.entity';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { ExamB } from 'src/entitiesB/exam.entity';
import { RoleCode } from 'src/constant/role-code';
import { AppException, App404Exception } from 'src/middleware/app-error-handler';
import { ERROR_MSG } from 'src/constant/error';
import * as dayjs from 'dayjs';

const LOGIN_KEYWORDS = ['LOGIN', 'AUTH_LOGIN'];

interface DateRange {
  from?: Date;
  to?: Date;
}

interface AttemptRaw {
  attemptId: number;
  examId: number;
  examName: string;
  classRoomId?: number;
  classRoomName?: string;
  score?: number;
  isFinished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class StatisticsService {
  constructor(@InjectDataSource('dbB') private readonly dataSourceB: DataSource) {}

  async searchStudents(user: CacheUser, query: StatisticsStudentFilterDto) {
    const role = this.ensureStatisticsAccess(user);

    const qb = User.createQueryBuilder('user')
      .leftJoinAndSelect('user.studentProfile', 'profile')
      .leftJoinAndSelect('user.school', 'school')
      .leftJoinAndSelect('user.classStudents', 'classStudent')
      .leftJoinAndSelect('classStudent.classroom', 'classroom')
      .where('user.isDeleted = :isDeleted', { isDeleted: false })
    // ✅ SỬA: Lọc đúng role code của học sinh
      .andWhere('LOWER(user.code) = :roleCode', { roleCode: RoleCode.USER.toLowerCase() })
      .distinct(true);

    if (role.isTeacher && !role.isAdmin) {
      const classIds = await this.getTeacherClassroomIds(user.userId);
      if (!classIds.length) {
        return GenerateUtil.paginate({ data: [], itemCount: 0, query });
      }
      qb.andWhere('classStudent.classroomId IN (:...classIds)', { classIds });
    }

    if (query.keyword) {
      const keyword = `%${query.keyword.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.name) LIKE :keyword OR LOWER(user.email) LIKE :keyword OR LOWER(profile.studentCode) LIKE :keyword)',
        { keyword },
      );
    }

    if (query.schoolId) {
      qb.andWhere('user.schoolId = :schoolId', { schoolId: query.schoolId });
    }

    if (query.classroomId) {
      qb.andWhere('classStudent.classroomId = :classroomId', { classroomId: query.classroomId });
    }

    qb.orderBy(`user.${query.orderBy ?? 'createdDate'}`, query.sortBy ?? 'DESC')
      .skip(query.skip)
      .take(query.take);

    const [data, itemCount] = await qb.getManyAndCount();

    const result = data.map<StatisticStudentInfoDto>((student) => ({
      userId: student.userId,
      name: student.name,
      email: student.email,
      avatarLocation: student.avatarLocation,
      schoolId: student.schoolId,
      schoolName: student.school?.name,
      studentCode: student.studentProfile?.studentCode,
      classroomId: student.classStudents?.[0]?.classroom?.classroomId,
      classroomName: student.classStudents?.[0]?.classroom?.name,
    }));

    return GenerateUtil.paginate({ data: result, itemCount, query });
  }

  async getStudentStatistics(
    user: CacheUser,
    studentId: number,
    query: StudentStatisticsQueryDto,
  ): Promise<StudentStatisticsResponseDto> {
    const role = this.ensureStatisticsAccess(user);
    const student = await User.createQueryBuilder('user')
      .leftJoinAndSelect('user.school', 'school')
      .leftJoinAndSelect('user.classStudents', 'classStudent')
      .leftJoinAndSelect('classStudent.classroom', 'classroom')
      .leftJoinAndSelect('user.studentProfile', 'profile')
      .where('user.userId = :studentId', { studentId })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!student) {
      throw new App404Exception('userId', { userId: studentId });
    }

    if (role.isTeacher && !role.isAdmin) {
      const teacherClassIds = await this.getTeacherClassroomIds(user.userId);
      const studentClassIds = (student.classStudents || []).map((item) => item.classroomId).filter(Boolean);
      const hasIntersection = studentClassIds.some((classId) => teacherClassIds.includes(classId));
      if (!hasIntersection) {
        throw new AppException({
          code: 'STATISTICS_PERMISSION_DENIED',
          message: 'You are not allowed to view this student statistics',
          status: HttpStatus.FORBIDDEN,
        });
      }
    }

    return await this.buildStudentStatisticsResponse(student, query);
  }

  async getMyStatistics(user: CacheUser, query: StudentStatisticsQueryDto): Promise<StudentStatisticsResponseDto> {
    // Học sinh chỉ có thể xem thống kê của chính mình
    const student = await User.createQueryBuilder('user')
      .leftJoinAndSelect('user.school', 'school')
      .leftJoinAndSelect('user.classStudents', 'classStudent')
      .leftJoinAndSelect('classStudent.classroom', 'classroom')
      .leftJoinAndSelect('user.studentProfile', 'profile')
      .where('user.userId = :studentId', { studentId: user.userId })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();

    if (!student) {
      throw new App404Exception('userId', { userId: user.userId });
    }

    return await this.buildStudentStatisticsResponse(student, query);
  }

  private async buildStudentStatisticsResponse(
    student: User,
    query: StudentStatisticsQueryDto,
  ): Promise<StudentStatisticsResponseDto> {
    const dateRange = this.resolveDateRange(query);

    const examAttempts = await this.fetchExamAttempts(student.userId, query, dateRange);
    const practiceAttempts = await this.fetchPracticeAttempts(student.userId, query, dateRange);
    await this.attachClassroomNames(examAttempts, practiceAttempts);
    const userStatistic = await UserStatistic.findOne({ where: { userId: student.userId } });
    const loginStats = await this.collectLoginData(student.userId, dateRange);

    const subjects = await this.buildSubjectList(student);
    const overview = this.buildOverview(userStatistic, examAttempts, practiceAttempts, loginStats);
    const performance = this.buildPerformance(examAttempts, practiceAttempts);
    const activity = this.buildActivityTimeline(examAttempts, practiceAttempts);
    const filters = this.buildFilterMeta(subjects, activity);

    const studentInfo: StatisticStudentInfoDto = {
      userId: student.userId,
      name: student.name,
      avatarLocation: student.avatarLocation,
      email: student.email,
      schoolId: student.schoolId,
      schoolName: student.school?.name,
      classroomId: student.classStudents?.[0]?.classroom?.classroomId,
      classroomName: student.classStudents?.[0]?.classroom?.name,
      studentCode: student.studentProfile?.studentCode,
    };

    return {
      student: studentInfo,
      overview,
      subjects,
      performance,
      activity,
      filters,
    };
  }

  private ensureStatisticsAccess(user: CacheUser) {
    const code = user.code?.toUpperCase();
    const isAdmin = code === RoleCode.ADMIN;
    const isTeacher = code === RoleCode.TEACHER;
    if (!isAdmin && !isTeacher) {
      throw new AppException({
        code: ERROR_MSG.PERMISSION_DENIED,
        message: 'Only admin or teacher can access statistics',
        status: HttpStatus.FORBIDDEN,
      });
    }
    return { isAdmin, isTeacher };
  }

  private async getTeacherClassroomIds(teacherId: number): Promise<number[]> {
    const rows = await ClassTeacher.createQueryBuilder('classTeacher')
      .select('classTeacher.classroomId', 'classroomId')
      .where('classTeacher.teacherId = :teacherId', { teacherId })
      .getRawMany();

    return rows.map((item) => Number(item.classroomId)).filter(Boolean);
  }

  private resolveDateRange(query: StudentStatisticsQueryDto): DateRange {
    const from = query.fromDate ? dayjs(query.fromDate).startOf('day').toDate() : undefined;
    const to = query.toDate ? dayjs(query.toDate).endOf('day').toDate() : undefined;

    if (from && to && from.getTime() > to.getTime()) {
      throw new AppException(ERROR_MSG.TIME_INVALID);
    }

    return { from, to };
  }

  private async fetchExamAttempts(
    studentId: number,
    query: StudentStatisticsQueryDto,
    dateRange: DateRange,
  ): Promise<AttemptRaw[]> {
    const qb = ExamAttempt.createQueryBuilder('attempt')
      .innerJoin('attempt.exam', 'exam')
      .leftJoin('exam.classroom', 'classroom')
      .select('attempt.userExamId', 'attemptId')
      .addSelect('exam.examId', 'examId')
      .addSelect('exam.name', 'examName')
      .addSelect('exam.classRoomId', 'classRoomId')
      .addSelect('classroom.name', 'classRoomName')
      .addSelect('attempt.score', 'score')
      .addSelect('attempt.isFinished', 'isFinished')
      .addSelect('attempt.createdAt', 'createdAt')
      .addSelect('attempt.updatedAt', 'updatedAt')
      .where('attempt.studentId = :studentId', { studentId });

    if (dateRange.from) {
      qb.andWhere('attempt.createdAt >= :fromDate', { fromDate: dateRange.from });
    }

    if (dateRange.to) {
      qb.andWhere('attempt.createdAt <= :toDate', { toDate: dateRange.to });
    }

    if (query.classroomId) {
      qb.andWhere('exam.classRoomId = :classroomId', { classroomId: query.classroomId });
    }

    if (query.search) {
      qb.andWhere('LOWER(exam.name) LIKE :search', { search: `%${query.search.toLowerCase()}%` });
    }

    if (query.status === StatisticsCompletionStatus.COMPLETED) {
      qb.andWhere('attempt.isFinished = :isFinished', { isFinished: true });
    } else if (query.status === StatisticsCompletionStatus.IN_PROGRESS) {
      qb.andWhere('attempt.isFinished = :isFinished', { isFinished: false });
    }

    const rows = await qb.orderBy('attempt.createdAt', 'ASC').getRawMany();

    return rows.map((row) => ({
      attemptId: Number(row.attemptId),
      examId: Number(row.examId),
      examName: row.examName,
      classRoomId: row.classRoomId ? Number(row.classRoomId) : undefined,
      classRoomName: row.classRoomName ?? undefined,
      score: row.score !== null ? Number(row.score) : undefined,
      isFinished: !!row.isFinished,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    }));
  }

  private async fetchPracticeAttempts(
    studentId: number,
    query: StudentStatisticsQueryDto,
    dateRange: DateRange,
  ): Promise<AttemptRaw[]> {
    const qb = PracticeExamAttempt.createQueryBuilder('attempt')
      .select('attempt.userPracticeId', 'attemptId')
      .addSelect('attempt.examId', 'examId')
      .addSelect('attempt.score', 'score')
      .addSelect('attempt.isFinished', 'isFinished')
      .addSelect('attempt.createdDate', 'createdAt')
      .where('attempt.studentId = :studentId', { studentId });

    if (dateRange.from) {
      qb.andWhere('attempt.createdDate >= :fromDate', { fromDate: dateRange.from });
    }

    if (dateRange.to) {
      qb.andWhere('attempt.createdDate <= :toDate', { toDate: dateRange.to });
    }

    if (query.status === StatisticsCompletionStatus.COMPLETED) {
      qb.andWhere('attempt.isFinished = :isFinished', { isFinished: true });
    } else if (query.status === StatisticsCompletionStatus.IN_PROGRESS) {
      qb.andWhere('attempt.isFinished = :isFinished', { isFinished: false });
    }

    const rows = await qb.orderBy('attempt.createdDate', 'ASC').getRawMany();
    const examIds = rows.map((row) => Number(row.examId)).filter(Boolean);
    let examMap = new Map<number, ExamB>();
    
    // ✅ THÊM: Error handling cho cross-database query
    if (examIds.length) {
      try {
        const exams = await this.dataSourceB.getRepository(ExamB).find({ where: { examId: In(examIds) } });
        examMap = new Map(exams.map((exam) => [Number(exam.examId), exam]));
      } catch (error) {
        // Log error nhưng không throw - vẫn trả về data với exam name mặc định
        console.error('Error fetching exams from dbB:', error.message);
      }
    }

    return rows.map((row) => {
      const mappedExam = row.examId ? examMap.get(Number(row.examId)) : undefined;
      return {
        attemptId: Number(row.attemptId),
        examId: Number(row.examId),
        examName: mappedExam?.name ?? 'Practice exam',
        classRoomId: mappedExam?.classRoomId ? Number(mappedExam.classRoomId) : undefined,
        classRoomName: undefined,
        score: row.score !== null ? Number(row.score) : undefined,
        isFinished: !!row.isFinished,
        createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
        updatedAt: undefined,
      };
    });
  }

  private async attachClassroomNames(examAttempts: AttemptRaw[], practiceAttempts: AttemptRaw[]) {
    const classIds = new Set<number>();
    examAttempts.forEach((attempt) => {
      if (attempt.classRoomId) classIds.add(attempt.classRoomId);
    });
    practiceAttempts.forEach((attempt) => {
      if (attempt.classRoomId) classIds.add(attempt.classRoomId);
    });

    if (!classIds.size) return;

    const classRooms = await ClassRoom.createQueryBuilder('classroom')
      .select(['classroom.classroomId', 'classroom.name'])
      .where('classroom.classroomId IN (:...classIds)', { classIds: Array.from(classIds) })
      .getMany();

    const classRoomMap = new Map(classRooms.map((room) => [Number(room.classroomId), room.name]));

    const assignName = (attempt: AttemptRaw) => {
      if (attempt.classRoomId && classRoomMap.has(attempt.classRoomId)) {
        attempt.classRoomName = classRoomMap.get(attempt.classRoomId);
      }
    };

    examAttempts.forEach(assignName);
    practiceAttempts.forEach(assignName);
  }

  private async collectLoginData(studentId: number, dateRange: DateRange) {
    const qb = UserLog.createQueryBuilder('log')
      .select(['log.userLogId', 'log.metadata', 'log.comment', 'log.createdDate'])
      .where('log.userId = :studentId', { studentId });

    if (dateRange.from) {
      qb.andWhere('log.createdDate >= :fromDate', { fromDate: dateRange.from });
    }

    if (dateRange.to) {
      qb.andWhere('log.createdDate <= :toDate', { toDate: dateRange.to });
    }

    const logs = await qb.getMany();

    let loginCount = 0;
    let learningMinutes = 0;
    let lastLoginAt: Date | undefined;

    for (const log of logs) {
      const meta = typeof log.metadata === 'string' ? this.safeParseJson(log.metadata) : log.metadata;
      const comment = log.comment?.toUpperCase();
      const event = typeof meta === 'object' && meta ? meta.event || meta.action || meta.type : undefined;

      if (
        (comment && LOGIN_KEYWORDS.includes(comment)) ||
        (event && LOGIN_KEYWORDS.includes(String(event).toUpperCase()))
      ) {
        loginCount += 1;
        if (!lastLoginAt || dayjs(lastLoginAt).isBefore(log.createdDate)) {
          lastLoginAt = log.createdDate;
        }
      }

      const durationMinutes = this.extractDurationMinutes(meta);
      if (durationMinutes) {
        learningMinutes += durationMinutes;
      }
    }

    return { loginCount, learningMinutes, lastLoginAt };
  }

  private extractDurationMinutes(meta: any): number {
    if (!meta) return 0;
    if (typeof meta.durationMinutes === 'number') return meta.durationMinutes;
    if (typeof meta.durationSeconds === 'number') return meta.durationSeconds / 60;
    if (typeof meta.durationMs === 'number') return meta.durationMs / 60000;
    return 0;
  }

  private safeParseJson(value: string) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  private async buildSubjectList(student: User): Promise<StatisticSubjectDto[]> {
    const classrooms = (student.classStudents || [])
      .map((item) => item.classroom)
      .filter(Boolean)
      .map<StatisticSubjectDto>((classroom) => ({
        id: classroom.classroomId,
        name: classroom.name,
        type: 'CLASSROOM',
      }));

    const classroomIds = classrooms.map((item) => item.id);
    let topics: StatisticSubjectDto[] = [];
    if (classroomIds.length) {
      const topicEntities = await Topic.createQueryBuilder('topic')
        .leftJoinAndSelect('topic.classroom', 'classroom')
        .where('topic.classroomId IN (:...classroomIds)', { classroomIds })
        .orderBy('topic.name', 'ASC')
        .getMany();

      topics = topicEntities.map((topic) => ({
        id: topic.topicId,
        name: topic.name,
        type: 'TOPIC',
        classroomId: topic.classroomId,
      }));
    }

    return [...classrooms, ...topics];
  }

  private buildOverview(
    userStatistic: UserStatistic | null,
    examAttempts: AttemptRaw[],
    practiceAttempts: AttemptRaw[],
    loginStats: { loginCount: number; learningMinutes: number; lastLoginAt?: Date },
  ): StatisticOverviewDto {
    const examsCompleted = examAttempts.filter((attempt) => attempt.isFinished).length;
    const practicesCompleted = practiceAttempts.filter((attempt) => attempt.isFinished).length;
    const totalAttempts = examAttempts.length + practiceAttempts.length;
    const totalCompleted = examsCompleted + practicesCompleted;
    const completionRate = totalAttempts ? Math.round((totalCompleted / totalAttempts) * 100) : 0;

    const scores = [...examAttempts, ...practiceAttempts].map((attempt) =>
      typeof attempt.score === 'number' ? attempt.score : null,
    );
    const validScores = scores.filter((score) => typeof score === 'number') as number[];
    const dynamicAverage = validScores.length
      ? Number((validScores.reduce((sum, cur) => sum + cur, 0) / validScores.length).toFixed(2))
      : 0;

    return {
      totalClassesJoined: userStatistic?.totalClassesJoined ?? 0,
      vocabularyViews: userStatistic?.vocabularyViews ?? 0,
      lessonViews: userStatistic?.lessonViews ?? 0,
      testsCompleted: userStatistic?.testsCompleted ?? totalCompleted,
      averageScore: userStatistic?.averageScore ?? dynamicAverage,
      completionRate,
      loginCount: loginStats.loginCount,
      learningMinutes: Number(loginStats.learningMinutes.toFixed(2)),
      lastLoginAt: loginStats.lastLoginAt,
    };
  }

  private buildPerformance(
    examAttempts: AttemptRaw[],
    practiceAttempts: AttemptRaw[],
  ): StatisticPerformanceCollectionDto {
    const exams = this.aggregateAttempts(examAttempts);
    const practices = this.aggregateAttempts(practiceAttempts);
    return { exams, practices };
  }

  private aggregateAttempts(attempts: AttemptRaw[]): StatisticAttemptSummaryDto[] {
    const map = new Map<
      number,
      StatisticAttemptSummaryDto & { completedAttempts: number; scores: number[]; lastAttemptAt?: Date }
    >();

    attempts.forEach((attempt) => {
      const item = map.get(attempt.examId) || {
        id: attempt.attemptId,
        examId: attempt.examId,
        examName: attempt.examName,
        classRoomId: attempt.classRoomId,
        classRoomName: attempt.classRoomName,
        attemptCount: 0,
        completedAttempts: 0,
        bestScore: undefined,
        latestScore: undefined,
        status: 'in_progress',
        lastAttemptAt: undefined,
        scores: [],
      };

      item.attemptCount += 1;
      if (attempt.isFinished) {
        item.completedAttempts += 1;
        item.status = 'completed';
      }

      if (typeof attempt.score === 'number') {
        item.scores.push(attempt.score);
        item.bestScore = item.bestScore ? Math.max(item.bestScore, attempt.score) : attempt.score;
        item.latestScore = attempt.score;
      }

      if (!item.lastAttemptAt || (attempt.createdAt && item.lastAttemptAt < attempt.createdAt)) {
        item.lastAttemptAt = attempt.createdAt;
      }

      if (!item.classRoomName && attempt.classRoomName) {
        item.classRoomName = attempt.classRoomName;
      }

      map.set(attempt.examId, item);
    });

    return Array.from(map.values()).map((item) => ({
      id: item.id,
      examId: item.examId,
      examName: item.examName,
      classRoomId: item.classRoomId,
      classRoomName: item.classRoomName,
      attemptCount: item.attemptCount,
      completedAttempts: item.completedAttempts,
      bestScore: item.bestScore,
      latestScore: item.latestScore,
      status: item.status,
      lastAttemptAt: item.lastAttemptAt,
    }));
  }

  private buildActivityTimeline(examAttempts: AttemptRaw[], practiceAttempts: AttemptRaw[]): StatisticActivityDto {
    const examPoints: StatisticTimelinePointDto[] = examAttempts
      .filter((attempt) => attempt.createdAt)
      .map((attempt) => ({
        date: attempt.createdAt ? attempt.createdAt.toISOString() : '',
        score: typeof attempt.score === 'number' ? Number(attempt.score.toFixed(2)) : undefined,
        type: 'exam' as const,
        label: attempt.examName,
      }));

    const practicePoints: StatisticTimelinePointDto[] = practiceAttempts
      .filter((attempt) => attempt.createdAt)
      .map((attempt) => ({
        date: attempt.createdAt ? attempt.createdAt.toISOString() : '',
        score: typeof attempt.score === 'number' ? Number(attempt.score.toFixed(2)) : undefined,
        type: 'practice' as const,
        label: attempt.examName,
      }));

    const timeline = [...examPoints, ...practicePoints].sort(
      (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
    );

    const groupByDay = new Map<string, number[]>();
    timeline.forEach((point) => {
      const dateKey = point.date.substring(0, 10);
      if (!groupByDay.has(dateKey)) {
        groupByDay.set(dateKey, []);
      }
      if (typeof point.score === 'number') {
        groupByDay.get(dateKey)?.push(point.score);
      }
    });

    const dailyAverage: StatisticDailyAverageDto[] = Array.from(groupByDay.entries()).map(([date, scores]) => ({
      date,
      averageScore: Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)),
    }));

    return { scoreTimeline: timeline, dailyAverage };
  }

  private buildFilterMeta(subjects: StatisticSubjectDto[], activity: StatisticActivityDto): StatisticFilterMetaDto {
    const classrooms = subjects.filter((subject) => subject.type === 'CLASSROOM');
    const topics = subjects.filter((subject) => subject.type === 'TOPIC');

    const dates = activity.scoreTimeline.map((item) => item.date);
    const minDate = dates.length ? dates[0] : undefined;
    const maxDate = dates.length ? dates[dates.length - 1] : undefined;

    return {
      classrooms,
      topics,
      statusOptions: [
        StatisticsCompletionStatus.ALL,
        StatisticsCompletionStatus.COMPLETED,
        StatisticsCompletionStatus.IN_PROGRESS,
      ],
      minDate,
      maxDate,
    };
  }
}
