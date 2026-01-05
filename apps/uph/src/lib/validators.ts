import { z } from "zod";

// --- Enums ---
export const ProjectStatusEnum = z.enum(['Planning', 'Active', 'On Hold', 'Completed']);
export const ProjectPriorityEnum = z.enum(['Low', 'Medium', 'High']);

// --- Project Schema ---
export const projectSchema = z.object({
  name: z.string().min(3, "Proje adı en az 3 karakter olmalıdır").max(100),
  description: z.string().optional(),
  status: ProjectStatusEnum.default('Planning'),
  priority: ProjectPriorityEnum.default('Medium'),
  startDate: z.string().min(1, "Başlangıç tarihi gereklidir"),
  deadline: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
  manager: z.string().min(1, "Proje yöneticisi seçilmelidir"),
  tags: z.array(z.string()).optional(),
  teamGroupId: z.string().optional(),
  color: z.string().optional(),
  logoUrl: z.string().optional()
});

// --- Task Schema ---
export const taskSchema = z.object({
  title: z.string().min(3, "Görev başlığı gereklidir"),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).default('todo'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional()
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
