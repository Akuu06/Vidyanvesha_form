// Form Status Badge Component

import { Badge } from "@/components/ui/badge";
import { FormStatus } from "@/types";

interface FormStatusBadgeProps {
  status: FormStatus;
}

export function FormStatusBadge({ status }: FormStatusBadgeProps) {
  const variants = {
    [FormStatus.DRAFT]: { label: "Draft", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
    [FormStatus.PUBLISHED]: { label: "Published", className: "bg-green-100 text-green-800 hover:bg-green-200" },
    [FormStatus.CLOSED]: { label: "Closed", className: "bg-red-100 text-red-800 hover:bg-red-200" }
  };

  const { label, className } = variants[status];

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}
