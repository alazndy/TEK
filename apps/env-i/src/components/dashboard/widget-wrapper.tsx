import React, { forwardRef } from "react";
import { X, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/stores/dashboard-store";
import { motion, Variants } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WidgetWrapperProps {
  id: string;
  title: string;
  visible: boolean;
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
}

export const WidgetWrapper = forwardRef<HTMLDivElement, WidgetWrapperProps>(({ id, title, visible, children, className, variants }, ref) => {
  const { isEditing, removeWidget, toggleWidgetVisibility } = useDashboardStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  if (!visible && !isEditing) return null;

  return (
    <motion.div 
      ref={(node: any) => {
          setNodeRef(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
      }}
      style={style}
      variants={variants}
      layout // Enable layout animations
      className={`relative group ${className} ${!visible ? 'grayscale opacity-50' : ''} ${isDragging ? 'opacity-50' : ''}`}
    >
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={() => toggleWidgetVisibility(id)}
          >
            {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={() => removeWidget(id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {isEditing && (
          <div 
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 bg-white/5 rounded hover:bg-white/10 touch-none"
          >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
      )}

      {children}
    </motion.div>
  );
});

WidgetWrapper.displayName = "WidgetWrapper";
