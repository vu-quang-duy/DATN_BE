import { Expose } from 'class-transformer';  // Thêm import này nếu chưa có
import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
    // TRƯỜNG TÙY CHỈNH: ID
    @ApiProperty({ example: 12345, description: 'ID khóa chính của người dùng' })
    @Expose()  // Thêm @Expose() để class-transformer giữ lại trường này
    id: number;

    // CÁC TRƯỜNG CƠ BẢN (Từ UserHelper.selectBasicInfo)
    @ApiProperty({ example: 'Nguyễn Văn Tuyên', description: 'Tên người dùng' })
    @Expose()  // Thêm cho tất cả trường
    name: string;
    
    @ApiProperty({ example: 'tuyen.trinh@example.com', description: 'Địa chỉ Email' })
    @Expose()
    email: string;

    @ApiProperty({ example: '+84987654321', required: false, description: 'Số điện thoại' })
    @Expose()
    phoneNumber?: string;

    // CÁC TRƯỜNG THÊM VÀO TRONG SELECT
    @ApiProperty({ example: '2025-11-15T00:00:00.000Z', description: 'Thời gian tạo hồ sơ' })
    @Expose()
    createdDate: Date;

    @ApiProperty({ example: '2025-11-15T10:30:00.000Z', description: 'Thời gian cập nhật gần nhất' })
    @Expose()
    updatedAt: Date;
    
    @ApiProperty({ example: 'Số 1 Đại Cồ Việt', description: 'Địa chỉ cụ thể (số nhà, đường)' })
    @Expose()
    address: string;

    @ApiProperty({ example: '2001-07-18', description: 'Ngày sinh' })
    @Expose()
    birthDay: Date;

    @ApiProperty({ example: 1, description: 'ID trường học' })
    @Expose()
    schoolId: number;

    @ApiProperty({ example: 'Hai Bà Trưng', description: 'Quận/Huyện' })
    @Expose()
    district: string;

    @ApiProperty({ example: 'Hà Nội', description: 'Tỉnh/Thành phố' })
    @Expose()
    city: string;

    @ApiProperty({ example: 'Bách Khoa', description: 'Phường/Xã' })
    @Expose()
    ward: string;

    // TRƯỜNG TÙY CHỈNH: ROLE (Từ user.role.roleCode)
    @ApiProperty({ example: 'STUDENT', description: 'Mã vai trò (roleCode) của người dùng' })
    @Expose()
    role: string;
}