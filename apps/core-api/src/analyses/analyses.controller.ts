import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AnalysesService } from './analyses.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Controller('analyses')
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Post()
  create(@Body() createAnalysisDto: CreateAnalysisDto) {
    return this.analysesService.create(createAnalysisDto);
  }

  @Get()
  findAll() {
    return this.analysesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analysesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.analysesService.remove(id);
  }
}
