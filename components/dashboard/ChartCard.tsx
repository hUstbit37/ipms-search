import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  linkTo?: string;
  linkLabel?: string;
  className?: string;
  delay?: number;
  onExport?: () => void;
}

export const ChartCard = ({
  title,
  subtitle,
  children,
  linkTo,
  linkLabel = "Xem chi tiết",
  className,
  delay = 0,
  onExport,
}: ChartCardProps) => {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="font-display font-semibold text-foreground">
              {title}
            </CardTitle>
            {subtitle && (
              <CardDescription className="mt-0.5">
                {subtitle}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="h-8 gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
        </div>
        {linkTo && (
          <CardAction>
            <Link
              href={linkTo}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
            >
              {linkLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
