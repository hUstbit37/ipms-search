import { cn } from "@/lib/utils";

interface TopListItem {
  rank: number;
  name: string;
  value: number;
  percentage?: number;
}

interface TopListProps {
  title: string;
  items: TopListItem[];
  className?: string;
}

export const TopList = ({ title, items, className }: TopListProps) => {
  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="font-display font-semibold text-foreground">{title}</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.rank} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    item.rank === 1
                      ? "bg-primary text-primary-foreground"
                      : item.rank === 2
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.rank}
                </span>
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-foreground">
                  {item.value.toLocaleString()}
                </span>
                {item.percentage !== undefined && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({(item.percentage).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  item.rank === 1
                    ? "bg-primary"
                    : item.rank === 2
                    ? "bg-primary/80"
                    : "bg-primary/60"
                )}
                style={{
                  width: item.percentage !== undefined 
                    ? `${item.percentage}%` 
                    : `${(item.value / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
