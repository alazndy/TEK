import { Module } from '@nestjs/common';
import { AnalysesService } from './analyses.service';
import { AnalysesController } from './analyses.controller';

@Module({
  controllers: [AnalysesController],
  providers: [AnalysesService],
})
export class AnalysesModule {}
