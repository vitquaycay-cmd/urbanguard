import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoteService } from './votes.entity'; // 🔗 KẾT NỐI: Logic nằm ở file Entity này

@ApiTags('vote')
@Controller('reports/:id/vote') // Giữ nguyên route cũ để không làm hỏng frontend
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bình chọn sự cố (UPVOTE/DOWNVOTE)',
    description: 'Yêu cầu JWT. Giúp tăng/giảm trustScore của báo cáo. Bấm lại cùng loại vote sẽ xoá vote đó.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID của báo cáo' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['UPVOTE', 'DOWNVOTE'] }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Đã cập nhật bình chọn và trustScore' })
  voteReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: any },
    @Body() body: { type: 'UPVOTE' | 'DOWNVOTE' }, // Không dùng DTO theo yêu cầu
  ) {
    return this.voteService.voteReport(
      req.user.id,
      id,
      body.type,
    );
  }
}
