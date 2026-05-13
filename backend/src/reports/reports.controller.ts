import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
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
}