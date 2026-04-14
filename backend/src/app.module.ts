import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule"; // Diep @Cron decorator
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ReportsModule } from "./reports/reports.module";
import { UploadsModule } from "./uploads/uploads.module";
import { MapModule } from "./map/map.module";
import { AdminModule } from "./admin/admin.module";
import { AiReviewModule } from "./ai-review/ai-review.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // Diep @Cron CleanupCron hoạt động
    PrismaModule,
    AuthModule,
    UsersModule,
    ReportsModule,
    UploadsModule,
    MapModule,
    AdminModule,
    AiReviewModule,
    NotificationsModule,
    StatisticsModule,
    ThrottlerModule.forRoot([
      {
        name: "auth", // tên rule
        ttl: 60000, // thời gian
        limit: 5,
      },
      {
        name: "api",
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,   // Đăng ký ThrottlerGuard toàn cục
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
