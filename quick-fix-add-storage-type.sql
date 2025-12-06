-- Quick fix: Thêm cột storage_type thủ công
ALTER TABLE exam_video 
ADD COLUMN storage_type VARCHAR(20) DEFAULT 'filesystem' 
COMMENT 'filesystem hoặc minio';

-- Update tất cả video hiện có thành filesystem
UPDATE exam_video 
SET storage_type = 'filesystem' 
WHERE storage_type IS NULL;
