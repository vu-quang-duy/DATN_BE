import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStorageTypeToExamVideo1733472726000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột storage_type để phân biệt video lưu ở đâu
    await queryRunner.addColumn(
      'exam_video',
      new TableColumn({
        name: 'storage_type',
        type: 'varchar',
        length: '20',
        default: "'filesystem'", // Mặc định là filesystem cho video cũ
        comment: 'filesystem | minio',
      }),
    );

    // Update tất cả video hiện có thành 'filesystem' (video cũ)
    await queryRunner.query(`
      UPDATE exam_video 
      SET storage_type = 'filesystem' 
      WHERE storage_type IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('exam_video', 'storage_type');
  }
}
