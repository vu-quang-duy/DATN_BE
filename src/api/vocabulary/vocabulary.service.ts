import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ERROR_MSG } from 'src/constant/error';
import { CacheUser } from 'src/dto/common-request.dto';
import { PageDto } from 'src/dto/paginate.dto';
import { CreateVocabularyDto, UpdateVocabularyDto } from 'src/dto/vocabulary-dto/create-vocabulary.dto';
import { SearchVocabularyDto } from 'src/dto/vocabulary-dto/search-vocabulary.dto';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';
import { PermissionHelper } from 'src/helper/permisson-helper.service';
import { RoleHelper } from 'src/helper/role-helper.service';
import { VocabularyHelper } from 'src/helper/vocabulary-helper.service';
import { App404Exception, AppException, AppExistedException } from 'src/middleware/app-error-handler';
import { CondUtil } from 'src/utils/condition';
import { GenerateUtil } from 'src/utils/generate';
import { HelperUtils } from 'src/utils/helpers';
import { QueryUtil } from 'src/utils/query';
import { DataSource, In } from 'typeorm';
import { VocabularyAction } from './vocabulary.permission.interface';

@Injectable()
export class VocabularyService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  search = async (query: SearchVocabularyDto): Promise<PageDto<Vocabulary>> => {
    const [data, itemCount] = await Vocabulary.findAndCount({
      select: {
        vocabularyId: true,
        content: true,
        createdAt: true,
        description: true,
        imagesPath: true,
        videosPath: true,
        status: true,
        classroomId: true,
        creatorId: true,
        vocabularyType: true,
        isPrivate: true,
        topicId: true,
        slug: true,
        topic: {
          topicId: true,
          name: true,
        },
      },
      where: VocabularyHelper.getFilterSearchVocabulary(query),
      relations: { topic: true },
      order: QueryUtil.getSort(query.orderBy, query.sortBy),
      skip: query.skip,
      take: query.take,
    });

    return GenerateUtil.paginate({ data, itemCount, query });
  };

  async create(userId: number, body: CreateVocabularyDto, permissionCode) {
    const isExistByName = await HelperUtils.existByName(Vocabulary, body.content, 'content');
    if (isExistByName) throw new AppExistedException('content', body);

    const isPermission = await PermissionHelper.isPermissionChange(userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    const userRole = await RoleHelper.getRoleByUserId(userId);

    const vocabulary = new Vocabulary();

    vocabulary.content = body.content;
    vocabulary.description = body.description;
    vocabulary.imagesPath = body.imagesPath;
    vocabulary.classroomId = body.classroomId;
    vocabulary.creatorId = userId;
    vocabulary.topicId = body.topicId;
    vocabulary.vocabularyType = body.vocabularyType;
    vocabulary.isPrivate = body.isPrivate;

    if (userRole.roleCode === 'ADMIN') {
      vocabulary.status = body.status;
    }

    return await vocabulary.save();
  }

  getById = async (vocabularyId: number): Promise<Vocabulary> => {
    const vocabulary = await Vocabulary.findOne({
      select: {
        topic: {
          topicId: true,
          name: true,
        },
        classroom: {
          classroomId: true,
          name: true,
        },
        creator: {
          userId: true,
          name: true,
        },
      },
      where: { vocabularyId },
      relations: { topic: true, classroom: true, creator: true },
    });
    if (!vocabulary) throw new App404Exception('id', { vocabularyId });
    return vocabulary;
  };

  updateById = async (
    vocabularyId: number,
    user: CacheUser,
    body: UpdateVocabularyDto,
    permissionCode: string,
  ): Promise<Vocabulary> => {
    let vocabulary;
    if (user.code === 'ADMIN') {
      vocabulary = await Vocabulary.findOne({ where: { vocabularyId } });
    } else {
      vocabulary = await Vocabulary.findOne({ where: { vocabularyId, creatorId: user.userId } });
    }
    if (!vocabulary) throw new App404Exception('id', { vocabularyId });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    CondUtil.saveIfChanged(vocabulary, body, [
      'content',
      'description',
      'imagesPath',
      'status',
      'classroomId',
      'videosPath',
      'vocabularyType',
    ]);

    if (!!body.status && body.status !== vocabulary.status) {
      const isPermission = await PermissionHelper.isPermissionChange(user.userId, VocabularyAction.Approve_Vocabulary);
      if (!isPermission) throw new AppException(ERROR_MSG.PERMISSION_DENIED);
      vocabulary.status = body.status;
    }

    return await vocabulary.save();
  };

  deleteByIds = async (vocabularyIds: number[], user: CacheUser, permissionCode): Promise<any> => {
    let vocabulary;
    const userRole = await RoleHelper.getRoleByUserId(user.userId);
    if (userRole.roleCode === 'ADMIN') {
      vocabulary = await Vocabulary.find({ where: { vocabularyId: In(vocabularyIds) } });
    } else {
      vocabulary = await Vocabulary.find({ where: { vocabularyId: In(vocabularyIds), creatorId: user.userId } });
    }

    if (!vocabulary.length) throw new App404Exception('id', { id: vocabularyIds });

    const isPermission = await PermissionHelper.isPermissionChange(user.userId, permissionCode);
    if (!isPermission) throw new App404Exception('permissionCode', { permissionCode });

    await vocabulary.map((vocabulary) => vocabulary.remove());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };
}
