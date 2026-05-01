import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as express from 'express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: true,
    credentials: true,
  })

  // Cho phép frontend truy cập file ảnh/video đã upload
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  app.setGlobalPrefix('api')

  const port = process.env.PORT || 4000

  await app.listen(port)

  console.log(`🚀 Forum backend running at http://localhost:${port}/api`)
  console.log(`📁 Uploads served at http://localhost:${port}/uploads`)
}

bootstrap()