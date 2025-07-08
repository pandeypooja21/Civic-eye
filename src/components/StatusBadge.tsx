
import { IssueStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    'open': {
      color: 'bg-status-open text-white',
      label: 'Open'
    },
    'in-progress': {
      color: 'bg-status-inProgress text-white',
      label: 'In Progress'
    },
    'resolved': {
      color: 'bg-status-resolved text-white',
      label: 'Resolved'
    }
  };

  const { color, label } = statusConfig[status];

  return (
    <div className={cn("px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap", color, className)}>
      {label}
    </div>
  );
};

export default StatusBadge;
