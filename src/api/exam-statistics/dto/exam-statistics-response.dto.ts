import { ApiProperty } from '@nestjs/swagger';

// ========== OVERVIEW ENDPOINT DTOs ==========

export class OverviewSummaryDto {
  @ApiProperty()
  totalQuizExams: number;

  @ApiProperty()
  totalPracticeExams: number;

  @ApiProperty()
  totalAttempts: number;

  @ApiProperty()
  totalGraded: number;

  @ApiProperty()
  totalPending: number;

  @ApiProperty()
  averageQuizScore: number;

  @ApiProperty()
  averagePracticeScore: number;

  @ApiProperty()
  overallCompletionRate: number;
}

export class ExamSummaryDto {
  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  classroomId: number;

  @ApiProperty()
  classroomName: string;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  highestScore: number;

  @ApiProperty()
  lowestScore: number;

  @ApiProperty()
  completionRate: number;
}

export class ChartDataDto {
  @ApiProperty({ type: [String] })
  labels: string[];

  @ApiProperty({ type: [Number] })
  quizScores: number[];

  @ApiProperty({ type: [Number] })
  practiceScores: number[];
}

export class ExamStatisticsOverviewResponseDto {
  @ApiProperty({ type: OverviewSummaryDto })
  summary: OverviewSummaryDto;

  @ApiProperty({ type: [ExamSummaryDto] })
  quizExams: ExamSummaryDto[];

  @ApiProperty({ type: [ExamSummaryDto] })
  practiceExams: ExamSummaryDto[];

  @ApiProperty({ type: ChartDataDto })
  chartData: ChartDataDto;
}

// ========== QUIZ EXAM STATISTICS DTOs ==========

export class QuizExamInfoDto {
  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  questionCount: number;

  @ApiProperty()
  totalAttempts: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  passRate: number;
}

export class QuizStudentResultDto {
  @ApiProperty()
  studentId: number;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  studentCode: string;

  @ApiProperty()
  classroomId: number;

  @ApiProperty()
  classroomName: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  correctAnswers: number;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  isFinished: boolean;

  @ApiProperty()
  attemptCount: number;

  @ApiProperty()
  lastSubmittedAt: Date;
}

export class ScoreDistributionDto {
  @ApiProperty()
  '0-2': number;

  @ApiProperty()
  '2-4': number;

  @ApiProperty()
  '4-6': number;

  @ApiProperty()
  '6-8': number;

  @ApiProperty()
  '8-10': number;
}

export class QuestionAnalysisDto {
  @ApiProperty()
  questionId: number;

  @ApiProperty()
  questionContent: string;

  @ApiProperty()
  correctRate: number;

  @ApiProperty()
  totalAttempts: number;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'] })
  difficulty: 'easy' | 'medium' | 'hard';
}

export class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  totalCount: number;
}

export class QuizExamStatisticsResponseDto {
  @ApiProperty({ type: QuizExamInfoDto })
  exam: QuizExamInfoDto;

  @ApiProperty({ type: [QuizStudentResultDto] })
  students: QuizStudentResultDto[];

  @ApiProperty()
  totalStudents: number;

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: ScoreDistributionDto })
  scoreDistribution: ScoreDistributionDto;

  @ApiProperty({ type: [QuestionAnalysisDto] })
  questionAnalysis: QuestionAnalysisDto[];
}

// ========== QUIZ RESULT DETAIL DTOs ==========

export class QuizExamBasicInfoDto {
  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  totalQuestions: number;
}

export class StudentBasicInfoDto {
  @ApiProperty()
  studentId: number;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  studentCode: string;
}

export class QuizAttemptInfoDto {
  @ApiProperty()
  userExamId: number;

  @ApiProperty()
  score: number;

  @ApiProperty()
  isFinished: boolean;

  @ApiProperty()
  submittedAt: Date;
}

export class AnswerDetailDto {
  @ApiProperty()
  answerId: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  isSelected: boolean;
}

export class QuestionDetailDto {
  @ApiProperty()
  questionId: number;

  @ApiProperty()
  questionContent: string;

  @ApiProperty({ enum: ['single', 'multiple'] })
  questionType: 'single' | 'multiple';

  @ApiProperty({ required: false })
  imageLocation?: string;

  @ApiProperty({ required: false })
  videoLocation?: string;

  @ApiProperty({ type: [AnswerDetailDto] })
  selectedAnswers: AnswerDetailDto[];

  @ApiProperty({ type: [AnswerDetailDto] })
  correctAnswers: AnswerDetailDto[];

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  points: number;

  @ApiProperty()
  maxPoints: number;
}

export class QuizResultSummaryDto {
  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  correctAnswers: number;

  @ApiProperty()
  wrongAnswers: number;

  @ApiProperty()
  unanswered: number;

  @ApiProperty()
  totalScore: number;

  @ApiProperty()
  percentage: number;
}

export class QuizResultDetailResponseDto {
  @ApiProperty({ type: QuizExamBasicInfoDto })
  exam: QuizExamBasicInfoDto;

  @ApiProperty({ type: StudentBasicInfoDto })
  student: StudentBasicInfoDto;

  @ApiProperty({ type: QuizAttemptInfoDto })
  attempt: QuizAttemptInfoDto;

  @ApiProperty({ type: [QuestionDetailDto] })
  questions: QuestionDetailDto[];

  @ApiProperty({ type: QuizResultSummaryDto })
  summary: QuizResultSummaryDto;
}

// ========== PRACTICE EXAM STATISTICS DTOs ==========

export class PracticeExamInfoDto {
  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  vocabularyCount: number;

  @ApiProperty()
  totalAttempts: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  gradedCount: number;

  @ApiProperty()
  pendingCount: number;
}

export class PracticeStudentResultDto {
  @ApiProperty()
  studentId: number;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  studentCode: string;

  @ApiProperty()
  classroomId: number;

  @ApiProperty()
  classroomName: string;

  @ApiProperty({ required: false })
  score?: number;

  @ApiProperty()
  isFinished: boolean;

  @ApiProperty()
  isGraded: boolean;

  @ApiProperty()
  attemptCount: number;

  @ApiProperty()
  lastSubmittedAt: Date;

  @ApiProperty({ required: false })
  gradedAt?: Date;

  @ApiProperty()
  aiAccuracy: number;

  @ApiProperty()
  videoCount: number;
}

export class PracticeScoreDistributionDto extends ScoreDistributionDto {
  @ApiProperty()
  ungraded: number;
}

export class VocabularyAnalysisDto {
  @ApiProperty()
  vocabularyId: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  instruction: string;

  @ApiProperty()
  totalSubmissions: number;

  @ApiProperty()
  aiMatchRate: number;
}

export class PracticeExamStatisticsResponseDto {
  @ApiProperty({ type: PracticeExamInfoDto })
  exam: PracticeExamInfoDto;

  @ApiProperty({ type: [PracticeStudentResultDto] })
  students: PracticeStudentResultDto[];

  @ApiProperty()
  totalStudents: number;

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: PracticeScoreDistributionDto })
  scoreDistribution: PracticeScoreDistributionDto;

  @ApiProperty({ type: [VocabularyAnalysisDto] })
  vocabularyAnalysis: VocabularyAnalysisDto[];
}

// ========== PRACTICE RESULT DETAIL DTOs ==========

export class PracticeExamBasicInfoDto {
  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  vocabularyCount: number;
}

export class PracticeAttemptInfoDto {
  @ApiProperty()
  userPracticeId: number;

  @ApiProperty({ required: false })
  score?: number;

  @ApiProperty()
  isFinished: boolean;

  @ApiProperty()
  isGraded: boolean;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty({ required: false })
  gradedAt?: Date;
}

export class VocabularyDetailDto {
  @ApiProperty()
  vocabularyId: number;

  @ApiProperty()
  vocabularyContent: string;

  @ApiProperty()
  instruction: string;

  @ApiProperty()
  videoUrl: string;

  @ApiProperty({ required: false })
  aiAnswer?: string;

  @ApiProperty()
  aiMatched: boolean;
}

export class PracticeResultSummaryDto {
  @ApiProperty()
  totalVocabularies: number;

  @ApiProperty()
  videosSubmitted: number;

  @ApiProperty()
  aiMatchCount: number;

  @ApiProperty()
  aiAccuracy: number;

  @ApiProperty({ required: false })
  totalScore?: number;

  @ApiProperty()
  isGraded: boolean;
}

export class PracticeResultDetailResponseDto {
  @ApiProperty({ type: PracticeExamBasicInfoDto })
  exam: PracticeExamBasicInfoDto;

  @ApiProperty({ type: StudentBasicInfoDto })
  student: StudentBasicInfoDto;

  @ApiProperty({ type: PracticeAttemptInfoDto })
  attempt: PracticeAttemptInfoDto;

  @ApiProperty({ type: [VocabularyDetailDto] })
  vocabularies: VocabularyDetailDto[];

  @ApiProperty({ type: PracticeResultSummaryDto })
  summary: PracticeResultSummaryDto;
}

// ========== MY STATISTICS DTOs ==========

export class StudentInfoDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  studentCode: string;
}

export class QuizExamAttemptDto {
  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  correctAnswers: number;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  attemptCount: number;

  @ApiProperty()
  lastSubmittedAt: Date;
}

export class QuizExamsStatsDto {
  @ApiProperty()
  totalAttempts: number;

  @ApiProperty()
  completedExams: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  highestScore: number;

  @ApiProperty()
  lowestScore: number;

  @ApiProperty({ type: [QuizExamAttemptDto] })
  exams: QuizExamAttemptDto[];
}

export class PracticeExamAttemptDto {
  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty({ required: false })
  score?: number;

  @ApiProperty()
  isGraded: boolean;

  @ApiProperty()
  vocabularyCount: number;

  @ApiProperty()
  attemptCount: number;

  @ApiProperty()
  lastSubmittedAt: Date;
}

export class PracticeExamsStatsDto {
  @ApiProperty()
  totalAttempts: number;

  @ApiProperty()
  gradedExams: number;

  @ApiProperty()
  pendingExams: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  highestScore: number;

  @ApiProperty()
  aiAccuracy: number;

  @ApiProperty({ type: [PracticeExamAttemptDto] })
  exams: PracticeExamAttemptDto[];
}

export class ProgressChartDto {
  @ApiProperty({ type: [String] })
  labels: string[];

  @ApiProperty({ type: [Number] })
  quizScores: number[];

  @ApiProperty({ type: [Number] })
  practiceScores: number[];
}

export class PerformancePeriodDto {
  @ApiProperty()
  quizAvg: number;

  @ApiProperty()
  practiceAvg: number;
}

export class PerformanceTrendDto {
  @ApiProperty({ type: PerformancePeriodDto })
  last7Days: PerformancePeriodDto;

  @ApiProperty({ type: PerformancePeriodDto })
  last30Days: PerformancePeriodDto;

  @ApiProperty({ type: PerformancePeriodDto })
  overall: PerformancePeriodDto;
}

export class MyStatisticsResponseDto {
  @ApiProperty({ type: StudentInfoDto })
  student: StudentInfoDto;

  @ApiProperty({ type: QuizExamsStatsDto })
  quizExams: QuizExamsStatsDto;

  @ApiProperty({ type: PracticeExamsStatsDto })
  practiceExams: PracticeExamsStatsDto;

  @ApiProperty({ type: ProgressChartDto })
  progressChart: ProgressChartDto;

  @ApiProperty({ type: PerformanceTrendDto })
  performanceTrend: PerformanceTrendDto;
}
