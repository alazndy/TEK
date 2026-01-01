import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateProjectTasks, summarizeIssues, analyzeProject, ProjectAnalysis, USE_MOCK } from '@/lib/gemini';
import { useProjectStore } from '@/stores/project-store';
import { useGitHubStore } from '@/stores/github-store';
import { Sparkles, Loader2, CheckCircle2, Wand2, FileText, Info, BarChart3, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AIAssistantProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
}

export function AIAssistant({ projectId, projectName, projectDescription }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'menu' | 'plan' | 'summarize' | 'analyze'>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const { addTask, getProjectTasks } = useProjectStore();
  const { issues } = useGitHubStore();

  const handlePlanProject = async () => {
    setMode('plan');
    setIsLoading(true);
    setResult(null);
    try {
      const tasks = await generateProjectTasks(projectName, projectDescription);
      setResult(tasks);
    } catch (error) {
      toast.error('Failed to generate tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeIssues = async () => {
    setMode('summarize');
    setIsLoading(true);
    setResult(null);
    try {
      const issueData = issues.map(i => ({ title: i.title, body: i.body }));
      const summary = await summarizeIssues(issueData);
      setResult(summary);
    } catch (error) {
      toast.error('Failed to summarize issues');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeProject = async () => {
    setMode('analyze');
    setIsLoading(true);
    setResult(null);
    try {
      const { risks, evmMetrics, getProjectTasks } = useProjectStore.getState();
      
      const projectRisks = risks
        .filter(r => r.projectId === projectId)
        .map(r => ({ 
          title: r.title, 
          type: r.category, 
          severity: r.severity,
          impact: r.impact,
          probability: r.probability
        }));

      const projectTasks = getProjectTasks(projectId).map(t => ({ title: t.title, status: t.status }));
      
      const evm = evmMetrics && evmMetrics.projectId === projectId ? {
        cpi: evmMetrics.costPerformanceIndex,
        spi: evmMetrics.schedulePerformanceIndex,
        eac: evmMetrics.estimateAtCompletion,
        sv: evmMetrics.scheduleVariance,
        cv: evmMetrics.costVariance
      } : null;

      const analysis = await analyzeProject(projectName, projectDescription, projectTasks, projectRisks, evm);
      setResult(analysis);
    } catch (error) {
      toast.error('Failed to analyze project');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasks = async () => {
    if (!Array.isArray(result)) return;
    setIsLoading(true);
    try {
      for (const taskTitle of result) {
        await addTask(projectId, {
          title: taskTitle,
          completed: false,
          status: 'todo'
        });
      }
      toast.success(`Added ${result.length} tasks to project`);
      setOpen(false);
      setMode('menu');
      setResult(null);
    } catch (error) {
      toast.error('Failed to add tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMode('menu');
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 z-50 text-white"
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            AI Assistant
            {USE_MOCK && <Badge variant="secondary" className="text-xs">Demo Mode</Badge>}
          </DialogTitle>
          <DialogDescription>
            AI-powered tools to help manage your project
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {mode === 'menu' && (
            <div className="grid gap-3 py-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handlePlanProject}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Plan This Project</h4>
                    <p className="text-sm text-muted-foreground">Auto-generate tasks from project name</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleAnalyzeProject}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Project Health Check</h4>
                    <p className="text-sm text-muted-foreground">Analyze SWOT, risks, and recommendations</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${issues.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'}`}
                onClick={issues.length > 0 ? handleSummarizeIssues : undefined}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Summarize Issues</h4>
                    <p className="text-sm text-muted-foreground">
                      {issues.length > 0 
                        ? `Summarize ${issues.length} GitHub issues`
                        : 'Connect GitHub first to use this feature'}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              {USE_MOCK && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg text-sm mt-2">
                  <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">
                    Running in demo mode. Add <code className="text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GEMINI_API_KEY</code> for full AI features.
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === 'analyze' && (
             <div className="py-4 space-y-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                    <p className="text-muted-foreground">Analyzing project data...</p>
                  </div>
                ) : result ? (
                  <div className="space-y-6">
                    {/* Header Score */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                       <div>
                          <h3 className="font-semibold text-lg">Project Health Score</h3>
                          <p className="text-sm text-muted-foreground">{projectName}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-emerald-600">{result.healthScore}/100</span>
                       </div>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                       <p>{result.summary}</p>
                    </div>

                    {/* SWOT Grid */}
                    <div>
                      <h4 className="font-medium mb-3">SWOT Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="py-2"><CardTitle className="text-sm">Strengths</CardTitle></CardHeader>
                            <CardContent className="py-2 pb-4">
                               <ul className="list-disc pl-4 text-sm space-y-1">
                                  {result.swot.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                               </ul>
                            </CardContent>
                         </Card>
                         <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="py-2"><CardTitle className="text-sm">Weaknesses</CardTitle></CardHeader>
                            <CardContent className="py-2 pb-4">
                               <ul className="list-disc pl-4 text-sm space-y-1">
                                  {result.swot.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                               </ul>
                            </CardContent>
                         </Card>
                         <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="py-2"><CardTitle className="text-sm">Opportunities</CardTitle></CardHeader>
                            <CardContent className="py-2 pb-4">
                               <ul className="list-disc pl-4 text-sm space-y-1">
                                  {result.swot.opportunities.map((s: string, i: number) => <li key={i}>{s}</li>)}
                               </ul>
                            </CardContent>
                         </Card>
                         <Card className="border-l-4 border-l-amber-500">
                            <CardHeader className="py-2"><CardTitle className="text-sm">Threats</CardTitle></CardHeader>
                            <CardContent className="py-2 pb-4">
                               <ul className="list-disc pl-4 text-sm space-y-1">
                                  {result.swot.threats.map((s: string, i: number) => <li key={i}>{s}</li>)}
                               </ul>
                            </CardContent>
                         </Card>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                       <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-violet-500" />
                          AI Recommendations
                       </h4>
                       <div className="space-y-2">
                          {result.recommendations.map((rec: string, i: number) => (
                             <div key={i} className="flex gap-3 p-3 bg-violet-500/5 border border-violet-200 dark:border-violet-900 rounded-lg text-sm">
                                <span className="font-bold text-violet-500">{i + 1}.</span>
                                {rec}
                             </div>
                          ))}
                       </div>
                    </div>

                    <Button variant="outline" onClick={() => setMode('menu')} className="w-full">
                       Back to Menu
                    </Button>
                  </div>
                ) : null}
             </div>
          )}

          {mode === 'plan' && (
            <div className="py-4 space-y-4">
              <h4 className="font-medium">Generated Tasks for "{projectName}"</h4>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
              ) : Array.isArray(result) ? (
                <>
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {result.map((task, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border rounded text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setMode('menu')} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleAddTasks} disabled={isLoading} className="flex-1">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Add {result.length} Tasks
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {mode === 'summarize' && (
            <div className="py-4 space-y-4">
              <h4 className="font-medium">Issue Summary</h4>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : typeof result === 'string' ? (
                <>
                  <div className="prose prose-sm dark:prose-invert max-h-[300px] overflow-y-auto p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                    {result}
                  </div>
                  <Button variant="outline" onClick={() => setMode('menu')} className="w-full">
                    Back
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
