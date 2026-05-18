import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
import { Role } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { QueryReportsDto } from "./dto/query-reports.dto";
import { UpdateReportStatusDto } from "./dto/update-report-status.dto";
import { ReportsService } from "./reports.service";

const uploadDir = "./uploads/reports";

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

function filename(
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void,
) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  cb(null, `${unique}${extname(file.originalname)}`);
}

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("active")
  findActiveReports() {
    return this.reportsService.findActiveReports();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Danh sách báo cáo (admin) — filter + phân trang + sort",
  })
  @ApiResponse({
    status: 200,
    description: "Danh sách báo cáo với metadata phân trang",
  })
  @ApiResponse({ status: 403, description: "Không phải ADMIN" })
  findAll(@Query() query: QueryReportsDto) {
    return this.reportsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: uploadDir,
        filename,
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new BadRequestException("File phải là ảnh"), false);
        }

        cb(null, true);
      },
    }),
  )
  createReport(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException("Vui lòng gửi ảnh hiện trường");
    }

    return this.reportsService.createReport({
      user: req.user,
      body,
      image,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Chi tiết một báo cáo (admin)" })
  @ApiParam({ name: "id", type: Number, description: "ID của báo cáo" })
  @ApiResponse({
    status: 200,
    description: "Đầy đủ thông tin báo cáo kèm user",
  })
  @ApiResponse({ status: 404, description: "Không tìm thấy báo cáo" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin cập nhật trạng thái báo cáo" })
  @ApiParam({ name: "id", type: Number, description: "ID của báo cáo" })
  @ApiResponse({ status: 200, description: "Đã cập nhật trạng thái" })
  @ApiResponse({ status: 403, description: "Không phải ADMIN" })
  @ApiResponse({ status: 404, description: "Không tìm thấy báo cáo" })
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(id, dto.status);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin xóa mềm báo cáo" })
  @ApiParam({ name: "id", type: Number, description: "ID của báo cáo" })
  @ApiResponse({ status: 200, description: "Đã xóa báo cáo" })
  @ApiResponse({ status: 403, description: "Không phải ADMIN" })
  @ApiResponse({ status: 404, description: "Không tìm thấy báo cáo" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }
}
