import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  delay = 0,
}: StatCardProps) => {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <CardContent className="flex flex-col gap-4">
        {/* Header with Icon and Trend */}
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                trend.isPositive
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground leading-tight">{title}</p>
          <p className="text-3xl font-display font-bold text-card-foreground tracking-tight leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
