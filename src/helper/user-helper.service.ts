import { SearchStudentDto, SearchUserDto, SearchUserStatisticDto } from 'src/dto/user-dto/search-user.dto';
import { ClassStudent } from 'src/entities/class/class-student.entity';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { UserStatistic } from 'src/entities/user/user-statistic.entity';
import { User } from 'src/entities/user/user.entity';
import { VocabularyView } from 'src/entities/vocabulary/vocabulary-view.entity';
import { ConditionWhere } from 'src/types/query.type';
import { FindOptionsSelect, ILike } from 'typeorm';
import { PartView } from 'src/entities/class/part-view.entity';
export class UserHelper {
  static selectBasicInfo: FindOptionsSelect<User> = {
    userId: true,
    username: true,
    name: true,
    email: true,
    phoneNumber: true,
    avatarLocation: true,
    gender: true,
    role: { roleCode: true },
    slug: true,
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

  static handleUserStatistic = async (userId) => {
    await this.retryViewVocabulary(userId);
    await this.retryClassJoined(userId);
    await this.retryViewLesson(userId);
    await this.retryTestCompleted(userId);
    await this.retryAverageScore(userId);
  };

  static retryViewVocabulary = async (userId: number) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);
    const viewCount = await VocabularyView.createQueryBuilder('vocabularyView')
      // .select('sum(vocabularyView.viewCount)', 'viewCount')
      // .where('vocabularyView.userId = :userId', { userId })
      // .getRawOne();
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
      // .select('sum(vocabularyView.viewCount)', 'viewCount')
      // .where('vocabularyView.userId = :userId', { userId })
      // .getRawOne();
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
      // .innerJoinAndSelect('examAttempt.exam', 'exam')
      // .select('exam.classRoomId', 'classRoomId')
      // .addSelect('COUNT(examAttempt.id)', 'attemptCount')
      // .where('examAttempt.studentId = :userId', { userId })
      // .groupBy('exam.classRoomId')
      // .getRawMany();
    userStatistic.totalClassesJoined = classJoinedCount;
    return await userStatistic.save();
  };

  static retryTestCompleted = async (userId) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);
    const testCompletedCount = await ExamAttempt.countBy({ studentId: userId, isFinished: true });
    userStatistic.testsCompleted = testCompletedCount;
    return await userStatistic.save();
  };

  static retryAverageScore = async (userId) => {
    const userStatistic = await this.findOrCreateUserStatistic(userId);
    const averageScore = await ExamAttempt.createQueryBuilder('examAttempt')
      .select('AVG(examAttempt.score)', 'averageScore')
      .where('examAttempt.studentId = :userId', { userId })
      .getRawOne();
    userStatistic.averageScore = averageScore.averageScore || 0;
    return await userStatistic.save();
  };

  static findOrCreateUserStatistic = async (userId) => {
    const userStatistic = await UserStatistic.findOneBy({ userId });
    if (userStatistic) return userStatistic;
    return await UserStatistic.create({ userId }).save();
  };
}
