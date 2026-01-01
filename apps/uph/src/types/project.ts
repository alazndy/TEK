export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';
export type ProjectPriority = 'Low' | 'Medium' | 'High';
export type ProjectType = 'Scrum' | 'Kanban' | 'Waterfall';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string | Date;
}

export interface ProjectTask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    status: TaskStatus;
    dueDate?: string;
    subtasks?: Subtask[];
    comments?: TaskComment[];
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
}

export interface ProjectFile {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
    size?: number;
    category?: string;
}

// Weave Final Design Reference
export interface WeaveDesign {
    id: string;
    name: string;
    fileUrl: string;           // Firebase Storage URL or local file reference
    thumbnailUrl?: string;      // Preview image
    uploadedAt: string;
    pageCount: number;
    componentCount: number;     // Number of product instances in design
    projectData?: string;       // JSON stringified .tsproj content for viewer
}

// PCB Design Reference (Gerber, Altium, etc.)
export interface PCBDesign {
    id: string;
    name: string;
    fileUrl: string;
    uploadedAt: string;
    type: 'gerber' | 'altium' | 'eagle' | 'kicad' | 'other';
    fileSize?: string;
}

// 3D Model Reference (GLB, OBJ, STEP, etc.)
export interface ThreeDModel {
    id: string;
    name: string;
    fileUrl: string;
    previewUrl?: string; // Snapshot
    uploadedAt: string;
    format: 'glb' | 'gltf' | 'obj' | 'step' | 'f3d' | 'other';
    size?: string;
}

export interface CadDrawing {
    id: string;
    name: string;
    fileUrl: string;
    uploadedAt: string;
    type: 'dxf' | 'dwg' | 'other';
    fileSize?: string;
    webContentLink?: string; // For previews if available
}

export interface Project {
    id: string;
    userId: string; // Added user ID
    name: string;
    description: string;
    scope?: string; // Proje kapsamı / amacı
    status: ProjectStatus;
    teamGroupId?: string; // Added Team Group ID
    members?: string[]; // Added: List of user IDs with access (Owner + Team)
    priority: ProjectPriority;
    startDate: string;
    deadline?: string;
    budget: number;
    spent: number;
    // Computed properties for UI
    progress?: number; 
    createdAt?: string | Date;
    updatedAt?: string | Date;
    manager: string;
    completionPercentage: number;
    tags: string[];
    // tasks removed -> subcollection
    files: ProjectFile[];
    // Weave Final Designs
    weaveDesigns?: WeaveDesign[];
    // PCB Designs
    pcbDesigns?: PCBDesign[];
    // 3D Models
    threeDModels?: ThreeDModel[];
    // CAD Drawings (DXF, DWG)
    cadDrawings?: CadDrawing[];
    // GitHub Integration
    githubRepo?: string;
    githubSyncEnabled?: boolean;
    lastGithubSync?: string;
    color?: string; // Hex color for visual distinction
    logoUrl?: string; // Optional logo/identicon
    readmeContent?: string; // Markdown content for project scope
    googleDriveFolderId?: string; // Google Drive integration
    isFavorite?: boolean; // Favorite status
}
