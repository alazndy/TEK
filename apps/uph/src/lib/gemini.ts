import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with API key from environment or use mock mode
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const USE_MOCK = !API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

// Mock responses for when API is not configured
const mockTaskGeneration = (projectName: string): string[] => {
  const taskTemplates: Record<string, string[]> = {
    'e-commerce': [
      'Setup Next.js project with TypeScript',
      'Design database schema for products',
      'Implement user authentication',
      'Create product listing page',
      'Build shopping cart functionality',
      'Implement checkout flow',
      'Add payment gateway integration',
      'Setup order management system',
      'Create admin dashboard',
      'Deploy to production'
    ],
    'website': [
      'Define site structure and navigation',
      'Create wireframes and mockups',
      'Setup development environment',
      'Build responsive header component',
      'Create homepage layout',
      'Add contact form functionality',
      'Implement SEO best practices',
      'Optimize images and assets',
      'Test cross-browser compatibility',
      'Deploy and configure domain'
    ],
    'mobile': [
      'Setup React Native/Flutter project',
      'Design app UI/UX mockups',
      'Implement navigation structure',
      'Create authentication screens',
      'Build main feature screens',
      'Add state management',
      'Integrate API endpoints',
      'Implement push notifications',
      'Test on multiple devices',
      'Prepare for app store submission'
    ],
    'default': [
      'Define project requirements',
      'Create project timeline',
      'Setup development environment',
      'Design system architecture',
      'Implement core features',
      'Write unit tests',
      'Perform integration testing',
      'Create documentation',
      'Code review and refactoring',
      'Deploy to production'
    ]
  };

  const lowerName = projectName.toLowerCase();
  if (lowerName.includes('e-commerce') || lowerName.includes('shop') || lowerName.includes('store')) {
    return taskTemplates['e-commerce'];
  }
  if (lowerName.includes('mobile') || lowerName.includes('app')) {
    return taskTemplates['mobile'];
  }
  if (lowerName.includes('website') || lowerName.includes('web') || lowerName.includes('landing')) {
    return taskTemplates['website'];
  }
  return taskTemplates['default'];
};

export async function generateProjectTasks(
  projectName: string, 
  description: string
): Promise<string[]> {
  // If no API key, use mock data
  if (USE_MOCK || !genAI) {
    console.log('Using mock data for task generation (no API key)');
    return mockTaskGeneration(projectName);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a project manager assistant. Generate a list of 8-12 actionable tasks for the following project.
    
Project Name: ${projectName}
Description: ${description || 'No description provided'}

Rules:
- Each task should be specific and actionable
- Tasks should follow a logical order
- Include both technical and non-technical tasks where appropriate
- Keep task titles concise (under 50 characters)
- Return ONLY a JSON array of strings, no other text

Example format:
["Task 1", "Task 2", "Task 3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to mock data on error
    return mockTaskGeneration(projectName);
  }
}

export async function summarizeIssues(issues: Array<{ title: string; body: string | null }>): Promise<string> {
  // If no API key, use mock summary
  if (USE_MOCK || !genAI) {
    const issueCount = issues.length;
    const titles = issues.slice(0, 3).map(i => i.title).join(', ');
    return `📊 **Issue Summary** (${issueCount} total)\n\nTop priorities: ${titles}${issueCount > 3 ? ` and ${issueCount - 3} more...` : ''}\n\n*Note: For detailed AI summaries, configure NEXT_PUBLIC_GEMINI_API_KEY*`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const issueText = issues
      .slice(0, 10)
      .map((i, idx) => `${idx + 1}. ${i.title}\n   ${i.body || 'No description'}`)
      .join('\n\n');
    
    const prompt = `You are a technical project manager. Summarize these GitHub issues for a manager who needs a quick overview.

Issues:
${issueText}

Provide:
1. A brief executive summary (2-3 sentences)
2. Key themes/categories of issues
3. Recommended priorities (top 3)

Format as markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Failed to generate summary. Please try again.';
  }
}

export interface ProjectAnalysis {
  healthScore: number;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: string[];
  summary: string;
}

export async function analyzeProject(
  projectName: string,
  description: string,
  tasks: Array<{ title: string; status: string }>,
  risks: Array<{ title: string; type: string; severity: number; impact: number; probability: number }>,
  evmMetrics: { cpi: number; spi: number; eac: number; sv: number; cv: number } | null
): Promise<ProjectAnalysis> {
  // Mock analysis
  if (USE_MOCK || !genAI) {
    return {
      healthScore: 85,
      swot: {
        strengths: ['Clear project scope definition', 'Initial tasks are well-defined'],
        weaknesses: ['Risk planning could be more detailed'],
        opportunities: ['Potential for automation in workflow'],
        threats: ['External dependencies might delay timeline']
      },
      recommendations: [
        'Review and prioritize high-impact risks',
        'Break down large tasks into smaller subtasks',
        'Schedule a team sync to align on milestones'
      ],
      summary: 'Project demonstrates a strong foundation. Focus on detailed risk management to ensure smooth execution.'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let evmContext = "No EVM data available.";
    if (evmMetrics) {
      evmContext = `
      EVM Financial Metrics:
      - Cost Performance Index (CPI): ${evmMetrics.cpi.toFixed(2)} (Target: >1.0)
      - Schedule Performance Index (SPI): ${evmMetrics.spi.toFixed(2)} (Target: >1.0)
      - Schedule Variance (SV): ${evmMetrics.sv.toFixed(2)}
      - Cost Variance (CV): ${evmMetrics.cv.toFixed(2)}
      - Estimate At Completion (EAC): ${evmMetrics.eac.toFixed(2)}
      `;
    }

    const riskSummary = risks.map(r => 
      `- ${r.title} (Severity: ${r.severity}, Impact: ${r.impact}, Prob: ${r.probability})`
    ).join('\n');

    const prompt = `Analyze this project and provide a strategic health report.
    
    Project: ${projectName}
    Description: ${description}
    Task Count: ${tasks.length}
    Total Risks Identified: ${risks.length}

    ${evmContext}

    Identified Risks:
    ${riskSummary.slice(0, 1000)}... (truncated if too long)

    Tasks Sample: ${tasks.slice(0, 10).map(t => `- [${t.status}] ${t.title}`).join('\n')}

    Based on the EVM metrics (Financial/Schedule health) and the Risk Registry:
    1. Calculate a realistic Health Score (0-100). If CPI/SPI < 1, score should reflect that.
    2. Generate a SWOT analysis specific to these metrics.
    3. Provide 3 concrete recommendations to improve CPI/SPI or mitigate top risks.

    Return a JSON object with this structure:
    {
      "healthScore": number (0-100),
      "swot": {
        "strengths": string[],
        "weaknesses": string[],
        "opportunities": string[],
        "threats": string[]
      },
      "recommendations": string[],
      "summary": string (Executive summary focusing on financial and risk outlook)
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return mock on error
    return {
      healthScore: 70,
      swot: { strengths: [], weaknesses: ['API Error'], opportunities: [], threats: [] },
      recommendations: ['Check API configuration'],
      summary: 'Analysis failed due to connection error. Using default fallback.'
    };
  }
}

export { USE_MOCK };
