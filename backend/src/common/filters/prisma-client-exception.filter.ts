import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

/**
 * Bắt lỗi Prisma (ví dụ P2002 trùng email) để trả JSON thống nhất, tránh 500 không kiểm soát.
 */
@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi cơ sở dữ liệu';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        message = target
          ? `Dữ liệu trùng: ${target} (ví dụ email đã tồn tại)`
          : 'Email hoặc dữ liệu duy nhất đã tồn tại';
        break;
      }
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Không tìm thấy bản ghi';
        break;
      default:
        message = 'Lỗi cơ sở dữ liệu';
    }

    response.status(status).json({
      statusCode: status,
      message,
      code: exception.code,
    });
  }
}
