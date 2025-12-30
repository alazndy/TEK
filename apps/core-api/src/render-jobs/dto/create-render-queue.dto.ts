
import { IsString, IsOptional, IsObject } from 'class-validator';
import { BatchRenderConfig } from '@t-ecosystem/core-types';

export class CreateRenderQueueDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  config?: Partial<BatchRenderConfig>;
}
