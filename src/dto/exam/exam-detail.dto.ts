import { IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';

export class GetExamDetailDto {
    @IsSwaggerNumber({}, false)
    readonly userId: number;

    @IsSwaggerNumber({}, false)
    readonly examId: number;

    @IsSwaggerString({}, false)
    readonly type: string; // 'exam' | 'practice'

    @IsSwaggerNumber({}, false) // ID của lần làm bài (userExamId hoặc userPracticeId)
    readonly attemptId: number;
}
