import { Get, Param, Query } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { SearchVocabularyDto } from 'src/dto/vocabulary-dto/search-vocabulary.dto';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';
import { VocabularyService } from './vocabulary.service';

@IsAuthController(EntityNameConst.VOCABULARY, false)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get('/all')
  @ApiHandleResponse({
    summary: 'Get all vocabulary',
    type: Vocabulary,
  })
  async search(@Query() query: SearchVocabularyDto) {
    return await this.vocabularyService.search(query);
  }

  @Get('/:id')
  @ApiHandleResponse({
    summary: 'Get vocabulary by id',
    type: Vocabulary,
  })
  async getProfileById(@Param('id') id: number) {
    return await this.vocabularyService.getById(id);
  }
}
