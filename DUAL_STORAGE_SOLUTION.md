# ✅ GIẢI PHÁP: HỖ TRỢ DUAL STORAGE (Filesystem + MinIO)

## 📌 Vấn đề
- **Video cũ**: Lưu trong folder `/home/tuyentrinh/Desktop/sign_school/uploads/videos/`
- **Video mới**: Lưu trong MinIO bucket `wesign`
- **Yêu cầu**: Giáo viên cần xem được CẢ HAI loại video khi chấm bài

## ✅ Giải pháp đã triển khai

### 1. **Database Migration** (`1733472726000-add-storage-type-to-exam-video.ts`)
- Thêm cột `storage_type` vào bảng `exam_video`
- Giá trị: `'filesystem'` (video cũ) hoặc `'minio'` (video mới)
- Mặc định: `'filesystem'` cho tất cả video hiện có

### 2. **Entity Update** (`exam-video.entity.ts`)
```typescript
@DBColumn({ type: 'varchar', name: 'storage_type', length: 20, default: 'filesystem' })
storageType: 'filesystem' | 'minio';
```

### 3. **Video URL Service** (`utils/video-url.service.ts`)
Service thông minh để xử lý dual storage:
- **Video cũ (filesystem)**: Trả về `http://202.191.56.11:8088/videos/{filename}`
- **Video mới (MinIO)**: Trả về presigned URL từ MinIO (có thời hạn 7 ngày)

Tính năng:
- `getVideoUrl()`: Lấy URL đúng theo storage type
- `detectStorageType()`: Tự động phát hiện nếu không biết storage type
- `getVideoUrls()`: Batch process nhiều video cùng lúc

### 4. **Backend API Update** (`exam.service.ts`)

#### Upload video mới:
```typescript
// submitPracticeTest() - Line 933
storageType: 'minio' as 'minio'  // Đánh dấu video mới
```

#### Khi lấy video để chấm:
```typescript
// getDetailPracticeExamToScore() - Line 640-660
const fullVideoUrl = await this.videoUrlService.getVideoUrl(
  video.videoUrl,
  video.storageType || 'filesystem'
);
```

**Trả về:**
```json
{
  "videos": [{
    "videoUrl": "http://202.191.56.11:8088/videos/old_video.mp4",  // Video cũ
    "aiAnswer": "hello",
    "storageType": "filesystem"
  }]
}

// Hoặc

{
  "videos": [{
    "videoUrl": "http://localhost:9000/wesign/new_video.mp4?X-Amz-Signature=...",  // Video mới
    "aiAnswer": "hello",
    "storageType": "minio"
  }]
}
```

### 5. **Frontend Update** (`GradeTest.tsx`)
```tsx
// Line 131: Dùng trực tiếp videoUrl (đã là full URL)
<a href={videoUrl} target="_blank">Xem video</a>
```

## 🚀 Cách chạy Migration

### Bước 1: Chạy migration
```bash
cd d:\lab\Project\Wesign\DATN_BE
npm run migration:run
```

hoặc nếu dùng TypeORM CLI:
```bash
npx typeorm migration:run -d src/config/database.config.ts
```

### Bước 2: Restart Backend
```bash
npm run start:dev
```

### Bước 3: Test
1. Học sinh nộp bài practice test mới → lưu vào MinIO với `storageType = 'minio'`
2. Giáo viên vào chấm bài → xem được cả video cũ lẫn mới
3. Check console log để thấy presigned URL được tạo

## 📊 Workflow

```
┌─────────────────────────────┐
│  VIDEO CŨ (trước khi migrate)│
│  storage_type = 'filesystem' │
│  videoUrl = 'old_video.mp4'  │
└────────────┬────────────────┘
             │
             ↓ VideoUrlService.getVideoUrl()
             │
┌────────────────────────────────────────────┐
│ ✅ http://202.191.56.11:8088/videos/      │
│    old_video.mp4                           │
└────────────────────────────────────────────┘
             │
             ↓ Static file serving (NestJS)
             │
┌────────────────────────────────────────────┐
│ /home/tuyentrinh/.../uploads/videos/       │
│ old_video.mp4                              │
└────────────────────────────────────────────┘
```

```
┌─────────────────────────────┐
│  VIDEO MỚI (sau khi migrate) │
│  storage_type = 'minio'      │
│  videoUrl = 'new_video.mp4'  │
└────────────┬────────────────┘
             │
             ↓ VideoUrlService.getVideoUrl()
             │
┌────────────────────────────────────────────┐
│ ✅ http://localhost:9000/wesign/          │
│    new_video.mp4?X-Amz-Signature=...       │
│    (presigned URL, 7 days)                 │
└────────────────────────────────────────────┘
             │
             ↓ MinIO serving
             │
┌────────────────────────────────────────────┐
│ MinIO Storage                              │
│ Bucket: wesign                             │
│ Object: new_video.mp4                      │
└────────────────────────────────────────────┘
```

## 🔍 Troubleshooting

### Video cũ không xem được?
**Check:**
1. File có tồn tại trong `/home/tuyentrinh/Desktop/sign_school/uploads/videos/` không?
2. NestJS có serve static folder không? (check `main.ts` line 17)
3. `storage_type` trong DB có phải `'filesystem'` không?

### Video mới không xem được?
**Check:**
1. File có trong MinIO bucket `wesign` không?
2. MinIO service có chạy không? (`localhost:9000`)
3. `storage_type` trong DB có phải `'minio'` không?
4. Presigned URL có hết hạn không? (7 ngày)

### Cách check MinIO:
```bash
# Access MinIO Console
http://localhost:9001
Username: admin
Password: Password12345@

# Check bucket 'wesign'
```

## 🎯 Lợi ích

✅ **Backward Compatible**: Video cũ vẫn hoạt động bình thường
✅ **Forward Compatible**: Video mới vào MinIO tự động
✅ **Tự động phát hiện**: Code tự động detect storage type nếu thiếu
✅ **Không cần sửa frontend nhiều**: Chỉ cần dùng URL trả về
✅ **Scalable**: Dễ dàng chuyển toàn bộ sang MinIO trong tương lai

## 🔄 Migration Plan (Optional)

Nếu muốn migrate tất cả video cũ sang MinIO:

```typescript
// Script: migrate-old-videos-to-minio.ts
async function migrateOldVideos() {
  const oldVideos = await ExamVideo.find({ 
    where: { storageType: 'filesystem' } 
  });

  for (const video of oldVideos) {
    const filePath = `/home/tuyentrinh/.../uploads/videos/${video.videoUrl}`;
    
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      await minioService.upload(video.videoUrl, buffer);
      
      video.storageType = 'minio';
      await video.save();
      
      console.log(`Migrated: ${video.videoUrl}`);
    }
  }
}
```

## 📝 Notes

- Presigned URL từ MinIO có hiệu lực **7 ngày**
- Sau đó cần generate lại (tự động khi API được gọi)
- Video cũ vẫn an toàn trong filesystem, không bị xóa
- Có thể schedule job để migrate dần video cũ sang MinIO
