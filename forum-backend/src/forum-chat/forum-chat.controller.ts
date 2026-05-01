import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ForumChatService } from "./forum-chat.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("forum/chat")
@UseGuards(JwtAuthGuard)
export class ForumChatController {
  constructor(private readonly chatService: ForumChatService) {}

  // ================= START CHAT =================
  @Post("start/:userId")
  startChat(@Param("userId") targetUserId: string, @Req() req: any) {
    return this.chatService.startConversation(
      req.user.userId,
      targetUserId,
    );
  }

  // ================= GET CONVERSATIONS =================
  @Get("conversations")
  getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.userId);
  }

  // ================= GET MESSAGES =================
  @Get(":id/messages")
  getMessages(@Param("id") conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  // ================= SEND MESSAGE =================
  @Post(":id/message")
  sendMessage(
    @Param("id") conversationId: string,
    @Req() req: any,
    @Body("content") content: string,
  ) {
    return this.chatService.sendMessage(
      conversationId,
      req.user.userId,
      content,
    );
  }
}