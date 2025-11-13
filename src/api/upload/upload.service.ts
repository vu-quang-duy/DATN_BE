import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Client } from 'minio';
import * as path from 'path';
import { UploadConst, UploadImageType } from 'src/constant/upload';
import { UploadFileDto, UploadImageDto } from 'src/dto/upload-dto/upload-file-dto';
import { Upload } from 'src/entities/upload/upload.entity';
import { MinioService } from 'src/utils/minio';
import { DataSource } from 'typeorm';

@Injectable()
export class UploadService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  private readonly minioClient: Client;

  getFilePath = (type: UploadImageType, fileName: string) => {
    switch (type) {
      case UploadImageType.USER_AVATAR:
        return `${UploadConst.dirUserAvatar}/${fileName}`;
      case UploadImageType.USER_COVER_IMAGE:
        return `${UploadConst.dirUserCover}/${fileName}`;
      default:
        return fileName;
    }
  };

  uploadFile = async (creatorId: number, body: UploadFileDto | UploadImageDto | any, file: Express.Multer.File) => {
    const extName = path.extname(file.originalname);
    const uploadName = path.parse(file.originalname).name.replace(/\s+/g, '_');
    const randName = `${Date.now()}${Math.random().toString().substring(2, 8)}`;
    const fileName = `${uploadName}-${randName}${extName}`;
    const pathImage = this.getFilePath(body.type, fileName);
    const minio = new MinioService();
    await minio.upload(pathImage, file.buffer);
    await Upload.save({ path: pathImage, creatorId });
    return pathImage;
  };

  uploadImage = async (creatorId: number, body: UploadImageDto, image: Express.Multer.File) => {
    return await this.uploadFile(creatorId, body, image);
  };
}
