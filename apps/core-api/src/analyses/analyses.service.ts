import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalysisResult } from '@t-ecosystem/core-types';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Injectable()
export class AnalysesService {
  private analyses: AnalysisResult[] = [];

  create(createAnalysisDto: CreateAnalysisDto) {
    const newAnalysis: AnalysisResult = {
        ...createAnalysisDto,
        id: createAnalysisDto.id || Date.now().toString(),
        version: createAnalysisDto.version || 1,
        timestamp: createAnalysisDto.timestamp || new Date().toISOString(),
    };
    // Update existing if same file (optional logic, but typically we want history)
    // For now simple append.
    this.analyses.push(newAnalysis);
    return newAnalysis;
  }

  findAll() {
    // Return sorted by date desc
    return this.analyses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  findOne(id: string) {
    const analysis = this.analyses.find(a => a.id === id);
    if (!analysis) throw new NotFoundException(`Analysis #${id} not found`);
    return analysis;
  }

  remove(id: string) {
    const index = this.analyses.findIndex(a => a.id === id);
    if (index === -1) throw new NotFoundException(`Analysis #${id} not found`);
    this.analyses.splice(index, 1);
    return { deleted: true };
  }
}
