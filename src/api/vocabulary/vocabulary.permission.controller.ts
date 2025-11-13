import { Body, Delete, Param, Post, Put, Req } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { CreateVocabularyDto, UpdateVocabularyDto } from 'src/dto/vocabulary-dto/create-vocabulary.dto';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { VocabularyAction, VocabularySummary } from './vocabulary.permission.interface';
import { VocabularyService } from './vocabulary.service';

@IsAuthController(EntityNameConst.VOCABULARY, true)
export class VocabularyPermissionController implements Record<VocabularyAction, any> {
  constructor(private readonly vocabularyService: VocabularyService) {}

  [VocabularyAction.Approve_Vocabulary]: any;

  @Post('/')
  @ApiHandleResponse({
    type: ClassRoom,
    summary: VocabularyAction.Create_Vocabulary,
  })
  async [VocabularyAction.Create_Vocabulary](@Req() req: RequestAuth, @Body() body: CreateVocabularyDto) {
    return await this.vocabularyService.create(req.user.userId, body, VocabularyAction.Create_Vocabulary);
  }

  @Put('/:id')
  @ApiHandleResponse({
    summary: VocabularySummary.Update_Vocabulary,
    type: Boolean,
  })
  async [VocabularyAction.Update_Vocabulary](
    @Req() req: RequestAuth,
    @Param('id') id: number,
    @Body() body: UpdateVocabularyDto,
  ) {
    return await this.vocabularyService.updateById(id, req.user, body, VocabularyAction.Update_Vocabulary);
  }

  @Delete('/delete-list')
  @ApiHandleResponse({
    summary: VocabularySummary.Delete_Vocabulary,
    type: Boolean,
  })
  async [VocabularyAction.Delete_Vocabulary](@Req() req: RequestAuth, @Body() body: any) {
    return await this.vocabularyService.deleteByIds(body.vocabularyIds, req.user, VocabularyAction.Delete_Vocabulary);
  }
}
