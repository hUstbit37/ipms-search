"use client";
import { useState } from "react";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { CompanyDropdown } from "@/components/dashboard/CompanyDropdown";
import { useSectorIpDistribution } from "@/hooks/useDashboardQuery";
import { chartColors } from "@/lib/mockData";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { Package, Layers, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Treemap,
  PieChart,
  Pie,
} from "recharts";

// Custom Treemap content
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value, index, totalIpCount } = props;
  const colors = [
    chartColors.primary,
    chartColors.accent,
    chartColors.purple,
    chartColors.green,
    chartColors.pink,
  ];

  if (width < 60 || height < 40 || !value) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colors[index % colors.length]}
        stroke="hsl(var(--background))"
        strokeWidth={3}
        rx={6}
        className="cursor-pointer transition-opacity hover:opacity-80"
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 10}
        textAnchor="middle"
        fill="white"
        fontSize={width > 100 ? 16 : 12}
        fontWeight="700"
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 12}
        textAnchor="middle"
        fill="white"
        fontSize={width > 100 ? 14 : 11}
        opacity={0.85}
      >
        {value.toLocaleString()} IP
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 28}
        textAnchor="middle"
        fill="white"
        fontSize={width > 100 ? 11 : 9}
        opacity={0.7}
      >
        {totalIpCount > 0 ? ((value / totalIpCount) * 100).toFixed(1) : 0}%
      </text>
    </g>
  );
};

const SectorAnalysis = () => {
  const [dateType, setDateType] = useState<"application" | "certificate">("application");
  const [preset, setPreset] = useState<string>("all");
  const [group, setGroup] = useState<"nice" | "locarno" | "ipc">("nice");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Fetch data from API
  const { data: sectorData, isLoading: sectorLoading } = useSectorIpDistribution({
    dateType,
    group,
    datasource: "MASAN",
    ...(selectedCompany !== "all" && { companyId: Number(selectedCompany) }),
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  // Prepare data
  const treemapData = (sectorData?.sectors || []).map((sector) => ({
    name: sector.sectorName,
    value: sector.ipCount,
    code: sector.sectorCode,
    totalIpCount: sectorData?.totalIpCount || 0,
  }));

  const pieData = (sectorData?.sectors || []).map((sector, idx) => ({
    name: sector.sectorName,
    value: sector.ipCount,
    color: [chartColors.primary, chartColors.accent, chartColors.purple, chartColors.green, chartColors.pink][idx],
  }));

  // Stats
  const totalIpCount = sectorData?.totalIpCount || 0;
  const topSector = sectorData?.sectors[0];
  const avgPerSector = (sectorData?.sectors.length || 0) > 0 
    ? Math.round(totalIpCount / (sectorData?.sectors.length || 1))
    : 0;

  // Export functions
  const exportTreemap = async () => {
    await exportToExcel("Treemap_nganh_hang", [
      {
        sheetName: "Treemap ngành hàng",
        columns: [
          { header: "Ngành hàng", key: "name", width: 30 },
          { header: "Mã ngành", key: "code", width: 15 },
          { header: "Số lượng IP", key: "value", width: 15 },
          { header: "Tỷ trọng (%)", key: "percentage", width: 15 },
        ],
        data: treemapData.map((item) => ({
          name: item.name,
          code: item.code,
          value: item.value,
          percentage: totalIpCount > 0 ? ((item.value / totalIpCount) * 100).toFixed(2) : "0.00",
        })),
      },
    ]);
  };

  const exportPieChart = async () => {
    await exportToExcel("Ty_trong_nganh_hang", [
      {
        sheetName: "Tỷ trọng ngành hàng",
        columns: [
          { header: "Ngành hàng", key: "name", width: 30 },
          { header: "Số lượng IP", key: "value", width: 15 },
          { header: "Tỷ trọng (%)", key: "percentage", width: 15 },
        ],
        data: pieData.map((item) => ({
          name: item.name,
          value: item.value,
          percentage: totalIpCount > 0 ? ((item.value / totalIpCount) * 100).toFixed(2) : "0.00",
        })),
      },
    ]);
  };

  const exportBarChart = async () => {
    await exportToExcel("So_sanh_nganh_hang", [
      {
        sheetName: "So sánh ngành hàng",
        columns: [
          { header: "Ngành hàng", key: "name", width: 30 },
          { header: "Mã ngành", key: "code", width: 15 },
          { header: "Số lượng IP", key: "value", width: 15 },
        ],
        data: treemapData,
      },
    ]);
  };

  const exportSectorDetail = async () => {
    await exportToExcel("Chi_tiet_nganh_hang", [
      {
        sheetName: "Chi tiết ngành hàng",
        columns: [
          { header: "STT", key: "index", width: 10 },
          { header: "Ngành hàng", key: "sectorName", width: 30 },
          { header: "Mã ngành", key: "sectorCode", width: 15 },
          { header: "Số lượng IP", key: "ipCount", width: 15 },
          { header: "Tỷ trọng (%)", key: "percentage", width: 15 },
        ],
        data: (sectorData?.sectors || []).map((sector, idx) => ({
          index: idx + 1,
          sectorName: sector.sectorName,
          sectorCode: sector.sectorCode,
          ipCount: sector.ipCount,
          percentage: ((sector.percentage || 0) * 100).toFixed(2),
        })),
      },
    ]);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Cơ cấu Ngành hàng
            </h1>
            <p className="text-muted-foreground mt-1">
              Phân tích IP theo lĩnh vực và nhóm hàng hóa
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap lg:justify-end">
            <CompanyDropdown
              value={selectedCompany}
              onValueChange={setSelectedCompany}
            />
            <Select value={group} onValueChange={(v) => setGroup(v as any)}>
              <SelectTrigger className="w-40 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nice">Nice Class</SelectItem>
                <SelectItem value="locarno">Locarno Class</SelectItem>
                <SelectItem value="ipc">IPC Class</SelectItem>
              </SelectContent>
            </Select>
            <DateFilter 
              dateType={dateType} 
              onDateTypeChange={setDateType}
              preset={preset}
              onPresetChange={setPreset}
            />
          </div>
        </div>
        {preset === "custom" && (
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
                placeholder="Từ ngày"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
                placeholder="Đến ngày"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Tổng số ngành"
          value={sectorLoading ? "..." : (sectorData?.sectors.length || 0)}
          subtitle="Lĩnh vực hoạt động"
          icon={Layers}
          delay={100}
        />
        <StatCard
          title="Ngành dẫn đầu"
          value={sectorLoading ? "..." : topSector?.sectorName || "-"}
          subtitle={topSector ? `${topSector.ipCount.toLocaleString()} IP` : "-"}
          icon={TrendingUp}
          delay={200}
        />
        <StatCard
          title="Trung bình/Ngành"
          value={sectorLoading ? "..." : avgPerSector.toLocaleString()}
          subtitle="IP mỗi lĩnh vực"
          icon={BarChart3}
          delay={300}
        />
        <StatCard
          title="Tập trung cao nhất"
          value={sectorLoading ? "..." : topSector ? `${((topSector.percentage || 0) * 100).toFixed(0)}%` : "0%"}
          subtitle={topSector ? `Ngành ${topSector.sectorName}` : "-"}
          icon={Package}
          delay={400}
        />
      </div>

      {/* Main Treemap */}
      <ChartCard
        title="Treemap ngành hàng"
        subtitle="Tỷ trọng IP theo lĩnh vực"
        delay={500}
        className="mb-8"
        onExport={exportTreemap}
      >
        {sectorLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="value"
              aspectRatio={16 / 9}
              stroke="hsl(var(--background))"
              content={<CustomTreemapContent />}
            />
            </ResponsiveContainer>
          </div>
          )}
        </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <ChartCard
          title="Tỷ trọng ngành hàng"
          subtitle="Phân bổ IP theo lĩnh vực"
          delay={600}
          onExport={exportPieChart}
        >
          {sectorLoading ? (
            <div className="flex items-center justify-center h-72">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
          <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = totalIpCount > 0 ? ((data.value / totalIpCount) * 100).toFixed(1) : 0;
                      return (
                        <div className="bg-popover px-4 py-3 rounded-lg border border-border shadow-lg">
                          <p className="font-medium text-foreground">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.value.toLocaleString()} IP ({percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">{item.name}</span>
              </div>
            ))}
          </div>
          </>
          )}
        </ChartCard>

        {/* Sub-sectors or Bar Chart */}
        <ChartCard
          title="So sánh ngành hàng"
          subtitle="Số lượng IP theo ngành"
          delay={700}
          onExport={exportBarChart}
        >
          {sectorLoading ? (
            <div className="flex items-center justify-center h-72">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={treemapData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number | undefined) => value ? [value.toLocaleString() + " IP", "Số lượng"] : ["0 IP", "Số lượng"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {treemapData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[chartColors.primary, chartColors.accent, chartColors.purple, chartColors.green, chartColors.pink][index % 5]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </ChartCard>
      </div>

      {/* Detailed Table */}
      <ChartCard title="Chi tiết ngành hàng" delay={800} onExport={exportSectorDetail}>
        {sectorLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Ngành hàng</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mã</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Số lượng IP</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Tỷ trọng</th>
                <th className="py-3 px-4 text-sm font-semibold text-muted-foreground w-48">Biểu đồ</th>
              </tr>
            </thead>
            <tbody>
              {(sectorData?.sectors || []).map((sector, idx) => (
                <tr
                  key={sector.sectorCode}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? "bg-primary text-primary-foreground"
                          : idx === 1
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">{sector.sectorName}</td>
                  <td className="py-4 px-4 text-muted-foreground">{sector.sectorCode}</td>
                  <td className="text-right py-4 px-4 font-semibold text-foreground">
                    {sector.ipCount.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 text-muted-foreground">
                    {((sector.percentage || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(sector.percentage || 0) * 100}%`,
                          background: [chartColors.primary, chartColors.accent, chartColors.purple, chartColors.green, chartColors.pink][idx],
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </ChartCard>
    </div>
  );
};

export default SectorAnalysis;
