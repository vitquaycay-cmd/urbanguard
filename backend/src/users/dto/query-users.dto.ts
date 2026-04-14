import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUsersDto{
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @Type(()=> Number)
    @Min(1)
    page?=1;

    @IsOptional()
    @Type(()=> Number)
    @Min(1)
    @Max(50)
    limit?=10; 
}