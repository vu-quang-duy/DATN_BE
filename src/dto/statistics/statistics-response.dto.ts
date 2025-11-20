import { ApiProperty } from '@nestjs/swagger';

export class StatisticStudentInfoDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  avatarLocation?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  schoolId?: number;

  @ApiProperty({ required: false })
  schoolName?: string;

  @ApiProperty({ required: false, description: 'Primary classroom id (if any)' })
  classroomId?: number;

  @ApiProperty({ required: false })
  classroomName?: string;

  @ApiProperty({ required: false })
  studentCode?: string;
}

export class StatisticOverviewDto {
  @ApiProperty()
  totalClassesJoined: number;

  @ApiProperty()
  vocabularyViews: number;

  @ApiProperty()
  lessonViews: number;

  @ApiProperty()
  testsCompleted: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  loginCount: number;

  @ApiProperty()
  learningMinutes: number;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;
}

export class StatisticSubjectDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['CLASSROOM', 'TOPIC'] })
  type: 'CLASSROOM' | 'TOPIC';

  @ApiProperty({ required: false })
  classroomId?: number;
}

export class StatisticAttemptSummaryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty({ required: false })
  classRoomId?: number;

  @ApiProperty({ required: false })
  classRoomName?: string;

  @ApiProperty()
  attemptCount: number;

  @ApiProperty()
  completedAttempts: number;

  @ApiProperty({ required: false })
  bestScore?: number;

  @ApiProperty({ required: false })
  latestScore?: number;

  @ApiProperty()
  status: 'completed' | 'in_progress';

  @ApiProperty({ required: false })
  lastAttemptAt?: Date;
}

export class StatisticPerformanceCollectionDto {
  @ApiProperty({ type: [StatisticAttemptSummaryDto] })
  exams: StatisticAttemptSummaryDto[];

  @ApiProperty({ type: [StatisticAttemptSummaryDto] })
  practices: StatisticAttemptSummaryDto[];
}

export class StatisticTimelinePointDto {
  @ApiProperty()
  date: string;

  @ApiProperty({ required: false })
  score?: number;

  @ApiProperty({ enum: ['exam', 'practice'] })
  type: 'exam' | 'practice';

  @ApiProperty()
  label: string;
}

export class StatisticDailyAverageDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  averageScore: number;
}

export class StatisticActivityDto {
  @ApiProperty({ type: [StatisticTimelinePointDto] })
  scoreTimeline: StatisticTimelinePointDto[];

  @ApiProperty({ type: [StatisticDailyAverageDto] })
  dailyAverage: StatisticDailyAverageDto[];
}

export class StatisticFilterMetaDto {
  @ApiProperty({ type: [StatisticSubjectDto] })
  classrooms: StatisticSubjectDto[];

  @ApiProperty({ type: [StatisticSubjectDto] })
  topics: StatisticSubjectDto[];

  @ApiProperty({ type: [String] })
  statusOptions: string[];

  @ApiProperty({ required: false })
  minDate?: string;

  @ApiProperty({ required: false })
  maxDate?: string;
}

export class StudentStatisticsResponseDto {
  @ApiProperty({ type: StatisticStudentInfoDto })
  student: StatisticStudentInfoDto;

  @ApiProperty({ type: StatisticOverviewDto })
  overview: StatisticOverviewDto;

  @ApiProperty({ type: [StatisticSubjectDto] })
  subjects: StatisticSubjectDto[];

  @ApiProperty({ type: StatisticPerformanceCollectionDto })
  performance: StatisticPerformanceCollectionDto;

  @ApiProperty({ type: StatisticActivityDto })
  activity: StatisticActivityDto;

  @ApiProperty({ type: StatisticFilterMetaDto })
  filters: StatisticFilterMetaDto;
}
