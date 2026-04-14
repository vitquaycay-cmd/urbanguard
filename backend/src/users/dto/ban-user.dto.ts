import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BanuserDto{
    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isBanned: boolean;
}