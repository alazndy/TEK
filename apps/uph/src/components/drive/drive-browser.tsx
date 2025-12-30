'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  FolderPlus,
  ArrowLeft,
  Loader2,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { DriveService, DriveFile, isFolder } from '@/services/drive-service';
// Force TS re-check
import { getLucideIconForFile } from '@/lib/file-icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

const DxfViewer = dynamic(() => import('../viewer/dxf-viewer'), { 
  loading: () => <div className="h-full w-full flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded-md"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>,
  ssr: false 
});

interface DriveBrowserProps {
  accessToken?: string;
  onFileSelect?: (file: DriveFile) => void;
  initialFolderId?: string;
}

export function DriveBrowser({ accessToken, onFileSelect, initialFolderId }: DriveBrowserProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(initialFolderId);
  const [folderStack, setFolderStack] = useState<{ id?: string; name: string }[]>([
    { id: undefined, name: 'My Drive' },
  ]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  // Memoize drive service to prevent recreation on every render
  const driveService = useMemo(() => 
    accessToken ? new DriveService(accessToken) : null,
  [accessToken]);

  const fetchFiles = useCallback(async () => {
    if (!driveService) {
      setError('Not connected to Google Drive');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await driveService.listFiles(currentFolderId);
      setFiles(response.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [driveService, currentFolderId]);

  useEffect(() => {
    if (accessToken) {
      fetchFiles();
    }
  }, [accessToken, fetchFiles]);

  const handleFolderClick = (folder: DriveFile) => {
    setFolderStack([...folderStack, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };

  const handleBack = () => {
    if (folderStack.length > 1) {
      const newStack = [...folderStack];
      newStack.pop();
      setFolderStack(newStack);
      setCurrentFolderId(newStack[newStack.length - 1].id);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newStack = folderStack.slice(0, index + 1);
    setFolderStack(newStack);
    setCurrentFolderId(newStack[newStack.length - 1].id);
  };

  const handleCreateFolder = async () => {
    if (!driveService || !newFolderName.trim()) return;

    try {
      await driveService.createFolder(newFolderName.trim(), currentFolderId);
      toast.success('Folder created');
      setNewFolderName('');
      setShowNewFolder(false);
      fetchFiles();
    } catch {
      toast.error('Failed to create folder');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !driveService) return;

    const toastId = toast.loading(`Uploading ${file.name}...`);
    
    try {
      if (file.size > 5 * 1024 * 1024) {
        // Use resumable upload for files > 5MB
        await driveService.uploadFileResumable(file, currentFolderId, (progress) => {
          toast.loading(`Uploading ${file.name}... ${Math.round(progress)}%`, { id: toastId });
        });
      } else {
        // Use simple upload for smaller files
        await driveService.uploadFile(file, currentFolderId);
      }
      
      toast.success('File uploaded successfully', { id: toastId });
      fetchFiles();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file', { id: toastId });
    }
  };

  if (!accessToken) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HardDrive className="h-12 w-12 text-zinc-600 mb-4" />
          <p className="text-zinc-500 text-center mb-4">
            Connect your Google account to access Drive files
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Connect Google Drive
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-blue-400" />
            Google Drive
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolder(!showNewFolder)}
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              New Folder
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  aria-label="Upload file to Drive"
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-zinc-500 mt-2">
          {folderStack.map((folder, index) => (
            <div key={folder.id || 'root'} className="flex items-center">
              {index > 0 && <span className="mx-1">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={cn(
                  'hover:text-zinc-300',
                  index === folderStack.length - 1 && 'text-zinc-300 font-medium'
                )}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {showNewFolder && (
          <div className="flex gap-2 mb-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1"
            />
            <Button onClick={handleCreateFolder}>Create</Button>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
          </div>
        )}

        {folderStack.length > 1 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400 text-sm">{error}</div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            This folder is empty
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer',
                  isFolder(file) && 'cursor-pointer'
                )}
                onClick={() => {
                  if (isFolder(file)) {
                    handleFolderClick(file);
                  } else {
                    const isDxf = file.name.toLowerCase().endsWith('.dxf');
                    const isDwg = file.name.toLowerCase().endsWith('.dwg');
                    
                    if (isDxf) {
                      setPreviewFile(file);
                    } else if (isDwg) {
                      toast.info('DWG viewing requires backend conversion. Please convert to DXF for instant preview.', {
                        duration: 5000,
                        action: {
                          label: 'Learn More',
                          onClick: () => window.open('https://cloudconvert.com/dwg-to-dxf', '_blank')
                        }
                      });
                    } else {
                      onFileSelect?.(file);
                    }
                  }
                }}
              >
                {getLucideIconForFile(file.mimeType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  {file.modifiedTime && (
                    <p className="text-xs text-zinc-500">
                      {new Date(file.modifiedTime).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Open in Google Drive"
                    aria-label="Open in Google Drive"
                  >
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <span className="truncate max-w-[500px]">{previewFile?.name}</span>
               <span className="text-xs font-normal text-muted-foreground bg-zinc-800 px-2 py-0.5 rounded">DXF Preview</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-black rounded-md border border-zinc-800 relative">
             {previewFile && (
                <DxfViewer 
                    // Use a proxy or proper download link. 
                    // Google Drive 'webContentLink' usually downloads, 'webViewLink' is HTML.
                    // For preview, we need the raw content. 
                    // Assuming 'thumbnailLink' hack or just trying webContentLink.
                    // Ideally, we fetch content via Drive API 'alt=media' but current DriveFile interface might just have links.
                    // Passing webContentLink directly might fail CORS without proxy. 
                    // For this MVP, we pass the link and DxfViewer will try to fetch it.
                    fileUrl={previewFile.webContentLink || ''} 
                />
             )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
