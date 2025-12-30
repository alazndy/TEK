
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RenderJobsService } from './render-jobs.service';
import { CreateRenderQueueDto } from './dto/create-render-queue.dto';
import { AddJobDto } from './dto/add-job.dto';

@Controller('render-jobs')
export class RenderJobsController {
  constructor(private readonly renderJobsService: RenderJobsService) {}

  @Post('queues')
  createQueue(@Body() createRenderQueueDto: CreateRenderQueueDto) {
    return this.renderJobsService.createQueue(createRenderQueueDto);
  }

  @Get('queues')
  getAllQueues() {
    return this.renderJobsService.getAllQueues();
  }

  @Get('queues/:id')
  getQueue(@Param('id') id: string) {
    return this.renderJobsService.getQueue(id);
  }

  @Delete('queues/:id')
  deleteQueue(@Param('id') id: string) {
    return this.renderJobsService.deleteQueue(id);
  }

  @Post('queues/:id/jobs')
  addJob(@Param('id') id: string, @Body() addJobDto: AddJobDto) {
    return this.renderJobsService.addJob(id, addJobDto);
  }

  @Post('queues/:id/start')
  startQueue(@Param('id') id: string) {
    return this.renderJobsService.startQueue(id);
  }
}
