import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ForumNotificationService } from "./forum-notification.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("forum-notifications")
@UseGuards(JwtAuthGuard)
export class ForumNotificationController {
  constructor(private service: ForumNotificationService) {}

  // ================= GET ALL =================
  @Get()
  getMy(@Req() req: any) {
    return this.service.getMyNotifications(req.user.id);
  }

  // ================= COUNT UNREAD =================
  @Get("unread-count")
  count(@Req() req: any) {
    return this.service.countUnread(req.user.id);
  }

  // ================= MARK 1 =================
  @Patch(":id/read")
  markRead(@Param("id") id: string) {
    return this.service.markAsRead(id);
  }

  // ================= MARK ALL =================
  @Patch("read-all")
  markAll(@Req() req: any) {
    return this.service.markAllAsRead(req.user.id);
  }
}