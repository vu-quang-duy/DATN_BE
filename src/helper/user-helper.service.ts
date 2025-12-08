import { SearchStudentDto, SearchUserDto, SearchUserStatisticDto } from 'src/dto/user-dto/search-user.dto';
import { ClassStudent } from 'src/entities/class/class-student.entity';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { UserStatistic } from 'src/entities/user/user-statistic.entity';
import { User } from 'src/entities/user/user.entity';
import { VocabularyView } from 'src/entities/vocabulary/vocabulary-view.entity';
import { ConditionWhere } from 'src/types/query.type';
import { FindOptionsSelect, ILike } from 'typeorm';
import { PartView } from 'src/entities/class/part-view.entity';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
// import { ExamB } from 'src/entitiesB/exam.entity';

export class UserHelper {
  static selectBasicInfo: FindOptionsSelect<User> = {
    userId: true,
    name: true,
    email: true,
    phoneNumber: true,
    avatarLocation: true,
    gender: true,
    role: { roleCode: true },
  };

  static getFilterSearchUser = (q: SearchUserDto): ConditionWhere<User> => {
    let userWhere: ConditionWhere<User> = {};
    userWhere = {
      ...(q.name && { name: ILike(`%${q.name}%`) }),
      role: { roleCode: q.roleCode },
      ...(q.status && { status: q.status }),
    };

    return { ...userWhere };
  };

  static getFilterSearchStudent = (q: SearchStudentDto): ConditionWhere<ClassStudent> => {
    let userWhere: ConditionWhere<ClassStudent> = {};
    userWhere = {
      ...(q.name && { name: ILike(`%${q.name}%`) }),
      classroom: { classroomId: q.classRoomId },
    };

    return { ...userWhere };
  };

  static generateStudentCode(studentId: number) {
    const year = new Date().getFullYear();
    const studentCode = `${year}${studentId.toString().padStart(4, '0')}`;
    return studentCode;
  }

  static getFilterSearchUserStatistic(query: SearchUserStatisticDto): ConditionWhere<UserStatistic> {
    let where: ConditionWhere<UserStatistic> = {};

    where = {
      ...(query.name && { name: ILike(`%${query.name}%`) }),
      ...(query.userId && { userId: query.userId }),
    };

    return { ...where };
  }

  static handleUserStatistic = async (userId: number) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);

    // Execute all calculation queries in parallel to save time
    const [vocabularyViews, totalClassesJoined, lessonViews, testsCompleted, averageScore] = await Promise.all([
      this.calculateVocabularyViews(userId),
      this.calculateClassJoined(userId),
      this.calculateLessonViews(userId),
      this.calculateTestCompleted(userId),
      this.calculateAverageScore(userId),
    ]);

    // Update entity properties
    userStatistic.vocabularyViews = vocabularyViews;
    userStatistic.totalClassesJoined = totalClassesJoined;
    userStatistic.lessonViews = lessonViews;
    userStatistic.testsCompleted = testsCompleted;
    userStatistic.averageScore = averageScore;

    // Save only ONCE per user to reduce DB locking
    return await userStatistic.save();
  };

  static calculateVocabularyViews = async (userId: number) => {
    const viewCount = await VocabularyView.createQueryBuilder('vocabularyView')
      .select('COUNT(DISTINCT vocabularyView.vocabularyId)', 'viewCount')
      .where('vocabularyView.userId = :userId', { userId })
      .getRawOne();
    return Number(viewCount.viewCount || 0);
  };

  static calculateLessonViews = async (userId: number) => {
    const viewCount = await PartView.createQueryBuilder('partView')
      .select('COUNT(DISTINCT partView.lessonId)', 'viewCount')
      .where('partView.userId = :userId', { userId })
      .getRawOne();
    return Number(viewCount.viewCount || 0);
  };

  static calculateClassJoined = async (userId: number) => {
    const classJoinedCount = await ClassStudent.createQueryBuilder('classStudent')
      .where('classStudent.studentId = :userId', { userId })
      .getCount();
    return classJoinedCount;
  };

  static calculateTestCompleted = async (userId: number) => {
    // Result from exam attempts
    const examResult = await ExamAttempt.createQueryBuilder('examAttempt')
      .select('DISTINCT examAttempt.examId', 'examId')
      .where('examAttempt.studentId = :userId', { userId })
      .andWhere('examAttempt.isFinished = true')
      .getRawMany();

    // Result from practice attempts
    const practiceResult = await PracticeExamAttempt.createQueryBuilder('practiceAttempt')
      .select('DISTINCT practiceAttempt.examId', 'examId')
      .where('practiceAttempt.studentId = :userId', { userId })
      .andWhere('practiceAttempt.isFinished = true')
      .getRawMany();

    // Merge and count unique exams
    const examIds = new Set<number>();
    [...examResult, ...practiceResult].forEach((row) => {
      examIds.add(Number(row.examId));
    });

    return examIds.size;
  };

  static calculateAverageScore = async (userId: number) => {
    // Max score per exam
    const examMaxScores = await ExamAttempt.createQueryBuilder('examAttempt')
      .select('examAttempt.examId', 'examId')
      .addSelect('MAX(examAttempt.score)', 'maxScore')
      .where('examAttempt.studentId = :userId', { userId })
      .andWhere('examAttempt.isFinished = true')
      .groupBy('examAttempt.examId')
      .setParameter('userId', userId)
      .getRawMany();

    // Max score per practice exam
    const practiceMaxScores = await PracticeExamAttempt.createQueryBuilder('practiceAttempt')
      .select('practiceAttempt.examId', 'examId')
      .addSelect('MAX(practiceAttempt.score)', 'maxScore')
      .where('practiceAttempt.studentId = :userId', { userId })
      .andWhere('practiceAttempt.isFinished = true')
      .groupBy('practiceAttempt.examId')
      .setParameter('userId', userId)
      .getRawMany();

    const allMaxScores = [...examMaxScores, ...practiceMaxScores];

    if (allMaxScores.length === 0) {
      return 0;
    } else {
      const totalScore = allMaxScores.reduce((sum, row) => sum + Number(row.maxScore || 0), 0);
      return totalScore / allMaxScores.length;
    }
  };

  static findOrCreateUserStatistic = async (userId: number) => {
    const userStatistic = await UserStatistic.findOneBy({ userId });
    if (userStatistic) return userStatistic;
    return await UserStatistic.create({ userId }).save();
  };
}
