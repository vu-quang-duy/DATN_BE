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
    await this.retryViewVocabulary(userId);
    await this.retryClassJoined(userId);
    await this.retryViewLesson(userId);
    await this.retryTestCompleted(userId);
    await this.retryAverageScore(userId);
  };

  static retryViewVocabulary = async (userId: number) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);
    const viewCount = await VocabularyView.createQueryBuilder('vocabularyView')
      .select('COUNT(DISTINCT vocabularyView.vocabularyId)', 'viewCount') // Đếm số lượng từ duy nhất đã xem
      .where('vocabularyView.userId = :userId', { userId })
      .getRawOne();

    userStatistic.vocabularyViews = Number(viewCount.viewCount || 0);
    return await userStatistic.save();
  };
  // Baoh duy chỉnh lại thành part thì sửa lại controller, service, entity(part, user)
  // model Learning, lessonlist
  static retryViewLesson = async (userId: number) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);
    const viewCount = await PartView.createQueryBuilder('partView')
      .select('COUNT(DISTINCT partView.lessonId)', 'viewCount') // Đếm số lượng từ duy nhất đã xem
      .where('partView.userId = :userId', { userId })
      .getRawOne();
    userStatistic.lessonViews = Number(viewCount.viewCount || 0);
    return await userStatistic.save();
  };

  static retryClassJoined = async (userId) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);
    const classJoinedCount = await ClassStudent.createQueryBuilder('classStudent')
      .where('classStudent.studentId = :userId', { userId })
      .getCount(); // Lấy số lượng bản ghi thay vì `getRawMany()`
    userStatistic.totalClassesJoined = classJoinedCount;
    return await userStatistic.save();
  };

  static retryTestCompleted = async (userId: number) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);
    // Đếm số bài thi đã hoàn thành
    const examResult = await ExamAttempt.createQueryBuilder('examAttempt')
      .select('DISTINCT examAttempt.examId', 'examId')
      .where('examAttempt.studentId = :userId', { userId })
      .andWhere('examAttempt.isFinished = true')
      .getRawMany();

    // Đếm số bài luyện tập đã hoàn thành
    const practiceResult = await PracticeExamAttempt.createQueryBuilder('practiceAttempt')
      .select('DISTINCT practiceAttempt.examId', 'examId')
      .where('practiceAttempt.studentId = :userId', { userId })
      .andWhere('practiceAttempt.isFinished = true')
      .getRawMany();

    // Gộp và loại trùng
    const examIds = new Set<number>();
    [...examResult, ...practiceResult].forEach((row) => {
      examIds.add(Number(row.examId));
    });

    userStatistic.testsCompleted = examIds.size;
    return await userStatistic.save();
  };

  static retryAverageScore = async (userId: number) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);

    // Subquery điểm cao nhất mỗi bài thi
    const examMaxScores = await ExamAttempt.createQueryBuilder('examAttempt')
      .select('examAttempt.examId', 'examId')
      .addSelect('MAX(examAttempt.score)', 'maxScore')
      .where('examAttempt.studentId = :userId', { userId })
      .andWhere('examAttempt.isFinished = true')
      .groupBy('examAttempt.examId')
      .setParameter('userId', userId)
      .getRawMany();

    // Subquery điểm cao nhất mỗi bài luyện tập
    const practiceMaxScores = await PracticeExamAttempt.createQueryBuilder('practiceAttempt')
      .select('practiceAttempt.examId', 'examId')
      .addSelect('MAX(practiceAttempt.score)', 'maxScore')
      .where('practiceAttempt.studentId = :userId', { userId })
      .andWhere('practiceAttempt.isFinished = true')
      .groupBy('practiceAttempt.examId')
      .setParameter('userId', userId)
      .getRawMany();

    // Gộp điểm các bài thi & luyện tập
    const allMaxScores = [...examMaxScores, ...practiceMaxScores];

    if (allMaxScores.length === 0) {
      userStatistic.averageScore = 0;
    } else {
      const totalScore = allMaxScores.reduce((sum, row) => sum + Number(row.maxScore || 0), 0);
      userStatistic.averageScore = totalScore / allMaxScores.length;
    }

    return await userStatistic.save();
  };

  static findOrCreateUserStatistic = async (userId) => {
    const userStatistic = await UserStatistic.findOneBy({ userId });
    if (userStatistic) return userStatistic;
    return await UserStatistic.create({ userId }).save();
  };
}
