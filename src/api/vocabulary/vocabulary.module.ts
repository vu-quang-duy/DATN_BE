import { Module } from '@nestjs/common';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyPermissionController } from './vocabulary.permission.controller';
import { VocabularyService } from './vocabulary.service';
@Module({
  providers: [VocabularyService],
  controllers: [VocabularyPermissionController, VocabularyController],
})
export class VocabularyModule {}
