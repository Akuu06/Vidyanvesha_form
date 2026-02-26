// Form Mode Badge Component

import { Badge } from "@/components/ui/badge";
import { FormMode } from "@/types";
import { FileText, ClipboardList } from "lucide-react";

interface FormModeBadgeProps {
  mode: FormMode;
  showIcon?: boolean;
}

export function FormModeBadge({ mode, showIcon = true }: FormModeBadgeProps) {
  const variants = {
    [FormMode.NORMAL_FORM]: {
      label: "Form",
      icon: FileText,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200"
    },
    [FormMode.QUIZ]: {
      label: "Quiz",
      icon: ClipboardList,
      className: "bg-purple-100 text-purple-800 hover:bg-purple-200"
    }
  };

  const { label, icon: Icon, className } = variants[mode];

  return (
    <Badge variant="secondary" className={className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}
