import { CheckCircle2, AlertTriangle, XCircle, Info, Clock } from "lucide-react"

type BadgeVariant = "success" | "warning" | "error" | "info" | "pending" | "default"

interface StatusBadgeProps {
  status: string
  variant?: BadgeVariant
}

// Mapping trạng thái phổ biến với màu sắc
const getStatusVariant = (status: string): BadgeVariant => {
  const statusLower = status.toLowerCase()
  
  // Success states (Green)
  if (
    statusLower.includes("granted") ||
    statusLower.includes("cấp bằng") ||
    statusLower.includes("registered") ||
    statusLower.includes("active") ||
    statusLower.includes("approved") ||
    statusLower.includes("valid")
  ) {
    return "success"
  }
  
  // Warning states (Orange/Yellow)
  if (
    statusLower.includes("pending") ||
    statusLower.includes("examining") ||
    statusLower.includes("đang giải quyết") ||
    statusLower.includes("waiting") ||
    statusLower.includes("under review") ||
    statusLower.includes("opposition") ||
    statusLower.includes("suspended")
  ) {
    return "warning"
  }
  
  // Error states (Red)
  if (
    statusLower.includes("rejected") ||
    statusLower.includes("refused") ||
    statusLower.includes("withdrawn") ||
    statusLower.includes("cancelled") ||
    statusLower.includes("expired") ||
    statusLower.includes("abandoned") ||
    statusLower.includes("invalid") ||
    statusLower.includes("từ chối")
  ) {
    return "error"
  }
  
  // Info states (Blue)
  if (
    statusLower.includes("published") ||
    statusLower.includes("application") ||
    statusLower.includes("filed") ||
    statusLower.includes("nộp đơn")
  ) {
    return "info"
  }
  
  // Default gray for unknown statuses
  return "default"
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; icon?: React.ReactNode }> = {
  success: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  warning: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: <Info className="w-3.5 h-3.5" />,
  },
  pending: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  default: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const autoVariant = variant || getStatusVariant(status)
  const styles = variantStyles[autoVariant]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      {styles.icon}
      <span>{status}</span>
    </span>
  )
}
