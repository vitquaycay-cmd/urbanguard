import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ForumPostService } from "./forum-post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("forum/post")
export class ForumPostController {
  constructor(private readonly postService: ForumPostService) {}

  // ================= STATS =================

  @Get("stats")
  getStats() {
    return this.postService.getStats();
  }

  // ================= GET =================

  @Get()
  findAll(@Req() req: any) {
    const userId = req?.user?.userId;
    return this.postService.findAll(userId);
  }

  @Get("featured")
  getFeaturedPosts() {
    return this.postService.getFeaturedPosts();
  }

  @Get("top-users")
  getTopUsers() {
    return this.postService.getTopUsers();
  }

  @Get("search")
  searchPosts(@Query("q") q: string, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.postService.searchPosts(q, userId);
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
      storage: memoryStorage(),
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
        fileSize: 50 * 1024 * 1024,
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
    return this.postService.deletePost(id, req.user.userId, req.user.role);
  }
}