import "dotenv/config";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = new URL(process.env.DATABASE_URL as string);

    const adapter = new PrismaMariaDb({
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: databaseUrl.pathname.replace("/", ""),
      connectTimeout: 5000,
      allowPublicKeyRetrieval: true,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}