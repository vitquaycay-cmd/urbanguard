import { IsOptional, IsString } from "class-validator";

export class CreatePostDto {
  @IsString()
  categoryId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;
}