import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Request } from "express";
import { skipAllThrottles } from "../common/throttle-skip";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @SkipThrottle(skipAllThrottles)
  @UseGuards(JwtAuthGuard)
  @Get("unread-count")
  getUnreadCount(@Req() req: Request) {
    return this.notificationsService.getUnreadCount(req.user!.id);
  }

  @SkipThrottle(skipAllThrottles)
  @UseGuards(JwtAuthGuard)
  @Patch("read-all")
  markAllRead(@Req() req: Request) {
    return this.notificationsService.markAllRead(req.user!.id);
  }

  @SkipThrottle(skipAllThrottles)
  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteAll(@Req() req: Request) {
    return this.notificationsService.deleteAllForUser(req.user!.id);
  }

  @SkipThrottle(skipAllThrottles)
  @UseGuards(JwtAuthGuard)
  @Patch(":id/read")
  markRead(
    @Req() req: Request,
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markRead(req.user!.id, id);
  }

  @SkipThrottle(skipAllThrottles)
  @UseGuards(JwtAuthGuard)
  @Get()
  list(
    @Req() req: Request,
    @Query("type") type?: string,
    @Query("unreadOnly") unreadOnly?: string,
  ) {
    const onlyUnread = unreadOnly === "true" || unreadOnly === "1";
    return this.notificationsService.listForUser(
      req.user!.id,
      type,
      onlyUnread,
    );
  }
}
