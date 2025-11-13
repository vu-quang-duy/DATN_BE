export enum UploadFileType {}

export enum UploadImageType {
  USER_AVATAR = 'USER_AVATAR',
  USER_COVER_IMAGE = 'USER_COVER_IMAGE',
  CLASS_THUMBNAIL = 'CLASS_THUMBNAIL',
}

export const UploadConst = Object.freeze({
  maxFileImageSize: 5, //MB
  // DIR
  dirTemp: `temp`,
  dirUserAvatar: `user/avatar`,
  dirUserCover: `user/cover`,
  dirClassThumbnail: `class/thumbnail`,
});
