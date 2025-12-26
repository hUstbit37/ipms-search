"use client";
import { useState } from "react";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { CompanyDropdown } from "@/components/dashboard/CompanyDropdown";
import { TopList } from "@/components/dashboard/TopList";
import { useCountryIpDistribution } from "@/hooks/useDashboardQuery";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { chartColors } from "@/lib/mockData";
import { Globe2, MapPin, Flag, TrendingUp, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "recharts";

// Custom Treemap content
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value, index } = props;
  const colors = [
    chartColors.primary,
    chartColors.accent,
    chartColors.purple,
    chartColors.green,
    chartColors.pink,
    chartColors.slate,
  ];

  if (!value || width < 50 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colors[index % colors.length]}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        rx={4}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 8}
        textAnchor="middle"
        fill="white"
        fontSize={width > 80 ? 14 : 11}
        fontWeight="600"
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill="white"
        fontSize={width > 80 ? 12 : 10}
        opacity={0.8}
      >
        {value.toLocaleString()} IP
      </text>
    </g>
  );
};

const GeoDistribution = () => {
  const [dateType, setDateType] = useState<"application" | "certificate">("certificate");
  const [preset, setPreset] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  // Fetch data from API
  const { data: countryData, isLoading: countryLoading } = useCountryIpDistribution({
    dateType,
    datasource: "MASAN",
    ...(selectedCompany !== "all" && { companyId: Number(selectedCompany) }),
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  // Prepare data
  const barData = (countryData?.countries || []).map((country) => ({
    name: country.countryName,
    value: country.ipCount,
    code: country.countryCode,
  }));

  const treemapData = (countryData?.countries || []).map((country) => ({
    name: country.countryCode,
    value: country.ipCount,
    fullName: country.countryName,
  }));

  const topCountries = (countryData?.countries || []).map((country, idx) => ({
    rank: idx + 1,
    name: country.countryName,
    value: country.ipCount,
    percentage: (country.percentage || 0) * 100, // Convert from decimal to percent
  }));

  // Stats
  const totalIpCount = countryData?.totalIpCount || 0;
  const domesticIp = (countryData?.countries || []).find((c) => c.countryCode === "VN")?.ipCount || 0;
  const internationalIp = totalIpCount - domesticIp;
  const topCountry = countryData?.countries[0];
  // Export functions
  const exportBarChart = async () => {
    await exportToExcel("Bieu_do_phan_bo_theo_quoc_gia", [
      {
        sheetName: "Phân bố theo quốc gia",
        columns: [
          { header: "Quốc gia", key: "name", width: 30 },
          { header: "Mã quốc gia", key: "code", width: 15 },
          { header: "Số lượng IP", key: "value", width: 15 },
        ],
        data: barData,
      },
    ]);
  };

  const exportTreemap = async () => {
    await exportToExcel("Treemap_phan_bo_IP", [
      {
        sheetName: "Treemap phân bố IP",
        columns: [
          { header: "Mã quốc gia", key: "name", width: 15 },
          { header: "Tên quốc gia", key: "fullName", width: 30 },
          { header: "Số lượng IP", key: "value", width: 15 },
        ],
        data: treemapData,
      },
    ]);
  };

  const exportCountryDetail = async () => {
    await exportToExcel("Chi_tiet_theo_quoc_gia", [
      {
        sheetName: "Chi tiết theo quốc gia",
        columns: [
          { header: "Quốc gia", key: "countryName", width: 30 },
          { header: "Mã", key: "countryCode", width: 10 },
          { header: "Số lượng IP", key: "ipCount", width: 15 },
          { header: "Tỷ trọng (%)", key: "percentage", width: 15 },
        ],
        data: (countryData?.countries || []).map((c) => ({
          countryName: c.countryName,
          countryCode: c.countryCode,
          ipCount: c.ipCount,
          percentage: ((c.percentage || 0) * 100).toFixed(2),
        })),
      },
    ]);
  };
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Phân bổ Địa lý
          </h1>
          <p className="text-muted-foreground mt-1">
            Thống kê IP theo quốc gia và khu vực bảo hộ
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <CompanyDropdown
              value={selectedCompany}
              onValueChange={setSelectedCompany}
            />
            <DateFilter 
              dateType={dateType} 
              onDateTypeChange={setDateType}
              preset={preset}
              onPresetChange={setPreset}
            />
          </div>
          {preset === "custom" && (
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
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Tổng số quốc gia"
          value={countryLoading ? "..." : (countryData?.countries.length || 0)}
          subtitle="Phạm vi bảo hộ toàn cầu"
          icon={Globe2}
          delay={100}
        />
        <StatCard
          title="IP trong nước"
          value={countryLoading ? "..." : domesticIp.toLocaleString()}
          subtitle={totalIpCount > 0 ? `${((domesticIp / totalIpCount) * 100).toFixed(0)}% tổng IP` : "0%"}
          icon={Flag}
          delay={200}
        />
        <StatCard
          title="IP quốc tế"
          value={countryLoading ? "..." : internationalIp.toLocaleString()}
          subtitle={totalIpCount > 0 ? `${((internationalIp / totalIpCount) * 100).toFixed(0)}% tổng IP` : "0%"}
          icon={MapPin}
          delay={300}
        />
        <StatCard
          title="Quốc gia dẫn đầu"
          value={countryLoading ? "..." : topCountry?.countryName || "-"}
          subtitle={topCountry ? `${topCountry.ipCount.toLocaleString()} IP` : "-"}
          icon={TrendingUp}
          delay={400}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Biểu đồ phân bổ theo quốc gia"
          subtitle="Top quốc gia có nhiều IP nhất"
          delay={500}
          onExport={exportBarChart}
        >
          {countryLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
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
                  {barData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? chartColors.primary : chartColors.accent}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </ChartCard>

        <ChartCard
          title="Treemap phân bổ IP"
          subtitle="Tỷ trọng IP theo quốc gia"
          delay={600}
          onExport={exportTreemap}
        >
          {countryLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="value"
                aspectRatio={4 / 3}
                stroke="hsl(var(--background))"
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
          </div>          )}        </ChartCard>
      </div>

      {/* Detailed List */}
      <ChartCard title="Chi tiết theo quốc gia" delay={700} onExport={exportCountryDetail}>
        {countryLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Quốc gia</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mã</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Số lượng IP</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Tỷ trọng</th>
                <th className="py-3 px-4 text-sm font-semibold text-muted-foreground w-48">Biểu đồ</th>
              </tr>
            </thead>
            <tbody>
              {(countryData?.countries || []).map((country, idx) => (
                <tr key={country.countryCode} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
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
                  <td className="py-4 px-4 font-medium text-foreground">{country.countryName}</td>
                  <td className="py-4 px-4 text-muted-foreground">{country.countryCode}</td>
                  <td className="text-right py-4 px-4 font-semibold text-foreground">
                    {country.ipCount.toLocaleString()}
                  </td>
                  <td className="text-right py-4 px-4 text-muted-foreground">
                    {((country.percentage || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(country.percentage || 0) * 100}%`,
                          background: `linear-gradient(90deg, ${chartColors.primary} 0%, ${chartColors.accent} 100%)`,
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

export default GeoDistribution;
