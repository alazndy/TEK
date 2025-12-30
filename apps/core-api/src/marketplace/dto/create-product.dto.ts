import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Flux IoT' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Industrial IoT Analytics Platform' })
  @IsString()
  description: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  price: number;
}
