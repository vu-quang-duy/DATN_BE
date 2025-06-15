/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Audit } from 'entity-diff';
import { ERROR_MSG } from 'src/constant/error';
import { CacheUser } from 'src/dto/common-request.dto';
import { CreateExamDto, CreatePracticeExamDto, UpdateExamDto } from 'src/dto/exam/create-exam.dto';
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
import { ExamVocabulary } from 'src/entities/exam/exam-vocabulary.entity';
import { ExamB } from './../../entitiesB/exam.entity';
import { ExamScoringDto, ResetExamDto, PracticeExamScoringDto } from 'src/dto/exam/exam-score.dto';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';
import { ExamVideo } from 'src/entities/exam/exam-video.entity';
import { User } from 'src/entities/user/user.entity';
import { ClassStudent } from 'src/entities/class/class-student.entity';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
import { Question } from 'src/entities/question/question.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import axios from 'axios';
import { ClassTeacher } from 'src/entities/class/class-teacher.entity';
import { filter } from 'rxjs';
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path); // ⬅️ Gắn đúng path ffmpeg
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
    const examVocabularyRepo = this.dataSource.getRepository(ExamVocabulary);

    // 1. Lấy toàn bộ bài kiểm tra
    const exams = await examRepo
      .createQueryBuilder("exam")
      .select(["exam.examId", "exam.name"])
      .getMany();

    // ✅ 2. Lấy danh sách examId của các bài practice
    const practiceExamIdsRaw = await examVocabularyRepo
      .createQueryBuilder("ev")
      .select("DISTINCT ev.examId", "examId")
      .getRawMany();

    const practiceExamIdSet = new Set(practiceExamIdsRaw.map(e => Number(e.examId)));

    // 3. Lấy toàn bộ exam attempt của user
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

  const practiceExamAttemptRepo = this.dataSource.getRepository(PracticeExamAttempt);
  const practiceAttempts = await practiceExamAttemptRepo
    .createQueryBuilder("practice_exam_mapping")
    .select([
      "practice_exam_mapping.score",
      "practice_exam_mapping.studentId",
      "practice_exam_mapping.isFinished",
      "practice_exam_mapping.examId",
    ])
    .where("practice_exam_mapping.studentId = :studentId", { studentId: query.userId })
    .getMany();

  // Gộp chung 2 loại attempt
  const allAttempts = [...examAttempts, ...practiceAttempts];


    // 4. Gộp attempt theo examId
    const attemptMap: Record<number, any> = {};

    allAttempts.forEach(item => {
      if (!attemptMap[item.examId]) {
        attemptMap[item.examId] = {
          ...item,
          attemptCount: item.isFinished ? 1 : 0,
        };
      } else {
        const existing = attemptMap[item.examId];

        if (item.score > existing.score) {
          existing.score = item.score;
        }

        if (item.isFinished) {
          existing.isFinished = true;
        }

        existing.attemptCount += item.isFinished ? 1 : 0;
      }
    });

    // 5. Merge kết quả
    let finalData = exams.map(exam => {
      const attempt = attemptMap[exam.examId];
      const examType = practiceExamIdSet.has(Number(exam.examId)) ? "practice" : "quiz";

      // Make sure examType is explicitly set in the return object
      if (attempt) {
        return {
          examType, // Explicitly placed first
          studentId: attempt.studentId,
          examId: exam.examId,
          examName: exam.name,
          score: attempt.score,
          isFinished: attempt.isFinished,
          attemptCount: attempt.attemptCount,
        };
      } else {
        return {
          examType, // Explicitly placed first
          studentId: query.userId,
          examId: exam.examId,
          examName: exam.name,
          score: 0,
          isFinished: false,
          attemptCount: 0,
        };
      }
    });

    if (query.examType && query.examType.trim() !== "") {
      finalData = finalData.filter(exam => exam.examType === query.examType);
    }

    if (query.name && query.name.trim() !== "") {
      finalData = finalData.filter(exam => 
        exam.examName.toLowerCase().includes(query.name.toLowerCase())
      );
    }

  if (query.isFinished !== undefined && query.isFinished !== null) {
      const isFinishedBool = query.isFinished === "1";

    finalData = finalData.filter(exam => {
      // Convert exam.isFinished to boolean for comparison
      const examIsFinished = exam.isFinished === true;
      return examIsFinished === isFinishedBool;
    });
  }

    // 6. Sắp xếp và phân trang
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

getListPracticeExam = async (query: SearchExamAttemptDto, teacherId) => {
  const examRepo = this.dataSourceB.getRepository(ExamB);
  const examVideoRepo = this.dataSource.getRepository(ExamVideo);
  const userRepo = this.dataSource.getRepository(User);
  const classStudentRepo = this.dataSource.getRepository(ClassStudent);
  const classRepo = this.dataSource.getRepository(ClassRoom);
  const userPracticeRepo = this.dataSource.getRepository(PracticeExamAttempt);
  const classTeacherRepo = this.dataSource.getRepository(ClassTeacher); // Add this repository

  // Get teacher's class IDs first
  const teacherClasses = await classTeacherRepo.find({
    where: { teacherId: teacherId }
  });
  const teacherClassIds = teacherClasses.map(tc => tc.classroomId);
  // If teacher has no classes, return empty result
  if (teacherClassIds.length === 0) {
    return {
      content: [],
      itemCount: 0,
    };
  }

  // Get students from teacher's classes only
  const studentsInTeacherClasses = await classStudentRepo.find({
    where: { classroomId: In(teacherClassIds) }
  });
  const allowedStudentIds = studentsInTeacherClasses.map(cs => cs.studentId);
  // If no students in teacher's classes, return empty result
  if (allowedStudentIds.length === 0) {
    return {
      content: [],
      itemCount: 0,
    };
  }

  // 1. Subquery: Lấy thời điểm mới nhất cho mỗi (userId, examId) - chỉ cho students của teacher
  const latestVideosSubQuery = examVideoRepo
    .createQueryBuilder("sub")
    .select("sub.userId", "userId")
    .addSelect("sub.examId", "examId")
    .addSelect("MAX(sub.createdDate)", "maxCreatedDate")
    .where("sub.userId IN (:...allowedStudentIds)", { allowedStudentIds })
    .groupBy("sub.userId")
    .addGroupBy("sub.examId");

  // 2. Join lại để lấy videoUrl tương ứng
  const latestVideos = await examVideoRepo
    .createQueryBuilder("ev")
    .innerJoin(
      "(" + latestVideosSubQuery.getQuery() + ")",
      "latest",
      "ev.userId = latest.userId AND ev.examId = latest.examId AND ev.createdDate = latest.maxCreatedDate"
    )
    .setParameters(latestVideosSubQuery.getParameters())
    .select([
      "ev.userId AS userId",
      "ev.examId AS examId",
      "ev.videoUrl AS videoUrl",
    ])
    .getRawMany();
  // 3. Gom videoUrls lại theo cặp (userId, examId)
  const groupedMap = new Map<string, {
    userId: number;
    examId: number;
    videoUrls: string[];
  }>();

  for (const v of latestVideos) {
    const key = `${v.examId}-${v.userId}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        userId: Number(v.userId),
        examId: Number(v.examId),
        videoUrls: [],
      });
    }
    groupedMap.get(key)!.videoUrls.push(v.videoUrl);
  }
  const grouped = Array.from(groupedMap.values());
  // 4. Lấy tất cả các attempt để kiểm tra tình trạng - chỉ cho students của teacher
  const allAttempts = await userPracticeRepo.find({
    where: { studentId: In(allowedStudentIds) }
  });

  // Nhóm theo examId-studentId
  const attemptMap = new Map<string, PracticeExamAttempt[]>();
  for (const attempt of allAttempts) {
    const key = `${attempt.examId}-${attempt.studentId}`;
    if (!attemptMap.has(key)) {
      attemptMap.set(key, []);
    }
    attemptMap.get(key)!.push(attempt);
  }
  // 5. Lọc ra những cặp thỏa mãn:
  // - Chưa từng làm (không có isFinished = 1)
  // - Hoặc đã từng làm (isFinished = 1) và lần mới nhất là isFinished = 0
  const targetPairs = new Set<string>();
  for (const [key, attempts] of attemptMap.entries()) {
    const sorted = attempts.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
    const latest = sorted[0];
    const hasFinishedBefore = attempts.some(a => a.isFinished === true);

    if (!hasFinishedBefore || (hasFinishedBefore && latest.isFinished === false)) {
      targetPairs.add(key);
    }
  }
  // 6. Lọc danh sách video theo targetPairs
  const filteredGrouped = grouped.filter(v => {
    const key = `${v.examId}-${v.userId}`;
    return targetPairs.has(key);
  });
  // 7. Lấy thông tin bổ sung
  const userIds = [...new Set(filteredGrouped.map(v => v.userId))];
  const examIds = [...new Set(filteredGrouped.map(v => v.examId))];

  const [users, exams, classStudents, classRooms] = await Promise.all([
    userRepo.find({ where: { userId: In(userIds) } }),
    examRepo.find({ where: { examId: In(examIds) } }),
    classStudentRepo.find({ where: { studentId: In(userIds) } }),
    classRepo.find({
      where: {
        classroomId: In(teacherClassIds) // Only get teacher's classes
      },
    }),
  ]);
  // 8. Tạo lookup maps
  const userMap = new Map(users.map(u => [Number(u.userId), u.name]));
  const examMap = new Map(exams.map(e => [Number(e.examId), e.name]));
  const classStudentMap = new Map(classStudents.map(cs => [Number(cs.studentId), Number(cs.classroomId)]));
  const classRoomMap = new Map(classRooms.map(c => [Number(c.classroomId), c.name]));
  // 9. Gộp dữ liệu kết quả - chỉ bao gồm students trong classes của teacher
  let result = filteredGrouped.map(v => {
    const classRoomId = classStudentMap.get(Number(v.userId)) || null;
    return {
      userId: v.userId,
      examId: v.examId,
      videoUrls: v.videoUrls,
      name: userMap.get(v.userId) || null,
      classRoomId,
      classRoomName: classRoomMap.get(classRoomId) || null,
      examName: examMap.get(v.examId) || null,
    };
  }).filter(item => {
    // Double check: only include students from teacher's classes
    const teacherClassIdsNum = teacherClassIds.map(id => Number(id));
    return item.classRoomId && teacherClassIdsNum.includes(item.classRoomId);
  });
  // Apply name filter if provided
  if (query.name && query.name.trim() !== "") {
    result = result.filter(exam => 
      exam.examName && exam.examName.toLowerCase().includes(query.name.toLowerCase())
    );
  }

  return {
    content: result,
    itemCount: result.length,
  };
};

  addPracticeExam = async(body: CreatePracticeExamDto) => {
    const {name, classRoomId, isPrivate,  practiceWords} = body;
    const examRepo = this.dataSourceB.getRepository(ExamB);
    const examVocabularyRepo = this.dataSource.getRepository(ExamVocabulary);

     const exam = await examRepo
    .createQueryBuilder()
    .insert()
    .into(ExamB)
    .values({
      name, 
      classRoomId,
      isPrivate
    })
    .execute();

    const examId =Number(exam.identifiers[0].examId);

    await examVocabularyRepo
      .createQueryBuilder()
      .insert()
      .into(ExamVocabulary)
      .values(
        practiceWords.map((word) => ({
          vocabularyId: word.vocabularyId,
          examId: examId,
          content: word.content, 
        }))
      )
      .execute();
  }

  addExam = async(body: CreateExamDto) => {
    const {name, classRoomId, isPrivate, questionIds} = body;
    const examRepo = this.dataSourceB.getRepository(ExamB);
    const examQuestionRepo = this.dataSource.getRepository(ExamQuestion);

     const exam = await examRepo
    .createQueryBuilder()
    .insert()
    .into(ExamB)
    .values({
      name, 
      classRoomId,
      isPrivate
    })
    .execute();

    const examId =Number(exam.identifiers[0].examId);

    await examQuestionRepo
      .createQueryBuilder()
      .insert()
      .into(ExamQuestion)
      .values(
        questionIds.map((questionId) => ({
          examId,
          questionId: Number(questionId),
        })))
      .execute();
  }

      getDetailExam = async (examId: number) => {
    const examQuestionRepo = this.dataSource.getRepository(ExamQuestion);
    const questionRepo = this.dataSource.getRepository(Question);

    // 1. Lấy danh sách từ ExamQuestion theo examId
    const [data, itemCount] = await examQuestionRepo
      .createQueryBuilder('question_exam_mapping')
      .where('question_exam_mapping.examId = :examId', { examId })
      .select([
        'question_exam_mapping.questionId',
      ])
      .getManyAndCount();

    // 2. Với mỗi questionId, lấy content từ Question
    const questionIds = data.map((item) => item.questionId);

    const questions = await questionRepo
      .createQueryBuilder('question')
      .whereInIds(questionIds)
      .select(['question.questionId', 'question.content'])
      .getMany();

    // 3. Map questionId => content
    const questionMap = new Map(
      questions.map((question) => [question.questionId, question.content])
    );

    // 4. Format dữ liệu trả về
    const formattedData = data.map((exam) => {
      return {
        examId: examId,
        questionId: exam.questionId,
        content: questionMap.get(exam.questionId) || null,
      };
    });
    return {
      data: formattedData,
      total: itemCount,
    };
  };

    getDetailPracticeExam = async (examId: number) => {
    const examVocabularyRepo = this.dataSource.getRepository(ExamVocabulary);
    const vocabularyRepo = this.dataSource.getRepository(Vocabulary);

    // 1. Lấy danh sách từ ExamVocabulary theo examId
    const [data, itemCount] = await examVocabularyRepo
      .createQueryBuilder('vocabulary_exam_mapping')
      .where('vocabulary_exam_mapping.examId = :examId', { examId })
      .select([
        'vocabulary_exam_mapping.vocabularyId',
        'vocabulary_exam_mapping.content',
      ])
      .getManyAndCount();

    // 2. Với mỗi vocabularyId, lấy content từ Vocabulary
    const vocabularyIds = data.map((item) => item.vocabularyId);

    const vocabularies = await vocabularyRepo
      .createQueryBuilder('vocabulary')
      .whereInIds(vocabularyIds)
      .select(['vocabulary.vocabularyId', 'vocabulary.content'])
      .getMany();

    // 3. Map vocabularyId => content
    const vocabMap = new Map(
      vocabularies.map((vocab) => [vocab.vocabularyId, vocab.content])
    );

    // 4. Format dữ liệu trả về
    const formattedData = data.map((exam) => {
      return {
        examId: examId,
        vocabularyId: exam.vocabularyId,
        contentFromExamVocabulary: exam.content,
        contentFromVocabulary: vocabMap.get(exam.vocabularyId) || null,
      };
    });
    return {
      data: formattedData,
      total: itemCount,
    };
  };

  getDetailPracticeExamToScore = async (examId: number, userId: number) => { 
  const examVocabularyRepo = this.dataSource.getRepository(ExamVocabulary);
  const vocabularyRepo = this.dataSource.getRepository(Vocabulary);
  const examRepo = this.dataSourceB.getRepository(ExamB);
  const userRepo = this.dataSource.getRepository(User);
  const examVideoRepo = this.dataSource.getRepository(ExamVideo);

  // 1. Lấy danh sách câu hỏi theo examId
  const examVocabList = await examVocabularyRepo.find({
    where: { examId },
    order: { vocabularyId: 'ASC' },
    select: ['vocabularyId', 'content'],
  });

  const vocabularyIds = examVocabList.map(item => item.vocabularyId);

  // 2. Lấy nội dung Vocabulary tương ứng
  const vocabularies = await vocabularyRepo.find({
    where: { vocabularyId: In(vocabularyIds) },
  });
  const vocabMap = new Map(vocabularies.map(v => [v.vocabularyId, v.content]));

  // 3. Lấy exam và user info
  const exam = await examRepo.findOne({ where: { examId } });
  const user = await userRepo.findOne({ where: { userId } });

  // 4. Lấy tất cả video theo examId + userId, order giảm dần theo createdDate
  const examVideos = await examVideoRepo.find({
    where: { examId, userId },
    order: { createdDate: 'DESC' },
    select: ['videoUrl', 'aiAnswer', 'createdDate'],
  });

  if (examVideos.length === 0) {
    // Nếu không có video nào
    const formattedNoVideo = examVocabList.map((item) => ({
      examId,
      examName: exam?.name || '',
      userId,
      userName: user?.name || '',
      vocabularyId: item.vocabularyId,
      contentFromExamVocabulary: item.content,
      contentFromVocabulary: vocabMap.get(item.vocabularyId) || null,
      videos: [],
    }));
    return {
      data: formattedNoVideo,
      total: formattedNoVideo.length,
    };
  }

  // 5. Lấy createdDate mới nhất
  const latestCreatedDate = examVideos[0].createdDate;

  // 6. Lọc lấy tất cả video có cùng createdDate mới nhất
  const latestVideos = examVideos.filter(
    v => v.createdDate.getTime() === latestCreatedDate.getTime()
  );

    // 7. Distribute videos to vocabulary questions
  // OPTION A: One video per vocabulary question (if videos were recorded sequentially)
  const formatted = examVocabList.map((item, index) => {
    const video = latestVideos[index]; // Match by index/order
    const questionVideos = video ? [{
      videoUrl: video.videoUrl,
      aiAnswer: video.aiAnswer || null,
    }] : [];

    return {
      examId,
      examName: exam?.name || '',
      userId,
      userName: user?.name || '',
      vocabularyId: item.vocabularyId,
      contentFromExamVocabulary: item.content,
      contentFromVocabulary: vocabMap.get(item.vocabularyId) || null,
      videos: questionVideos,
    };
  });

  return {
    data: formatted,
    total: formatted.length,
  };
};

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

submitPracticeTest = async (
  files: Express.Multer.File[],
  body: any
) => {
  const { examId, userId } = body;

  const examVideoRepo = this.dataSource.getRepository(ExamVideo);
  const userExamRepo = this.dataSource.getRepository(PracticeExamAttempt);

  const VIDEO_PUBLIC_BASE_URL = 'http://localhost:8088/videos';
  const SUPPORTED_FORMATS = ['.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v'];
  
  const processedFiles = [];

  for (const file of files) {
    const inputPath = file.path;
    const ext = path.extname(file.originalname).toLowerCase();

    // Bỏ qua định dạng không hỗ trợ
    if (!SUPPORTED_FORMATS.includes(ext) && ext !== '.mp4') continue;

    const baseName = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const outputFilename = `${baseName}_${timestamp}.mp4`;
    const finalVideoPath = path.join('/home/tuyentrinh/Desktop/sign_school/uploads/videos', outputFilename);
    const publicVideoUrl = `${VIDEO_PUBLIC_BASE_URL}/${outputFilename}`;

    try {
      if (ext === '.mp4') {
        // Nếu là mp4 thì chỉ copy
        fs.copyFileSync(inputPath, finalVideoPath);
      } else {
        // Nếu không phải mp4 thì convert sang mp4
        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .toFormat('mp4')
            .videoCodec('libx264')
            .audioCodec('aac')
            .videoBitrate('1000k')
            .audioBitrate('128k')
            .size('640x480')
            .fps(30)
            .on('end', resolve)
            .on('error', reject)
            .save(finalVideoPath);
        });
      }

      // Gọi AI model
      const response = await axios.post(
        'https://wesign.ibme.edu.vn/ai/t3/ai/detection',
        { videoUrl: publicVideoUrl },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const detectedWord = response.data?.action_name || null;

      processedFiles.push({
        videoFileName: outputFilename, // tên file sau khi xử lý
        publicUrl: publicVideoUrl,
        detectedWord,
      });

    } catch (err) {
      console.error(`Failed to process file ${file.originalname}:`, err);
      continue; // bỏ qua file lỗi
    }
  }

  // Insert vào DB
  if (processedFiles.length > 0) {
    const insertValues = processedFiles.map(file => ({
      userId,
      examId,
      videoUrl: file.videoFileName,
      aiAnswer: file.detectedWord,
    }));

    await examVideoRepo
      .createQueryBuilder()
      .insert()
      .into(ExamVideo)
      .values(insertValues)
      .execute();

    await userExamRepo
      .createQueryBuilder()
      .insert()
      .into(PracticeExamAttempt)
      .values({
        examId,
        studentId: userId,
      })
      .execute();
  }
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
              score: Number(score),
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
  
    return { 
      success: true, 
      message: 'Exam reset successfully', 
      attemptCount, 
      highestScore 
    };
  }

  async resetPracticeExam(examId: number, body: ResetExamDto) {
    const { userId } = body;
    
    const examAttemptRepo = this.dataSource.getRepository(PracticeExamAttempt);
    
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
    
    return { 
      success: true, 
      message: 'Exam practice reset successfully', 
      attemptCount, 
      highestScore 
    };
  }

  async practiceExamScoring(body:PracticeExamScoringDto) {
    const { examId, score, userId, isFinished } = body;

    const examBRepo = this.dataSource.getRepository(PracticeExamAttempt);
      await examBRepo
            .createQueryBuilder()
            .insert()
            .into(PracticeExamAttempt)
            .values({
              studentId: userId,
              examId,
              score,
              isFinished
            })
            .execute();
    return { success: true };
  }
}
