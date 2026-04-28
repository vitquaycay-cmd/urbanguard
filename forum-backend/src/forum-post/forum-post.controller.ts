import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ForumPostService } from "./forum-post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("forum/post")
export class ForumPostController {
  constructor(private readonly postService: ForumPostService) {}

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postService.create(req.user.userId, dto);
  }

   @UseGuards(JwtAuthGuard)
  @Delete(":id")
  deletePost(@Param("id") id: string, @Req() req: any) {
    return this.postService.deletePost(id, req.user.userId);
  }
}