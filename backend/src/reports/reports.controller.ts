import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportsService } from './reports.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = join(process.cwd(), 'uploads');

function multerFilename(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void,
) {
  const ext = extname(file.originalname || '').toLowerCase();
  const safeExt =
    ext && ext.length <= 8 && /^\.[a-z0-9.]+$/i.test(ext) ? ext : '.bin';
  cb(null, `${Date.now()}-${randomUUID()}${safeExt}`);
}

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

<<<<<<< HEAD
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Danh sách báo cáo (admin) — filter + phân trang + sort',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách báo cáo với metadata phân trang',
  })
  @ApiResponse({ status: 403, description: 'Không phải ADMIN' })
  findAll(@Query() query: QueryReportsDto) {
    return this.reportsService.findAll(query);
  }

=======
  @SkipThrottle()
>>>>>>> Viet
  @Get('active')
  @ApiOperation({
    summary: 'Bản đồ: danh sách báo cáo đã duyệt (status = VALIDATED)',
    description:
      'Public. `status: VALIDATED` và `trustScore > 0` (bản đồ / né đường). Có `aiLabels` khi có.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Mảng báo cáo; mỗi phần tử có status = VALIDATED (PENDING, REJECTED, RESOLVED không có trong danh sách này).',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'id',
          'title',
          'description',
          'latitude',
          'longitude',
          'status',
          'trustScore',
          'createdAt',
        ],
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string' },
          description: { type: 'string' },
          latitude: { type: 'number', format: 'double' },
          longitude: { type: 'number', format: 'double' },
          imageUrl: { type: 'string', nullable: true },
          trustScore: { type: 'number', format: 'double' },
          aiLabels: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
            description: 'Nhãn AI (JSON), có thể null',
          },
          createdAt: { type: 'string', format: 'date-time' },
          status: {
            type: 'string',
            enum: ['VALIDATED'],
            example: 'VALIDATED',
          },
        },
      },
    },
  })
  getActive() {
    return this.reportsService.findActiveValidated();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết một báo cáo' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của báo cáo' })
  @ApiResponse({
    status: 200,
    description: 'Đầy đủ thông tin báo cáo kèm user',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gửi báo cáo sự cố (ảnh + GPS + mô tả)',
    description:
      'Yêu cầu JWT. AI: `detected` và `confidence>0.7` → VALIDATED, trustScore=15, Socket `report:new` { id, lat, lng, aiLabels, trustScore }. Ngược lại PENDING. Lỗi AI → PENDING, aiSummary dạng chuỗi `AI_ERROR: ...`.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Form gồm các trường text + một file ảnh',
    schema: {
      type: 'object',
      required: ['title', 'description', 'latitude', 'longitude', 'image'],
      properties: {
        title: { type: 'string', example: 'Ngập nước đoạn đường X' },
        description: { type: 'string', example: 'Nước ngập sâu khoảng 30cm, cản trở xe máy.' },
        latitude: { type: 'number', format: 'double', example: 10.762622 },
        longitude: { type: 'number', format: 'double', example: 106.660172 },
        image: { type: 'string', format: 'binary', description: 'Ảnh đính kèm (JPEG/PNG/GIF/WebP), tối đa 5MB' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Đã tạo báo cáo. status có thể PENDING hoặc VALIDATED (AI tự duyệt). Có aiSummary, aiLabels, trustScore; phía client map nên lắng nghe Socket report:new.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        status: {
          type: 'string',
          enum: ['PENDING', 'VALIDATED'],
          example: 'PENDING',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        imageUrl: { type: 'string', nullable: true },
        trustScore: {
          type: 'number',
          description: '15 nếu AI tự VALIDATED; 0 nếu chờ admin / lỗi AI',
        },
        aiSummary: {
          type: 'object',
          description: 'JSON từ /ai/analyze hoặc { ok:false, error }',
          additionalProperties: true,
        },
        aiLabels: {
          type: 'array',
          items: { type: 'string' },
          nullable: true,
          description: 'Nhãn AI (khi có detection)',
        },
        createdAt: { type: 'string', format: 'date-time' },
        userId: { type: 'integer' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc thiếu ảnh' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập / JWT không hợp lệ' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: multerFilename,
      }),
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  async create(
    @Body() dto: CreateReportDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_BYTES }),
          // diskStorage không có file.buffer → FileTypeValidator mặc định (magic number) luôn fail.
          new FileTypeValidator({
            fileType: /^image\/(jpeg|jpg|png|gif|webp)(\s*;.*)?$/i,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.reportsService.create(user.id, dto, file);
  }

  @SkipThrottle()
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: PENDING → VALIDATED hoặc REJECTED',
    description:
      'Lưu đúng enum trong DB: VALIDATED hoặc REJECTED. Khi VALIDATED: cộng reputationScore cho chủ báo cáo.',
  })
  @ApiBody({ type: UpdateReportStatusDto })
  @ApiResponse({
    status: 200,
    description:
      'Báo cáo sau cập nhật; `status` trong DB là VALIDATED hoặc REJECTED. Kèm `adminAction` trùng body gửi lên.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        status: {
          type: 'string',
          enum: ['VALIDATED', 'REJECTED'],
          example: 'VALIDATED',
        },
        adminAction: {
          type: 'string',
          enum: ['VALIDATED', 'REJECTED'],
          description: 'Giống trường status trong request body',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        imageUrl: { type: 'string', nullable: true },
        trustScore: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        userId: { type: 'integer' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Báo cáo không còn PENDING (chỉ duyệt / từ chối khi đang PENDING)',
  })
  @ApiResponse({ status: 403, description: 'Không phải ADMIN' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(id, dto.status);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xóa báo cáo giả (admin) — xóa record + file ảnh',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID của báo cáo cần xóa' })
  @ApiResponse({
    status: 200,
    description: 'Đã xóa báo cáo và file ảnh',
  })
  @ApiResponse({ status: 403, description: 'Không phải ADMIN' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }

}