
import { Module } from '@nestjs/common';
import { RenderJobsService } from './render-jobs.service';
import { RenderJobsController } from './render-jobs.controller';

@Module({
  controllers: [RenderJobsController],
  providers: [RenderJobsService],
})
export class RenderJobsModule {}
