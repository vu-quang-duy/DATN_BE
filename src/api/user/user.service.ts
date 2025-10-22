/* eslint-disable @typescript-eslint/no-unused-vars */
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Audit } from 'entity-diff';
import { ILike } from 'typeorm';
import { ERROR_MSG } from 'src/constant/error';
import { RoleCode } from 'src/constant/role-code';
import { CacheUser } from 'src/dto/common-request.dto';
import { PageDto } from 'src/dto/paginate.dto';
import { LoginDto } from 'src/dto/user-dto/login.dto';
import { RegisterDto } from 'src/dto/user-dto/register.dto';
import { UpdateUserDto } from 'src/dto/user-dto/update-user.dto';
import {
  SearchSchoolDto,
  SearchClassDto,
  SearchStudentDto,
  SearchTeacherDto,
  SearchUserDto,
  SearchUserStatisticDto,
} from 'src/dto/user-dto/search-user.dto';
import { ChangeUserPasswordDto, UpdateUserProfileDto } from 'src/dto/user-dto/update-user-profile.dto';
import { ClassStudent } from 'src/entities/class/class-student.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { Upload } from 'src/entities/upload/upload.entity';
import { UserLog } from 'src/entities/user/user-log.entity';
import { UserStatistic } from 'src/entities/user/user-statistic.entity';
import { User } from 'src/entities/user/user.entity';
import { UserB } from 'src/entitiesB/user.entity';
import { ExamB } from 'src/entitiesB/exam.entity';
import { VocabularyView } from 'src/entities/vocabulary/vocabulary-view.entity';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';
import { PartView } from 'src/entities/class/part-view.entity';
import { Part } from 'src/entities/class/part.entity';
import { Lesson } from 'src/entities/class/lesson.entity';
import { School } from 'src/entities/class/school.entity';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { PermissionHelper } from 'src/helper/permisson-helper.service';
import { RoleHelper } from 'src/helper/role-helper.service';
import { UserHelper } from 'src/helper/user-helper.service';
import { App404Exception, AppException, AppExistedException } from 'src/middleware/app-error-handler';
import { AppStatus } from 'src/types/common';
import { ArrUtil } from 'src/utils/array';
import { CondUtil } from 'src/utils/condition';
import { DateUtil } from 'src/utils/date';
import { GenerateUtil } from 'src/utils/generate';
import { HashUtil } from 'src/utils/hash';
import { HelperUtils } from 'src/utils/helpers';
import { QueryUtil } from 'src/utils/query';
import { DataSource, FindOptionsWhere, Not, In } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { StudentProfile } from './../../entities/user/student-profile.entity';
import { MailService } from './MailService';
import { ClassTeacher } from 'src/entities/class/class-teacher.entity';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
import { ExamScoringDto } from 'src/dto/exam/exam-score.dto';
import { ExamVideo } from 'src/entities/exam/exam-video.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
    private dataSource: DataSource,
    @InjectDataSource('dbB') private readonly dataSourceB: DataSource,
    private readonly mailService: MailService, // Service gửi email
  ) {}

  async getProfileById(userId, whereCustom: FindOptionsWhere<User> = {}) {
    const user = await User.findOne({
      select: {
        ...UserHelper.selectBasicInfo,
        createdDate: true,
        updatedAt: true,
        address: true,
        birthDay: true,
        schoolId: true,
        district: true,
        city: true,
        ward: true,
      },
      where: { userId: userId, role: { roleCode: Not(RoleCode.ADMIN) }, ...whereCustom },
      relations: { role: true },
    });
    if (!user) throw new App404Exception('userId', { userId });
    const userReturn = {
      ...user,
      role: user.role.roleCode,
    };
    return userReturn;
  }

  async getProfile({ userId }: CacheUser) {
    return await this.getProfileById(userId, { role: {} });
  }

  login = async (body: LoginDto) => {
    const user = await User.findOne({
      where: { email: body.email },
      select: ['userId', 'email', 'password'],
    });

    if (!user) throw new App404Exception('email', body);
    const isPasswordMatch = body.password === user.password;
    if (!isPasswordMatch) throw new AppException(ERROR_MSG.PASSWORD_NOT_CORRECT);

    const data = await HashUtil.signAccessToken(user.email, this.jwtService);

    const cacheKeyAuth = GenerateUtil.keyAuth(data.payload);

    await this.cacheManager.del(cacheKeyAuth);

    return data;
  };

  register = async (body: RegisterDto) => {
    const isExistByName = await HelperUtils.existByName(User, body.email, 'email');
    if (isExistByName) throw new AppExistedException('email', body);

    const role = await RoleHelper.getRoleByCode(body.role);
    if (!role || role.roleCode === RoleCode.ADMIN) throw new App404Exception('role', body);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = DateUtil.getTimeFuture(new Date(), 0, 2, 0); // Thời gian hết hạn dayjs().add(10, 'minute').toISOString();

    const userCacheKey = `user:${body.email}`;

    const bodyCache = {
      ...body,
      role,
    };

    await this.cacheManager.set(userCacheKey, JSON.stringify({ body: bodyCache, otp, expiry }), { ttl: 10 * 60 });

    await this.mailService.sendMail(body.email, 'Your OTP Code', `Your OTP is: ${otp}`);

    return true;
  };

  async verify(email: string, otpNum: number): Promise<string> {
    const userCacheKey = `user:${email}`;
    const cachedData: any = await this.cacheManager.get(userCacheKey);

    if (!cachedData) throw new AppException(ERROR_MSG.AUTH_OTP_EXPIRED);
    // ;

    const { body, otp: cachedOtp, expiry } = JSON.parse(cachedData as string);

    if (DateUtil.isAfterOrEqual(new Date(), new Date(expiry))) throw new Error('OTP expired.');
    if (cachedOtp !== otpNum) throw new AppException(ERROR_MSG.AUTH_OTP_NOT_MATCH);

    // Lưu vào cơ sở dữ liệu (ví dụ dùng TypeORM)

    const user = new User();
    user.name = body.name;
    user.password = body.password;
    user.email = body.email;
    user.phoneNumber = body.phoneNumber;

    // user.code = body.role.id;

    await user.save();

    if (body.role.roleCode === RoleCode.USER) {
      const studentCode = UserHelper.generateStudentCode(user.userId);
      const studentProfile = new StudentProfile();
      studentProfile.studentCode = studentCode;
      studentProfile.userId = user.userId;
      await studentProfile.save();
    }
    // Xóa Redis sau khi xác minh thành công
    await this.cacheManager.del(userCacheKey);

    return 'Verify successfully';
  }

  updateProfile = async ({ userId }: CacheUser, body: UpdateUserProfileDto, permissionCode: string): Promise<any> => {
    const user = await User.findOneBy({ userId: userId });
    if (!user) throw new App404Exception('userId', { userId });

    const oldUser = JSON.stringify(user);

    const uploadKeys = ['avatarLocation'];
    const listOldPaths = ArrUtil.getOldPathEntityFromBody({ entity: user, body, uploadKeys });

    if (CondUtil.diffAndVail(body.name, user.name)) {
      user.name = body.name;
    }

    if (CondUtil.diffAndVail(body.avatarLocation, user.avatarLocation)) {
      user.avatarLocation = body.avatarLocation;
    }

    if (CondUtil.diffAndVail(body.address, user.address)) {
      user.address = body.address;
    }

    if (CondUtil.diffAndVail(body.birthDay, user.birthDay)) {
      user.birthDay = new Date(body.birthDay);
    }

    if (CondUtil.diffAndVail(body.gender, user.gender)) {
      user.gender = body.gender;
    }

    if (CondUtil.diffAndVail(body.phoneNumber, user.phoneNumber)) {
      user.phoneNumber = body.phoneNumber;
    }

    CondUtil.saveIfChanged(user, body, ['schoolId', 'houseStreet', 'ward', 'district', 'city']);

    const permission = await PermissionHelper.getPermissionByCode(permissionCode);
    if (!permission) throw new App404Exception('permissionCode', { permissionCode });

    const audit = new Audit();
    const diff = audit.diff(JSON.parse(oldUser), JSON.parse(JSON.stringify(user)));
    if (!diff.length) throw new AppException(ERROR_MSG.HAVE_NOT_ANY_CHANGE);

    return await this.dataSource.transaction(async (txEntityManager) => {
      await txEntityManager.update(User, { id: user.userId }, user);
      const userLog = new UserLog();
      userLog.metadata = JSON.stringify(diff);
      userLog.userId = user.userId;
      userLog.permissionId = permission.permissionId;
      await txEntityManager.save(userLog);

      const listPaths = ArrUtil.getPathsFromBody({ body, uploadKeys });

      listOldPaths.length && (await txEntityManager.update(Upload, listOldPaths, { isActive: false }));
      listPaths.length && (await txEntityManager.update(Upload, listPaths, { isActive: true }));

      return true;
    });
  };

  search = async (query: SearchUserDto): Promise<PageDto<User>> => {
    const [data, itemCount] = await User.findAndCount({
      select: {
        ...UserHelper.selectBasicInfo,
        createdDate: true,
        role: { roleCode: true },
        schoolId: true,
        address: true,
        studentProfile: {
          studentCode: true,
        },
        classStudents: {
          classStudentId: true,
          classroom: {
            classroomId: true,
            name: true,
          },
        },
      },
      where: UserHelper.getFilterSearchUser(query),
      relations: {
        role: true,
        classStudents: {
          classroom: true,
        },
        classTeachers: true,
        studentProfile: true,
      },

      order: QueryUtil.getSort(query.orderBy, query.sortBy),
      skip: query.skip,
      take: query.take,
    });

    return GenerateUtil.paginate({ data, itemCount, query });
  };

  approveUser = async (userId: number, id, permissionCode) => {
    const user = await User.findOneBy({ userId });
    if (!user) throw new App404Exception('userId', { userId: userId });
    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new AppException(ERROR_MSG.PERMISSION_DENIED);

    await user.save();
    return true;
  };

  changePassword = async ({ userId }: CacheUser, body: ChangeUserPasswordDto) => {
    const user = await User.findOneBy({ userId: userId });
    if (!user) throw new App404Exception('userId', { userId });

    const isMatch = await HashUtil.comparePassword(body.oldPassword, user.password);
    if (!isMatch) throw new AppException(ERROR_MSG.PASSWORD_NOT_CORRECT);

    if (body.newPassword !== body.confirmPassword) throw new AppException(ERROR_MSG.PASSWORD_NOT_MATCH);
    user.password = body.newPassword;
    await user.save();
    return true;
  };

  viewVocabulary = async (userId: number, vocabularyId: number) => {
    if (!userId) throw new Error('userId is required'); // Check nếu thiếu userId
    if (!vocabularyId) throw new Error('vocabularyId is required');

    const vocabulary = await Vocabulary.findOne({ where: { vocabularyId: vocabularyId } });
    if (!vocabulary) throw new App404Exception('id', { vocabularyId });

    let vocabularyView = await VocabularyView.findOneBy({ vocabularyId, userId });

    if (!vocabularyView) {
      vocabularyView = Object.assign(new VocabularyView(), {
        vocabularyId,
        userId,
        viewCount: 0,
      });
    }

    vocabularyView.lastViewedAt = new Date();
    vocabularyView.viewCount = Number(vocabularyView.viewCount) + 1;
    await vocabularyView.save();
    return vocabularyView;
  };

  getRecentVocabularyViews = async (userId: number) => {
    const recentViews = await VocabularyView.createQueryBuilder('vocabularyView')
      .leftJoinAndSelect('vocabularyView.vocabulary', 'vocabulary') // JOIN bảng vocabulary
      .where('vocabularyView.userId = :userId', { userId })
      .orderBy('vocabularyView.lastViewedAt', 'DESC')
      .limit(5)
      .getMany();

    // Trả về dữ liệu đã gọn gàng cho FE
    return recentViews.map((view) => ({
      vocabularyId: view.vocabularyId,
      name: view.vocabulary.content,
      viewCount: view.viewCount,
    }));
  };

  viewLesson = async (userId: number, lessonId: number) => {
    if (!userId) throw new Error('userId is required'); // Check nếu thiếu userId
    if (!lessonId) throw new Error('partId is required');

    const lesson = await Lesson.findOne({ where: { lessonId: lessonId } });
    // const lesson = await Part.findOne({ where: { lessonId: lessonId } });
    if (!lesson) throw new App404Exception('lessonId', { lessonId });

    let partView = await PartView.findOneBy({ lessonId, userId });
    if (!partView) {
      partView = Object.assign(new PartView(), {
        lessonId,
        userId,
        viewCount: 0,
      });
    }

    partView.lastViewedAt = new Date();
    partView.viewCount = Number(partView.viewCount) + 1;
    await partView.save();
    return partView;
  };

  getRecentLessonViews = async (userId: number) => {
    const recentViews = await PartView.createQueryBuilder('partView')
      .leftJoinAndSelect('partView.lesson', 'lesson') // JOIN bảng vocabulary
      .where('partView.userId = :userId', { userId })
      .orderBy('partView.lastViewedAt', 'DESC')
      .limit(5)
      .getMany();

    return recentViews.map((view) => ({
      lessonId: view.lessonId,
      name: view.lesson.lessonName,
      viewCount: view.viewCount,
    }));
  };

  getFullLessonViews = async (userId: number) => {
    const recentViews = await PartView.createQueryBuilder('partView')
      .leftJoinAndSelect('partView.lesson', 'lesson') // JOIN bảng vocabulary
      .where('partView.userId = :userId', { userId })
      .orderBy('lesson.lessonId', 'ASC')
      .getMany();

    return recentViews.map((view) => ({
      lessonId: view.lessonId,
      name: view.lesson.lessonName,
      viewCount: view.viewCount,
      lastViewed: view.lastViewedAt,
    }));
  };

  getFullTestsCompleted = async (userId: number) => {
    const examAttemptRepo = this.dataSource.getRepository(ExamAttempt);
    const practiceAttemptRepo = this.dataSource.getRepository(PracticeExamAttempt);
    const examRepo = this.dataSourceB.getRepository(ExamB);

    // ===== 1. Lấy bài thi chính thức =====
    const examData = await examAttemptRepo
      .createQueryBuilder('examAttempt')
      .select('examAttempt.examId', 'examId')
      .addSelect('examAttempt.studentId', 'studentId')
      .addSelect('MAX(examAttempt.score)', 'maxScore')
      .addSelect('COUNT(*)', 'attemptCount')
      .where('examAttempt.studentId = :studentId', { studentId: userId })
      .andWhere('examAttempt.isFinished = true')
      .groupBy('examAttempt.examId')
      .addGroupBy('examAttempt.studentId')
      .getRawMany();

    const examIds1 = examData.map((item) => Number(item.examId));

    const formattedExamData = examData.map((row) => ({
      examId: Number(row.examId),
      examName: '', // sẽ bổ sung sau
      userId: Number(row.studentId),
      score: Number(row.maxScore),
      attemptCount: Number(row.attemptCount),
      type: 'exam',
    }));

    // ===== 2. Lấy bài luyện tập =====
    const practiceData = await practiceAttemptRepo
      .createQueryBuilder('practiceAttempt')
      .select('practiceAttempt.examId', 'examId')
      .addSelect('practiceAttempt.studentId', 'studentId')
      .addSelect('MAX(practiceAttempt.score)', 'maxScore')
      .addSelect('COUNT(*)', 'attemptCount')
      .where('practiceAttempt.studentId = :studentId', { studentId: userId })
      .andWhere('practiceAttempt.isFinished = true')
      .groupBy('practiceAttempt.examId')
      .addGroupBy('practiceAttempt.studentId')
      .getRawMany();

    const examIds2 = practiceData.map((item) => Number(item.examId));

    const formattedPracticeData = practiceData.map((row) => ({
      examId: Number(row.examId),
      examName: '', // sẽ bổ sung sau
      userId: Number(row.studentId),
      score: Number(row.maxScore),
      attemptCount: Number(row.attemptCount),
      type: 'practice',
    }));

    // ===== 3. Gộp tất cả examId và truy vấn bảng ExamB =====
    const allExamIds = [...new Set([...examIds1, ...examIds2])];

    const examList = await examRepo.find({
      where: { examId: In(allExamIds) },
    });

    const examMap = new Map<number, string>();
    examList.forEach((exam) => {
      examMap.set(Number(exam.examId), exam.name);
    });

    // ===== 4. Bổ sung examName vào kết quả =====
    const completedList = [...formattedExamData, ...formattedPracticeData].map((item) => ({
      ...item,
      examName: examMap.get(item.examId) || 'Không rõ tên bài',
    }));

    return completedList;
  };

  getFullTestResults = async (query: ExamScoringDto) => {
    const examAttemptRepo = this.dataSource.getRepository(ExamAttempt);
    const practiceAttemptRepo = this.dataSource.getRepository(PracticeExamAttempt);
    const practiceVideoRepo = this.dataSource.getRepository(ExamVideo);

    const examType = query.type;
    let examData;
    if (examType === 'exam') {
      // ===== 1. Lấy bài thi chính thức =====
      examData = await examAttemptRepo
        .createQueryBuilder('examAttempt')
        .select('examAttempt.examId', 'examId')
        .addSelect('examAttempt.studentId', 'studentId')
        .addSelect('examAttempt.score', 'score')
        .where('examAttempt.examId = :examId', { examId: query.examId })
        .andWhere('examAttempt.studentId = :studentId', { studentId: query.userId })
        .andWhere('examAttempt.isFinished = true')
        .orderBy('examAttempt.userExamId', 'ASC')
        .getRawMany();

      const formattedExamData = examData.map((row) => ({
        examId: Number(row.examId),
        userId: Number(row.studentId),
        score: Number(row.score),
        type: examType,
      }));

      return formattedExamData;
    } else {
      // ===== 2. Lấy bài luyện tập =====
      examData = await practiceAttemptRepo
        .createQueryBuilder('practiceAttempt')
        .select('practiceAttempt.examId', 'examId')
        .addSelect('practiceAttempt.studentId', 'studentId')
        .addSelect('practiceAttempt.score', 'score')
        .where('practiceAttempt.examId = :examId', { examId: query.examId })
        .andWhere('practiceAttempt.studentId = :studentId', { studentId: query.userId })
        .andWhere('practiceAttempt.isFinished = true')
        .orderBy('practiceAttempt.userPracticeId', 'ASC')
        .getRawMany();

      const finishedAttempts = await practiceAttemptRepo
        .createQueryBuilder('attempt')
        .select([
          'attempt.userPracticeId AS userPracticeId',
          'attempt.createdDate AS createdDate',
          'attempt.examId AS examId',
          'attempt.studentId AS studentId',
          'attempt.score AS score',
        ])
        .where('attempt.examId = :examId', { examId: query.examId })
        .andWhere('attempt.studentId = :studentId', { studentId: query.userId })
        .andWhere('attempt.isFinished = true')
        .orderBy('attempt.createdDate', 'ASC')
        .getRawMany();

      const unfinishedAttempts = await practiceAttemptRepo
        .createQueryBuilder('attempt')
        .select(['attempt.userPracticeId AS userPracticeId', 'attempt.createdDate AS createdDate'])
        .where('attempt.examId = :examId', { examId: query.examId })
        .andWhere('attempt.studentId = :studentId', { studentId: query.userId })
        .andWhere('attempt.isFinished = false')
        .orderBy('attempt.createdDate', 'ASC')
        .getRawMany();
      const formattedExamData = [];
      const usedUnfinished = new Set();

      for (const finished of finishedAttempts) {
        // Tìm lần unfinish gần nhất (trước) mà chưa được dùng
        const matchedUnfinished = [...unfinishedAttempts]
          .reverse()
          .find(
            (u) => new Date(u.createdDate) < new Date(finished.createdDate) && !usedUnfinished.has(u.userPracticeId),
          );

        if (!matchedUnfinished) continue;

        usedUnfinished.add(matchedUnfinished.userPracticeId);

        const videos = await practiceVideoRepo
          .createQueryBuilder('video')
          .select('video.videoUrl', 'videoUrl')
          .where('video.examId = :examId', { examId: finished.examId })
          .andWhere('video.userId = :userId', { userId: finished.studentId })
          .andWhere('video.createdDate = :createdDate', {
            createdDate: matchedUnfinished.createdDate,
          })
          .orderBy('video.videoExamId', 'ASC')
          .getRawMany();

        formattedExamData.push({
          examId: Number(finished.examId),
          userId: Number(finished.studentId),
          score: Number(finished.score),
          videoUrls: videos.map((v) => v.videoUrl),
          type: 'practice',
        });
        //   if (!startAttempt?.createdDate) continue;

        //   const createdDate = new Date(startAttempt.createdDate);

        //   const practiceVideos = await practiceVideoRepo
        //     .createQueryBuilder("practiceVideo")
        //     .select("practiceVideo.videoUrl", "videoUrl")
        //     .where("practiceVideo.examId = :examId", { examId: attempt.examId })
        //     .andWhere("practiceVideo.userId = :userId", { userId: attempt.studentId })
        //     .andWhere("practiceVideo.createdDate = :createdDate", {createdDate: createdDate })
        //     .orderBy("practiceVideo.videoExamId", "ASC")
        //     .getRawMany();
        //   console.log('videos', practiceVideos)
        //   formattedExamData.push({
        //     examId: Number(attempt.examId),
        //     userId: Number(attempt.studentId),
        //     score: Number(attempt.score),
        //     videoUrls: practiceVideos.map(v => v.videoUrl),
        //     type: "practice",
        //   });
      }
      console.log('heheasda', formattedExamData);
      return formattedExamData;
    }
  };

  getFullVocabularyViews = async (userId: number) => {
    const recentViews = await VocabularyView.createQueryBuilder('vocabularyView')
      .leftJoinAndSelect('vocabularyView.vocabulary', 'vocabulary') // JOIN bảng vocabulary
      .where('vocabularyView.userId = :userId', { userId })
      // .orderBy('vocabularyView.lastViewedAt', 'DESC')
      .orderBy('vocabulary.content COLLATE utf8mb4_vietnamese_ci', 'ASC')
      .getMany();

    // Trả về dữ liệu đã gọn gàng cho FE
    return recentViews.map((view) => ({
      vocabularyId: view.vocabularyId,
      name: view.vocabulary.content,
      viewCount: view.viewCount,
      lastViewed: view.lastViewedAt,
    }));
  };

  // Thống kê
  getStatisticsById = async (userId) => {
    const user = await User.findOneBy({ userId: userId });
    if (!user) throw new App404Exception('userId', { userId });

    const userStatistic = await UserStatistic.findOneBy({ userId });
    if (!userStatistic) throw new App404Exception('userId', { userId });

    return {
      userId: user.userId,
      name: user.name, // hoặc fullName nếu bạn dùng trường khác
      statistics: userStatistic,
    };
  };

  searchStatistics = async (query: SearchUserStatisticDto) => {
    const [data, itemCount] = await UserStatistic.findAndCount({
      where: UserHelper.getFilterSearchUserStatistic(query),
      order: QueryUtil.getSort(query.orderBy, query.sortBy),
      skip: query.skip,
      take: query.take,
    });
    return GenerateUtil.paginate({ data, itemCount, query });
  };

  getClassJoined = async (user) => {
    const classJoinedCount = await ClassStudent.createQueryBuilder('classStudent')
      .innerJoinAndSelect('classStudent.classroom', 'classRoom') // Join để lấy thông tin lớp học
      .select('classRoom.id', 'classRoomId')
      .addSelect('classRoom.name', 'name')
      .addSelect('classRoom.thumbnailPath', 'thumbnailPath')
      .addSelect('classRoom.classCode', 'classCode')
      .where('classStudent.studentId = :userId', { userId: user.userId }) // Chỉ lấy lớp học của học sinh
      .groupBy('classRoom.id')
      .addGroupBy('classRoom.name')
      .addGroupBy('classRoom.thumbnailPath')
      .addGroupBy('classRoom.classCode')
      .getRawMany();

    return classJoinedCount;
  };

  getAllStudentList = async (query: SearchStudentDto) => {
    // mặc định DESC nếu không có
    const [data, itemCount] = await User.createQueryBuilder('user')
      .leftJoinAndSelect('user.school', 'school')
      .leftJoinAndSelect('user.classStudents', 'classStudent')
      .leftJoinAndSelect('classStudent.classroom', 'classroom')
      .where('user.code = :code', { code: 'user' })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('(user.userId = :specificUserId OR user.userId >= :minUserId)', {
        specificUserId: 27,
        minUserId: 140,
      })
      .andWhere(query.name ? 'user.name LIKE :name' : 'TRUE', {
        name: `%${query.name}%`,
      })
      .andWhere(query.classRoomId ? 'classroom.classroomId = :classRoomId' : 'TRUE', {
        classRoomId: query.classRoomId,
      })
      .andWhere(query.schoolId ? 'school.schoolId = :schoolId' : 'TRUE', {
        schoolId: query.schoolId,
      })
      .orderBy(`user.${query.orderBy ?? 'userId'}`, query.sortBy ?? 'DESC')
      .skip(query.skip)
      .take(query.take)
      .select([
        'user.userId',
        'user.name',
        'user.createdDate',
        'school.schoolId',
        'school.name',
        'classStudent.classStudentId', // ít nhất 1 field của classStudent
        'classroom.name',
        'classroom.classroomId',
      ])
      .getManyAndCount();
    const formattedData = data.map((student) => {
      const firstClassName = student.classStudents?.[0]?.classroom?.name || 'Không có';
      return {
        userId: student.userId,
        name: student.name,
        schoolId: student.school?.schoolId || 'Không có',
        schoolName: student.school?.name || 'Không có',
        classRoomName: firstClassName,
      };
    });

    return GenerateUtil.paginate({ data: formattedData, itemCount, query });
  };

  // Option 1: Two-step approach with Admin and userId >= 140 filtering
  getStudentList = async (query: SearchStudentDto) => {
    const teacherId = Number(query.userId);
    const isAdmin = teacherId === 1;

    let queryBuilder = User.createQueryBuilder('user')
      .leftJoinAndSelect('user.school', 'school')
      .leftJoinAndSelect('user.classStudents', 'classStudent')
      .leftJoinAndSelect('classStudent.classroom', 'classroom')
      .where('user.code = :code', { code: 'user' })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('(user.userId = :specificUserId OR user.userId >= :minUserId)', {
        specificUserId: 27,
        minUserId: 140,
      });

    if (!isAdmin) {
      // For regular teachers, get their classroom and school restrictions
      const teacher = await User.createQueryBuilder('teacher')
        .leftJoinAndSelect('teacher.classTeachers', 'classTeacher')
        .leftJoinAndSelect('classTeacher.classroom', 'teacherClassroom')
        .where('teacher.userId = :teacherId', { teacherId })
        .andWhere('teacher.isDeleted = :isDeleted', { isDeleted: 0 })
        .getOne();

      if (!teacher || !teacher.classTeachers || teacher.classTeachers.length === 0) {
        return GenerateUtil.paginate({ data: [], itemCount: 0, query });
      }

      // Get teacher's school ID and classroom IDs
      const teacherSchoolId = teacher.schoolId;
      const teacherClassroomIds = teacher.classTeachers.map((ct) => ct.classroom.classroomId);

      // Apply teacher restrictions with unique parameter names
      queryBuilder = queryBuilder
        .andWhere('user.schoolId = :teacherSchoolId', { teacherSchoolId })
        .andWhere('classroom.classroomId IN (:...teacherClassroomIds)', { teacherClassroomIds });
    }

    // Apply common filters with unique parameter names to avoid conflicts
    const filterParams: any = {};

    if (query.name) {
      queryBuilder = queryBuilder.andWhere('user.name LIKE :searchName', { searchName: `%${query.name}%` });
    }

    if (query.classRoomId) {
      queryBuilder = queryBuilder.andWhere('classroom.classroomId = :filterClassRoomId', {
        filterClassRoomId: query.classRoomId,
      });
    }

    // Only apply school filter for admin users or if it doesn't conflict with teacher restrictions
    if (query.schoolId) {
      queryBuilder = queryBuilder.andWhere('school.schoolId = :filterSchoolId', { filterSchoolId: query.schoolId });
    }

    queryBuilder = queryBuilder
      .orderBy(`user.${query.orderBy ?? 'userId'}`, query.sortBy ?? 'DESC')
      .skip(query.skip)
      .take(query.take)
      .select([
        'user.userId',
        'user.name',
        'user.email',
        'user.createdDate',
        'school.schoolId',
        'school.name',
        'classStudent.classStudentId',
        'classroom.name',
        'classroom.classroomId',
      ]);

    const [data, itemCount] = await queryBuilder.getManyAndCount();

    const formattedData = data.map((student) => {
      const firstClassName = student.classStudents?.[0]?.classroom?.name || 'Không có';
      return {
        userId: student.userId,
        name: student.name,
        schoolId: student.school?.schoolId || 'Không có',
        schoolName: student.school?.name || 'Không có',
        email: student.email || 'Không có',
        classRoomName: firstClassName,
      };
    });

    return GenerateUtil.paginate({ data: formattedData, itemCount, query });
  };

  getTeacherList = async (query: SearchTeacherDto) => {
    const [data, itemCount] = await User.createQueryBuilder('user')
      .leftJoinAndSelect('user.school', 'school')
      .leftJoinAndSelect('user.classTeachers', 'classTeacher')
      .leftJoinAndSelect('classTeacher.classroom', 'classroom')
      .where('user.code = :code', { code: 'teacher' })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('(user.userId = :specificUserId OR user.userId >= :minUserId)', {
        specificUserId: 28,
        minUserId: 140,
      })
      .andWhere(query.name ? 'user.name LIKE :name' : 'TRUE', {
        name: `%${query.name}%`,
      })
      .andWhere(query.classRoomId ? 'classroom.classroomId = :classRoomId' : 'TRUE', {
        classRoomId: query.classRoomId,
      })
      .andWhere(query.schoolId ? 'school.schoolId = :schoolId' : 'TRUE', {
        schoolId: query.schoolId,
      })
      .orderBy(`user.${query.orderBy ?? 'userId'}`, query.sortBy ?? 'DESC')
      .skip(query.skip)
      .take(query.take)
      .select([
        'user.userId',
        'user.name',
        'user.birthDay',
        'user.address',
        'user.email',
        'user.createdDate',
        'school.schoolId',
        'school.name',
        'classTeacher.classTeacherId',
        'classroom.name',
      ])
      .getManyAndCount();
    const formattedData = data.map((teacher) => {
      const firstClassName = teacher.classTeachers?.[0]?.classroom?.name || 'Không có';
      return {
        userId: teacher.userId,
        name: teacher.name,
        birthDay: teacher.birthDay?.toISOString().split('T')[0] || 'Không có',
        schoolId: teacher.school?.schoolId || 'Không có',
        schoolName: teacher.school?.name || 'Không có',
        city: teacher.address || 'Không có',
        email: teacher.email || 'Không có',
        classRoomName: firstClassName,
      };
    });

    return GenerateUtil.paginate({ data: formattedData, itemCount, query });
  };

  getSchoolList = async (query: SearchSchoolDto) => {
    const [data, itemCount] = await School.createQueryBuilder('school')
      .orderBy('school.schoolId', query.sortBy ?? 'DESC')
      .skip(query.skip)
      .take(query.take)
      .select(['school.schoolId', 'school.name', 'school.imageLocation'])
      .getManyAndCount();

    const formattedData = data.map((school) => ({
      schoolId: school.schoolId,
      name: school.name,
      imageLocation: school.imageLocation || 'Không có',
    }));

    return GenerateUtil.paginate({ data: formattedData, itemCount, query });
  };

  getClassList = async (query: SearchClassDto) => {
    const [data, itemCount] = await ClassRoom.createQueryBuilder('classRoom')
      .where('classRoom.classroomId > :id', { id: 47 })
      .orderBy('classRoom.classroomId', query.sortBy ?? 'ASC')
      .skip(query.skip)
      .take(query.take)
      .select(['classRoom.classroomId', 'classRoom.name', 'classRoom.imageLocation'])
      .getManyAndCount();
    const formattedData = data.map((classroom) => ({
      classRoomId: classroom.classroomId,
      name: classroom.name,
      imageLocation: classroom.imageLocation || 'Không có',
    }));

    return GenerateUtil.paginate({ data: formattedData, itemCount, query });
  };

  updateUser = async (userId: number, body: UpdateUserDto) => {
    const { name, birthDay, address, classRoomName, schoolName } = body;
    // Kiểm tra user có tồn tại không
    const user = await User.createQueryBuilder('user').where('user.userId = :userId', { userId }).getOne();
    // Nếu có trường mới thì tìm schoolId và update
    if (schoolName) {
      const school = await School.createQueryBuilder('school')
        .where('school.name = :schoolName', { schoolName })
        .getOne();

      await User.createQueryBuilder()
        .update()
        .set({ schoolId: school.schoolId })
        .where('userId = :userId', { userId })
        .execute();
    }

    // Cập nhật các thông tin cá nhân
    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (birthDay) updateFields.birthDay = birthDay;
    if (address) updateFields.address = address;
    if (Object.keys(updateFields).length > 0) {
      await User.createQueryBuilder().update().set(updateFields).where('userId = :userId', { userId }).execute();
    }

    // Nếu có thay đổi lớp thì xử lý bảng class_room_student
    if (classRoomName) {
      const classRoom = await ClassRoom.createQueryBuilder('class')
        .where('class.name = :classRoomName', { classRoomName })
        .getOne();
      if (user.code == 'USER') {
        const existRelation = await ClassStudent.createQueryBuilder('classStudent')
          .where('classStudent.studentId = :userId', { userId })
          .getOne();
        if (existRelation) {
          await ClassStudent.createQueryBuilder()
            .update()
            .set({ classroomId: classRoom.classroomId })
            .where('studentId = :userId', { userId })
            .execute();
        } else {
          await ClassStudent.createQueryBuilder()
            .insert()
            .values({
              studentId: userId,
              classroomId: classRoom.classroomId,
            })
            .execute();
        }
      } else {
        const existRelation = await ClassTeacher.createQueryBuilder('classTeacher')
          .where('classTeacher.teacherId = :userId', { userId })
          .getOne();
        if (existRelation) {
          await ClassTeacher.createQueryBuilder()
            .update()
            .set({ classroomId: classRoom.classroomId })
            .where('teacherId = :userId', { userId })
            .execute();
        } else {
          await ClassTeacher.createQueryBuilder()
            .insert()
            .values({
              teacherId: userId,
              classroomId: classRoom.classroomId,
            })
            .execute();
        }
      }
    }
    const userBRepo = this.dataSourceB.getRepository(UserB);
    const updateFieldsB: any = {};
    if (name) updateFieldsB.name = name;
    if (birthDay) updateFieldsB.birthDay = birthDay;
    if (address) updateFieldsB.address = address;

    if (Object.keys(updateFieldsB).length > 0) {
      await userBRepo
        .createQueryBuilder()
        .update()
        .set(updateFieldsB)
        .where('userId = :userId', { userId }) // Assuming userId same in both dbs
        .execute();
    }

    return { message: 'Teacher updated successfully' };
  };

  deleteUser = async (userId: number) => {
    // Kiểm tra user có tồn tại không
    const user = await User.createQueryBuilder('user').where('user.userId = :userId', { userId }).getOne();

    if (!user) {
      throw new Error('User not found');
    }

    await User.createQueryBuilder().update().set({ isDeleted: true }).where('userId = :userId', { userId }).execute();

    const userBRepo = this.dataSourceB.getRepository(UserB);
    await userBRepo
      .createQueryBuilder()
      .update()
      .set({ isDeleted: true })
      .where('userId = :userId', { userId })
      .execute();

    return { message: 'Student deleted successfully' };
  };

  createStudent = async (body: UpdateUserDto) => {
    const { name, birthDay, address, classRoomName, schoolName } = body;
    let schoolId: number | undefined = undefined;
    let classRoomId: number | undefined = undefined;

    if (classRoomName) {
      const classRoom = await ClassRoom.createQueryBuilder('class')
        .where('class.name = :classRoomName', { classRoomName })
        .getOne();
      if (classRoom) {
        classRoomId = classRoom.classroomId;
      }
    }

    if (schoolName) {
      const school = await School.createQueryBuilder('school')
        .where('school.name = :schoolName', { schoolName })
        .getOne();
      if (school) {
        schoolId = school.schoolId;
      }
    }
    // Cập nhật các thông tin cá nhân
    const removeVietnameseTones = (str) => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '') // bỏ khoảng trắng
        .toLowerCase();
    };
    const email = removeVietnameseTones(name) + '@gmail.com'; // Tạo email mặc định từ tên
    const password = '123456';
    const code = 'USER';
    const isDeleted = false;
    const isApproved = true;
    const user = await User.createQueryBuilder()
      .insert()
      .into(User)
      .values({
        name,
        birthDay,
        address,
        email,
        password,
        code,
        schoolId,
        isDeleted,
        isApproved,
      })
      .execute();

    const userId = user.identifiers[0].userId;

    await ClassStudent.createQueryBuilder()
      .insert()
      .values({
        studentId: userId,
        classroomId: classRoomId,
      })
      .execute();

    const userBRepo = this.dataSourceB.getRepository(UserB);
    await userBRepo
      .createQueryBuilder()
      .insert()
      .into(UserB)
      .values({
        name,
        birthDay,
        address,
        email,
        password,
        code,
        isDeleted,
        isApproved,
      })
      .execute();
    return { message: 'Student created successfully' };
  };

  createTeacher = async (body: UpdateUserDto) => {
    const { name, birthDay, address, classRoomName, schoolName } = body;
    let schoolId: number | undefined = undefined;
    let classRoomId: number | undefined = undefined;

    if (classRoomName) {
      const classRoom = await ClassRoom.createQueryBuilder('class')
        .where('class.name = :classRoomName', { classRoomName })
        .getOne();
      if (classRoom) {
        classRoomId = classRoom.classroomId;
      }
    }

    if (schoolName) {
      const school = await School.createQueryBuilder('school')
        .where('school.name = :schoolName', { schoolName })
        .getOne();
      if (school) {
        schoolId = school.schoolId;
      }
    }
    // Cập nhật các thông tin cá nhân
    const removeVietnameseTones = (str) => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '') // bỏ khoảng trắng
        .toLowerCase();
    };
    const email = removeVietnameseTones(name) + '@gmail.com'; // Tạo email mặc định từ tên
    const password = '123456';
    const code = 'TEACHER';
    const isDeleted = false;
    const isApproved = true;
    const user = await User.createQueryBuilder()
      .insert()
      .into(User)
      .values({
        name,
        birthDay,
        address,
        email,
        password,
        code,
        schoolId,
        isDeleted,
        isApproved,
      })
      .execute();

    const userId = user.identifiers[0].userId;

    await ClassTeacher.createQueryBuilder()
      .insert()
      .values({
        teacherId: userId,
        classroomId: classRoomId,
      })
      .execute();

    const userBRepo = this.dataSourceB.getRepository(UserB);
    await userBRepo
      .createQueryBuilder()
      .insert()
      .into(UserB)
      .values({
        name,
        birthDay,
        address,
        email,
        password,
        code,
        isDeleted,
        isApproved,
      })
      .execute();
    return { message: 'Teacher created successfully' };
  };
}
