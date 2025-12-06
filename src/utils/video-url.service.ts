import { Injectable } from '@nestjs/common';
import { MinioService } from './minio';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoUrlService {
    // Legacy video folder path
    private readonly LEGACY_VIDEO_PATH = '/home/tuyentrinh/Desktop/sign_school/uploads/videos';
    private readonly LEGACY_VIDEO_BASE_URL = process.env.VIDEO_BASE_URL || 'http://202.191.56.11:8088/videos/';

    constructor(private readonly minioService: MinioService) { }

    /**
     * Lấy URL đầy đủ cho video dựa trên storage type
     * @param videoUrl - Tên file video (ví dụ: video_123.mp4)
     * @param storageType - 'filesystem' hoặc 'minio'
     * @returns Full URL để frontend có thể load video
     */
    async getVideoUrl(videoUrl: string, storageType: 'filesystem' | 'minio' = 'filesystem'): Promise<string> {
        if (!videoUrl) return null;

        if (storageType === 'minio') {
            // Video mới lưu trong MinIO → trả về presigned URL
            try {
                const presignedUrl = await this.minioService.getUrl(videoUrl, 7 * 24 * 60 * 60); // 7 days
                return presignedUrl;
            } catch (error) {
                console.error(`Failed to get MinIO URL for ${videoUrl}:`, error);
                // Fallback: thử check trong filesystem
                return this.getLegacyVideoUrl(videoUrl);
            }
        }

        // Video cũ lưu trong filesystem → trả về static URL
        return this.getLegacyVideoUrl(videoUrl);
    }

    /**
     * Lấy URL cho video cũ trong filesystem
     */
    private getLegacyVideoUrl(videoUrl: string): string {
        return `${this.LEGACY_VIDEO_BASE_URL}${videoUrl}`;
    }

    /**
     * Kiểm tra xem file có tồn tại trong legacy folder không
     */
    checkLegacyFileExists(videoUrl: string): boolean {
        try {
            const fullPath = path.join(this.LEGACY_VIDEO_PATH, videoUrl);
            return fs.existsSync(fullPath);
        } catch (error) {
            return false;
        }
    }

    /**
     * Tự động phát hiện storage type nếu không biết
     * (Dùng cho trường hợp migration chưa chạy hoặc data cũ)
     */
    async detectStorageType(videoUrl: string): Promise<'filesystem' | 'minio'> {
        // Check trong filesystem trước
        if (this.checkLegacyFileExists(videoUrl)) {
            return 'filesystem';
        }

        // Nếu không có trong filesystem, giả sử là MinIO
        return 'minio';
    }

    /**
     * Batch get URLs cho nhiều video
     */
    async getVideoUrls(
        videos: Array<{ videoUrl: string; storageType?: 'filesystem' | 'minio' }>,
    ): Promise<Array<{ videoUrl: string; fullUrl: string; storageType: string }>> {
        const promises = videos.map(async (video) => {
            const storageType = video.storageType || (await this.detectStorageType(video.videoUrl));
            const fullUrl = await this.getVideoUrl(video.videoUrl, storageType);
            return {
                videoUrl: video.videoUrl,
                fullUrl,
                storageType,
            };
        });

        return Promise.all(promises);
    }
}
