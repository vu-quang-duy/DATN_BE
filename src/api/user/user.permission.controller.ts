/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Get, Param, Post, Put, Req, Query, UseGuards} from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { ChangeUserPasswordDto, UpdateUserProfileDto } from 'src/dto/user-dto/update-user-profile.dto';
import { User } from 'src/entities/user/user.entity';
import { VocabularyView } from 'src/entities/vocabulary/vocabulary-view.entity';
import { UserAction, UserSummary } from './user.permission.interface';
import { UserService } from './user.service';
import {AccessTokenGuard} from '../../auth/access-token.guard'

@IsAuthController(`${EntityNameConst.USER}`, false)
export class UserPermissionController implements Record<UserAction, any> {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  @ApiHandleResponse({ type: User, summary: UserSummary.GetMyProfile })
  async [UserAction.GetMyProfile](@Req() req: RequestAuth) {
    return await this.userService.getProfile(req.user);
  }

  @Get('/class-joined')
  @ApiHandleResponse({ type: User, summary: 'Get class joined' })
  async getClassJoined(@Req() req: RequestAuth) {
    console.log('Authorization header:', req.headers.authorization);
    console.log(req.user);
    return await this.userService.getClassJoined(req.user);
  }
  // @Get('/class-joined')
  // @ApiHandleResponse({ type: User, summary: 'Get class joined' })
  // // async getClassJoined(@Query('userId') userId: number) {
  // //   console.log('Received userId:', userId);
  // //   // No need to extract userId from req.user since it's provided as a parameter
  // //   return await this.userService.getClassJoined(userId);
  // // }
  // async getClassJoined(@Query('userId') userId: string | number) {
  //   const numericUserId = Number(userId);
  
  //   // Log the userId to check its value and type
  //   console.log('Received userId:', userId, 'Type:', typeof userId);
  //   console.log('Parsed numericUserId:', numericUserId, 'Type:', typeof numericUserId);
  
  //   // Validate userId
  //   if (isNaN(numericUserId) || numericUserId <= 0) {
  //     console.error('Invalid numericUserId:', numericUserId);
  //     throw new Error('Invalid userId provided.');
  //   }
  // }
  // @Get('/class-joined')
  // async getClassJoined(@Query('userId') userId: string) {
  //   console.log('userId type:', typeof userId);
  //   console.log('userId value:', userId);
    
  //   // Try parsing it explicitly
  //   const userIdNum = parseInt(userId, 10);
  //   console.log('parsed userId:', userIdNum, 'isNaN:', isNaN(userIdNum));
    
  //   return await this.userService.getClassJoined(userIdNum);
  // }
//   @Get('/class-joined')
// async getClassJoined() {
//   // Hardcode userId=27 for testing
//   return await this.userService.getClassJoined(27);
// }
// @Get('/class-joined')
// async getClassJoined(@Query('userId') userId: any) {
//   console.log('Raw userId received:', userId);
//   console.log('Type of userId:', typeof userId);
  
//   const parsedUserId = parseInt(userId, 10);
//   console.log('Parsed userId:', parsedUserId);
//   console.log('Is parsed userId NaN?', isNaN(parsedUserId));
  
//   return await this.userService.getClassJoined(parsedUserId);
// }

  @Put('/profile')
  @ApiHandleResponse({ type: User, summary: UserSummary.GetMyProfile })
  async [UserAction.UpdateMyProfile](@Req() req: RequestAuth, @Body() body: UpdateUserProfileDto) {
    return await this.userService.updateProfile(req.user, body, UserAction.UpdateMyProfile);
  }

  @Put('/authorization/:id')
  @ApiHandleResponse({ type: User, summary: UserSummary.Authorization })
  async [UserAction.Authorization](@Req() req: RequestAuth, @Param('id') id: number) {
    return await this.userService.approveUser(req.user.userId, id, UserAction.Authorization);
  }

  @Put('/change-password')
  @ApiHandleResponse({ type: User, summary: UserSummary.ChangePassword })
  async [UserAction.ChangePassword](@Req() req: RequestAuth, @Body() body: ChangeUserPasswordDto) {
    return await this.userService.changePassword(req.user, body);
  }

  // @Post('/vocabulary/view/:id')
  // @ApiHandleResponse({ type: VocabularyView, summary: 'add vocabulary view' })
  // async viewVocabulary(@Req() req: RequestAuth, @Param('id') id: number) {
  //   return await this.userService.viewVocabulary(req.user.userId, id);
  // }
  // @Post('/vocabulary/view')
  // @ApiHandleResponse({ type: VocabularyView, summary: 'add vocabulary view' })
  // async viewVocabulary(
  //   // @Param('id', ParseIntPipe) vocabularyId: number, 
  //   @Body('vocabularyId') vocabularyId: number,
  //   // @Body() body: any
  //   @Body('userId') userId: number
  // ) {
  //   console.log('Received vocabularyId:', vocabularyId);
  //   console.log('Received userId:', userId);
  //   if (!userId) {
  //     throw new Error('userId is required');
  //   }
  //   return await this.userService.viewVocabulary(userId, vocabularyId); 
  // }
}
