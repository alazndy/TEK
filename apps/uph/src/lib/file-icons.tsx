import { 
  File, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Folder, 
  FileSpreadsheet, 
  FileArchive, 
  Presentation 
} from 'lucide-react';

export const getLucideIconForFile = (mimeType: string) => {
  if (mimeType.includes('folder')) return <Folder className="h-6 w-6 text-blue-400" />;
  if (mimeType.includes('image')) return <ImageIcon className="h-6 w-6 text-purple-400" />;
  if (mimeType.includes('video')) return <Video className="h-6 w-6 text-red-400" />;
  if (mimeType.includes('audio')) return <Music className="h-6 w-6 text-pink-400" />;
  if (mimeType.includes('pdf')) return <FileText className="h-6 w-6 text-rose-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
  if (mimeType.includes('document') || mimeType.includes('word')) return <FileText className="h-6 w-6 text-blue-500" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <Presentation className="h-6 w-6 text-orange-500" />;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className="h-6 w-6 text-yellow-500" />;
  return <File className="h-6 w-6 text-zinc-400" />;
};
