
import { ProjectAnalysis } from '@/lib/gemini';

// Mock data for testing logic
const mockRisks = [
    { title: 'Budget Overrun', type: 'Financial', severity: 5, impact: 5, probability: 4 },
    { title: 'Timeline Delay', type: 'Schedule', severity: 4, impact: 4, probability: 3 }
];

describe('Risk Logic Helpers', () => {
    it('should correctly format risks for AI context', () => {
        const riskSummary = mockRisks.map(r => 
            `- ${r.title} (Severity: ${r.severity}, Impact: ${r.impact}, Prob: ${r.probability})`
        ).join('\n');

        expect(riskSummary).toContain('Budget Overrun (Severity: 5, Impact: 5, Prob: 4)');
        expect(riskSummary).toContain('Timeline Delay (Severity: 4, Impact: 4, Prob: 3)');
    });

    it('should identify high severity risks', () => {
        const highRisks = mockRisks.filter(r => r.severity >= 5);
        expect(highRisks).toHaveLength(1);
        expect(highRisks[0].title).toBe('Budget Overrun');
    });
});
