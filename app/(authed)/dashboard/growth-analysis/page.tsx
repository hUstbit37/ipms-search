"use client";
import { useState } from "react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { CompanyDropdown } from "@/components/dashboard/CompanyDropdown";
import { useIpGrowth, useGroupIpSummary } from "@/hooks/useDashboardQuery";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { chartColors } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Target, Calendar, Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const GrowthAnalysis = () => {
  const [dateType, setDateType] = useState<"application" | "certificate">("application");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [fromYear, setFromYear] = useState<number>(2019);
  const [toYear, setToYear] = useState<number>(new Date().getFullYear());

  // Fetch data from APIs
  const { data: growthData, isLoading: growthLoading } = useIpGrowth({
    fromYear,
    toYear,
    dateType,
    datasource: "MASAN",
    ...(selectedCompany !== "all" && { companyId: Number(selectedCompany) }),
  });

  const { data: groupData, isLoading: groupLoading } = useGroupIpSummary({
    dateType,
    datasource: "MASAN",
  });

  // Prepare chart data with growth rate (API now returns percentage as number like 20.8)
  const chartData = (growthData?.items || []).map((item) => ({
    year: item.year,
    ipCount: item.ipCount,
    growthRate: item.growthRate || 0,
  }));

  // Export functions
  const exportGrowthChart = async () => {
    await exportToExcel("Bieu_do_tang_truong_IP", [
      {
        sheetName: "Tăng trưởng IP",
        columns: [
          { header: "Năm", key: "year", width: 10 },
          { header: "Số lượng IP", key: "ipCount", width: 15 },
          { header: "Tỷ lệ tăng trưởng (%)", key: "growthRate", width: 20 },
        ],
        data: chartData.map((item) => ({
          year: item.year,
          ipCount: item.ipCount,
          growthRate: item.growthRate.toFixed(2),
        })),
      },
    ]);
  };

  const exportGrowthDetail = async () => {
    const items = growthData?.items || [];
    await exportToExcel("Chi_tiet_tang_truong_theo_nam", [
      {
        sheetName: "Chi tiết tăng trưởng",
        columns: [
          { header: "Năm", key: "year", width: 10 },
          { header: "Số lượng IP", key: "ipCount", width: 15 },
          { header: "Tăng/Giảm", key: "change", width: 15 },
          { header: "Tỷ lệ (%)", key: "growthRate", width: 15 },
        ],
        data: items.map((item, idx) => {
          const prevItem = idx > 0 ? items[idx - 1] : null;
          const change = prevItem ? item.ipCount - prevItem.ipCount : 0;
          return {
            year: item.year,
            ipCount: item.ipCount,
            change: change,
            growthRate: item.growthRate ? item.growthRate.toFixed(2) : "0.00",
          };
        }),
      },
    ]);
  };

  // Calculate summary stats
  const items = growthData?.items || [];
  const latestYear = items[items.length - 1];
  const previousYear = items[items.length - 2];
  const avgGrowth = items.length > 0
    ? items
        .filter((item) => item.growthRate !== null)
        .reduce((sum, item) => sum + (item.growthRate || 0), 0) /
      items.filter((item) => item.growthRate !== null).length
    : 0;

  const maxGrowthYear = items.length > 0
    ? items.reduce((max, item) =>
        (item.growthRate || 0) > (max.growthRate || 0) ? item : max
      )
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Phân tích Tăng trưởng
          </h1>
          <p className="text-muted-foreground mt-1">
            Xu hướng và biến động số lượng IP qua các năm
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <CompanyDropdown
            value={selectedCompany}
            onValueChange={setSelectedCompany}
          />
          <Select value={String(fromYear)} onValueChange={(v) => { const year = Number(v); if (year <= toYear) setFromYear(year); }}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: toYear - 2015 + 1 }, (_, i) => 2015 + i).map((year) => (
                <SelectItem key={year} value={String(year)} disabled={year > toYear}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">-</span>
          <Select value={String(toYear)} onValueChange={(v) => { const year = Number(v); if (year >= fromYear) setToYear(year); }}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i).map((year) => (
                <SelectItem key={year} value={String(year)} disabled={year < fromYear}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateFilter dateType={dateType} onDateTypeChange={setDateType} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="IP hiện tại"
          value={growthLoading ? "..." : latestYear ? latestYear.ipCount.toLocaleString() : "0"}
          subtitle={latestYear ? `Năm ${latestYear.year}` : "-"}
          icon={Target}
          trend={latestYear ? {
            value: parseFloat((latestYear.growthRate || 0).toFixed(1)),
            isPositive: (latestYear.growthRate || 0) > 0,
          } : undefined}
          delay={100}
        />
        <StatCard
          title="Tăng trưởng năm"
          value={growthLoading ? "..." : latestYear ? `${(latestYear.growthRate || 0).toFixed(1)}%` : "0%"}
          subtitle={previousYear ? `So với ${previousYear.year}` : "-"}
          icon={TrendingUp}
          delay={200}
        />
        <StatCard
          title="Tăng trưởng TB"
          value={growthLoading ? "..." : `${avgGrowth.toFixed(1)}%`}
          subtitle="Trung bình hàng năm"
          icon={Calendar}
          delay={300}
        />
        <StatCard
          title="Năm tăng cao nhất"
          value={growthLoading ? "..." : maxGrowthYear ? maxGrowthYear.year.toString() : "-"}
          subtitle={maxGrowthYear ? `+${(maxGrowthYear.growthRate || 0).toFixed(1)}%` : "-"}
          icon={TrendingUp}
          delay={400}
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <ChartCard
          title="Biểu đồ tăng trưởng IP"
          subtitle="Số lượng IP và tỷ lệ tăng trưởng theo năm"
          delay={500}
          onExport={exportGrowthChart}
        >
          {growthLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number | undefined, name: string | undefined) => {
                    if (!value) return ["", name || ""];
                    if (!name) return [value.toLocaleString(), ""];
                    if (name === "Số lượng IP") return [value.toLocaleString(), name];
                    return [`${value.toFixed(1)}%`, name];
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ipCount"
                  name="Số lượng IP"
                  fill="url(#areaGradient)"
                  stroke={chartColors.accent}
                  strokeWidth={2}
                />
                <Bar
                  yAxisId="right"
                  dataKey="growthRate"
                  name="Tỷ lệ tăng trưởng"
                  fill={chartColors.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          )}
        </ChartCard>
      </div>

      {/* Growth Detail Table */}
      <ChartCard title="Chi tiết tăng trưởng theo năm" delay={600} onExport={exportGrowthDetail}>
        {growthLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Năm</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Số lượng IP</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Tăng/Giảm</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Tỷ lệ</th>
                <th className="py-3 px-4 text-sm font-semibold text-muted-foreground w-48">Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const prevCount = idx > 0 ? items[idx - 1].ipCount : item.ipCount;
                const diff = item.ipCount - prevCount;
                const isPositive = diff >= 0;

                return (
                  <tr key={item.year} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-foreground">{item.year}</td>
                    <td className="text-right py-4 px-4 font-semibold text-foreground">
                      {item.ipCount.toLocaleString()}
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={isPositive ? "text-success" : "text-destructive"}>
                        {isPositive ? "+" : ""}{diff.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      {item.growthRate !== null ? (
                        <span className={isPositive ? "text-success" : "text-destructive"}>
                          {isPositive ? "+" : ""}{item.growthRate.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(Math.abs(item.growthRate || 0) * 4, 100)}%`,
                              backgroundColor: isPositive ? chartColors.green : "hsl(var(--destructive))",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </ChartCard>
    </div>
  );
};

export default GrowthAnalysis;
