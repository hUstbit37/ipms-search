"use client";

import { useQuery } from "@/lib/react-query";
import { internalProcessingStatusService, type IpType } from "@/services/internal-processing-status.service";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InternalProcessingStatusCompactProps {
  ipType: IpType;
  applicationNumber: string;
}

export function InternalProcessingStatusCompact({
  ipType,
  applicationNumber,
}: InternalProcessingStatusCompactProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["internal-processing-status", ipType, applicationNumber],
    queryFn: () => internalProcessingStatusService.get(ipType, applicationNumber),
    enabled: !!applicationNumber,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>
    );
  }

  const statusList = data?.internal_processing_status || [];

  if (statusList.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic">Chưa có</div>
    );
  }

  // Tính toán thống kê
  const completedCount = statusList.filter((item) => item.status === "Đã xử lý").length;
  const totalCount = statusList.length;
  const pendingCount = totalCount - completedCount;

  // Kiểm tra quá hạn và gần đến hạn
  const now = moment();
  let overdueCount = 0;
  let upcomingCount = 0;

  statusList.forEach((item) => {
    if (item.status !== "Đã xử lý" && item.deadline) {
      const deadline = moment(item.deadline);
      const daysDiff = deadline.diff(now, 'days');
      
      if (daysDiff < 0) {
        overdueCount++;
      } else if (daysDiff <= 30) {
        upcomingCount++;
      }
    }
  });

  // Tạo summary text
  const getSummaryText = () => {
    if (overdueCount > 0) {
      return `${completedCount}/${totalCount} đã xử lý, ${overdueCount} quá hạn`;
    }
    if (upcomingCount > 0) {
      return `${completedCount}/${totalCount} đã xử lý, ${upcomingCount} gần đến hạn`;
    }
    if (completedCount === totalCount) {
      return `${totalCount}/${totalCount} đã hoàn thành ✓`;
    }
    return `${completedCount}/${totalCount} đã xử lý`;
  };

  // Màu sắc dựa trên trạng thái
  const getTextColor = () => {
    if (overdueCount > 0) {
      return "text-red-600 dark:text-red-400 font-medium";
    }
    if (upcomingCount > 0) {
      return "text-yellow-600 dark:text-yellow-400 font-medium";
    }
    if (completedCount === totalCount) {
      return "text-green-600 dark:text-green-400";
    }
    return "text-gray-700 dark:text-gray-300";
  };

  // Tạo tooltip content
  const tooltipContent = (
    <div className="space-y-2 max-w-xs">
      <div className="font-semibold text-sm mb-2">Tiến trình xử lý nội bộ</div>
      <div className="space-y-1">
        {statusList.map((item, index) => {
          const isCompleted = item.status === "Đã xử lý";
          const deadline = item.deadline ? moment(item.deadline) : null;
          const isOverdue = deadline && deadline.isBefore(now, 'day') && !isCompleted;
          const isUpcoming = deadline && !isOverdue && !isCompleted && deadline.diff(now, 'days') <= 30;

          return (
            <div
              key={index}
              className={cn(
                "text-xs p-1.5 rounded border",
                isOverdue && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                isUpcoming && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "font-medium",
                  isCompleted && "line-through text-gray-400"
                )}>
                  {item.title}
                </span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  isCompleted
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : isOverdue
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : isUpcoming
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                )}>
                  {item.status}
                </span>
              </div>
              {deadline && (
                <div className={cn(
                  "text-xs",
                  isOverdue && "text-red-600 dark:text-red-400 font-medium",
                  isUpcoming && "text-yellow-600 dark:text-yellow-400"
                )}>
                  Deadline: {deadline.format("DD/MM/YYYY")}
                  {isOverdue && " (Quá hạn)"}
                  {isUpcoming && ` (Còn ${deadline.diff(now, 'days')} ngày)`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("text-xs cursor-help", getTextColor())}>
          {getSummaryText()}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-3 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 border shadow-lg">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}

