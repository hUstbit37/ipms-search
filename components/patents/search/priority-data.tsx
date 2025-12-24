"use client"

import moment from "moment"

interface PriorityData {
  appNumber?: string | null;
  date?: string | null;
  country?: string | null;
}

interface PriorityDataProps {
  priority_data?: PriorityData[] | null;
}

export default function PriorityData({ priority_data }: PriorityDataProps) {
  if (!priority_data || !Array.isArray(priority_data) || priority_data.length === 0) {
    priority_data = [];
  }

  return (
    <div className="py-2 flex items-start gap-4">
      <div className="font-semibold text-sm text-gray-900 min-w-[250px]">Đơn ưu tiên</div>
      <div className="text-sm text-gray-700 flex-1">
        {priority_data.length > 0 ? (
          priority_data.map((priority, idx) => (
            <div key={`${priority.appNumber}-${idx}`} className="mb-1">{priority.appNumber} - {priority.date ? moment(priority.date).format("DD/MM/YYYY") : "N/A"} - {priority.country || ""}</div>
          ))
        ) : (
          <div />
        )}
      </div>
    </div>
    
  );
}

