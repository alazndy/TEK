import React, { useEffect, useState } from 'react';
import { useUPHSync, UPHProject } from '../../hooks/useUPHSync';
import { ProjectData } from '../../types';
import html2canvas from 'html2canvas';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface UPHExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: ProjectData;
  projectName: string;
}

export function UPHExportModal({ isOpen, onClose, projectData, projectName }: UPHExportModalProps) {
  const { projects, loading, uploading, fetchProjects, uploadDesign } = useUPHSync();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      setSuccess(false);
      setError(null);
      setSelectedProjectId('');
    }
  }, [isOpen, fetchProjects]);

  const handleUpload = async () => {
    if (!selectedProjectId) return;
    try {
      setError(null);
      
      // Capture Thumbnail
      let thumbnailDataUrl: string | undefined = undefined;
      const element = document.getElementById('canvas-export-area');
      if (element) {
          try {
             // Temporarily reset transform for capture if needed, or just capture view
             const canvas = await html2canvas(element as HTMLElement, {
                 scale: 0.5, // Smaller scale for thumbnail
                 useCORS: true,
                 allowTaint: true,
                 backgroundColor: '#ffffff',
                 ignoreElements: (el) => el.classList.contains('no-print')
             });
             thumbnailDataUrl = canvas.toDataURL('image/png', 0.8);
          } catch(e) {
              console.warn("Thumbnail generation failed:", e);
          }
      }

      await uploadDesign(selectedProjectId, projectData, projectName, thumbnailDataUrl);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to upload design. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-[500px] border border-border rounded-lg shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Send to UPH Project
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading projects...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-500">
              <CheckCircle2 className="w-12 h-12 mb-2" />
              <p className="font-medium">Design sent successfully!</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Select Target Project</label>
                <div className="max-h-[300px] overflow-y-auto border border-border rounded-md bg-muted/20">
                  {projects.length === 0 ? (
                     <div className="p-4 text-center text-muted-foreground text-sm">No UPH projects found.</div>
                  ) : (
                    projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`w-full text-left px-4 py-3 border-b last:border-0 border-border hover:bg-muted/50 transition-colors flex flex-col ${
                          selectedProjectId === project.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <span className="text-foreground font-medium">{project.name}</span>
                        {project.description && (
                          <span className="text-muted-foreground text-xs truncate mt-1">{project.description}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && !loading && (
          <div className="px-6 py-4 bg-muted/10 border-t border-border flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedProjectId || uploading}
              className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Design
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
