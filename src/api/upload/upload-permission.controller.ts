import { Body, ParseFilePipe, Post, Request, UploadedFiles } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { UploadImageDto, UploadFileDto } from 'src/dto/upload-dto/upload-file-dto';
import { UploadAction, UploadSummary } from './upload-permission.interface';
import { UploadFileFormData, UploadImageFormData } from './upload.Interceptor';
import { UploadService } from './upload.service';

@IsAuthController(EntityNameConst.UPLOAD, true)
export class UploadPermissionController implements Record<UploadAction, any> {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/file')
  @UploadFileFormData({})
  @ApiHandleResponse({ summary: UploadSummary.File, type: String })
  async [UploadAction.File](
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    { file },
    @Request() req: RequestAuth,
    @Body() body: UploadFileDto,
  ) {
    return this.uploadService.uploadFile(req.user.userId, body, file[0]);
  }

  @Post('/image')
  @UploadImageFormData({})
  @ApiHandleResponse({ summary: UploadSummary.File, type: String })
  async [UploadAction.Image](
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    { file },
    @Request() req: RequestAuth,
    @Body() body: UploadImageDto,
  ) {
    return this.uploadService.uploadImage(req.user.userId, body, file[0]);
  }
}
