import { Resource } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsEnum,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 Import Swagger

export enum Action {
  CREATE = 'CREATE',
  SHOW = 'SHOW',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// 1. Tinh chỉnh class Permission (Lớp con)
export class Permission {
  @ApiProperty({
    description: 'Tên tài nguyên cần phân quyền',
    enum: Resource, // 👈 Swagger sẽ tự lấy các giá trị từ Enum Prisma
    example: 'POST',
  })
  @IsEnum(Resource)
  resource!: Resource;

  @ApiProperty({
    description: 'Danh sách các hành động được phép trên tài nguyên này',
    enum: Action,
    isArray: true, // 👈 Báo cho Swagger biết đây là một mảng
    example: [Action.CREATE, Action.READ],
  })
  @IsEnum(Action, { each: true })
  @ArrayUnique()
  actions!: Action[];
}

// 2. Tinh chỉnh class CreateRoleDto (Lớp cha)
export class CreateRoleDto {
  @ApiProperty({
    description: 'Tên của vai trò (Role)',
    example: 'Quản trị viên (Admin)',
  })
  @IsString()
  @MinLength(3, { message: 'Tên vai trò phải dài ít nhất 3 ký tự' })
  name!: string;

  @ApiProperty({
    description: 'Danh sách các quyền hạn được cấp cho vai trò này',
    type: [Permission], // 👈 Swagger sẽ tham chiếu đến class Permission ở trên
  })
  @ValidateNested({ each: true }) // Bổ sung check từng phần tử trong mảng
  @Type(() => Permission)
  permissions!: Permission[];
}
