import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { ForumPostService } from "./forum-post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

const uploadDir = "./uploads/forum";

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller("forum/post")
export class ForumPostController {
  constructor(private readonly postService: ForumPostService) {}

  // ================= GET =================

  @Get()
  findAll(@Req() req: any) {
    const userId = req?.user?.userId; // optional
    return this.postService.findAll(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.postService.findOne(id, userId);
  }

  // ================= CREATE =================

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor("files", 20, {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");

        if (isImage || isVideo) {
          cb(null, true);
        } else {
          cb(new Error("Chỉ cho phép upload ảnh hoặc video"), false);
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  create(
    @Req() req: any,
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postService.create(req.user.userId, dto, files || []);
  }

  // ================= LIKE =================

  @UseGuards(JwtAuthGuard)
  @Post(":id/like")
  toggleLike(@Param("id") id: string, @Req() req: any) {
    return this.postService.toggleLike(id, req.user.userId);
  }

  // ================= COMMENT =================

  @UseGuards(JwtAuthGuard)
  @Post(":id/comment")
  addComment(
    @Param("id") id: string,
    @Req() req: any,
    @Body("content") content: string,
  ) {
    return this.postService.addComment(id, req.user.userId, content);
  }

  // ================= SHARE =================

  @Post(":id/share")
  share(@Param("id") id: string) {
    return this.postService.sharePost(id);
  }

  // ================= DELETE =================

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  deletePost(@Param("id") id: string, @Req() req: any) {
    return this.postService.deletePost(
      id,
      req.user.userId,
      req.user.role,
    );
  }
}