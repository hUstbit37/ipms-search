"use client";
import { useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { MiniDonutChart } from "@/components/dashboard/MiniDonutChart";
import { MiniLineChart } from "@/components/dashboard/MiniLineChart";
import { TopList } from "@/components/dashboard/TopList";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGroupIpSummary,
  useIpGrowth,
  useCountryIpDistribution,
  useSectorIpDistribution,
} from "@/hooks/useDashboardQuery";
import { chartColors } from "@/lib/mockData";
import { Boxes, Globe2, TrendingUp, Building2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useAllCompanies, useCompany } from "@/hooks/useCompanyQuery";

// Color palette for companies
const companyColorPalette = [
  chartColors.primary,
  chartColors.accent,
  chartColors.purple,
  chartColors.green,
  chartColors.pink,
  chartColors.slate,
];

const getCompanyColor = (index: number) => 
  companyColorPalette[index % companyColorPalette.length];

const Index = () => {
  const [dateType, setDateType] = useState<"application" | "certificate">("application");
  const [preset, setPreset] = useState<string>("all");
  const [growthFromYear, setGrowthFromYear] = useState<number>(2019);
  const [growthToYear, setGrowthToYear] = useState<number>(new Date().getFullYear());
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Fetch data from APIs
  const { data: groupData, isLoading: groupLoading } = useGroupIpSummary({ 
    dateType,
    datasource: "MASAN",
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  const { data: growthData, isLoading: growthLoading } = useIpGrowth({
    fromYear: growthFromYear,
    toYear: growthToYear,
    dateType,
    datasource: "MASAN"
  });

  const { data: countryData, isLoading: countryLoading } = useCountryIpDistribution({
    dateType,
    datasource: "MASAN",
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  const { data: sectorData, isLoading: sectorLoading } = useSectorIpDistribution({
    dateType,
    group: "nice",
    datasource: "MASAN",
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  // Transform data for charts
  const donutData = (groupData?.companies || []).slice(0, 5).map((company, index) => ({
    name: company.companyName,
    shortName: company.companyShortName,
    value: company.ipCount,
    color: getCompanyColor(index),
  }));

  const lineData = (growthData?.items || []).map((item) => ({
    year: item.year,
    value: item.ipCount,
  }));

  const topCountries = (countryData?.countries || []).slice(0, 5).map((country, idx) => ({
    rank: idx + 1,
    name: country.countryName,
    value: country.ipCount,
    percentage: (country.percentage || 0) * 100, // Convert to percentage
  }));

  const topSectors = (sectorData?.sectors || []).slice(0, 5).map((sector, idx) => ({
    rank: idx + 1,
    name: sector.sectorName,
    value: sector.ipCount,
    percentage: sector.percentage,
  }));

  const currentGrowth = growthData?.items[growthData.items.length - 1]?.growthRate || 0;

  // Tính số công ty của Masan từ useCompanyQuery
  const { companies: masanCompanies } = useAllCompanies();
  const masanCompanyCount = masanCompanies.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Dashboard Tổng quan
            </h1>
            <p className="text-muted-foreground mt-1">
              Thống kê sở hữu trí tuệ toàn Tập đoàn Masan
            </p>
          </div>
          <DateFilter
            dateType={dateType}
            onDateTypeChange={setDateType}
            preset={preset}
            onPresetChange={setPreset}
          />
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Tổng số IP Tập đoàn"
          value={groupLoading ? "..." : (groupData?.totalIpCount || 0).toLocaleString()}
          subtitle="Tài sản SHTT đang bảo hộ"
          icon={Boxes}
          trend={{ value: currentGrowth, isPositive: currentGrowth > 0 }}
          delay={10}
        />
        <StatCard
          title="Tăng trưởng năm"
          value={growthLoading ? "..." : `${currentGrowth > 0 ? '+' : ''}${currentGrowth?.toFixed(1) || 0}%`}
          subtitle="So với năm trước"
          icon={TrendingUp}
          trend={{ value: currentGrowth, isPositive: currentGrowth > 0 }}
          delay={10}
        />
        <StatCard
          title="Số quốc gia bảo hộ"
          value={countryLoading ? "..." : (countryData?.countries?.length || 0)}
          subtitle="Phạm vi toàn cầu"
          icon={Globe2}
          delay={10}
        />
        <StatCard
          title="Đơn vị thành viên"
          value={groupLoading ? "..." : (masanCompanyCount || 0)}
          subtitle="Công ty trong Tập đoàn"
          icon={Building2}
          delay={10}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Tỷ trọng IP theo Đơn vị"
          subtitle="Phân bổ tài sản SHTT giữa các công ty"
          linkTo="dashboard/company-analysis"
          delay={500}
        >
          {groupLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <MiniDonutChart
                data={donutData}
                centerValue={(groupData?.totalIpCount || 0).toLocaleString()}
                centerLabel="Tổng IP"
              />
              <div className="grid grid-cols-5 gap-2 mt-4">
                {donutData.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">{item.shortName}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        <ChartCard
          title="Xu hướng tăng trưởng IP"
          subtitle="Số lượng IP qua các năm"
          linkTo="dashboard/growth-analysis"
          delay={600}
        >
          <div className="flex items-center gap-2 mb-4">
            <Select 
              value={growthFromYear.toString()} 
              onValueChange={(v) => {
                const year = parseInt(v);
                if (year <= growthToYear) {
                  setGrowthFromYear(year);
                }
              }}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 14 + i).map((y) => (
                  <SelectItem key={y} value={y.toString()} disabled={y > growthToYear}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">đến</span>
            <Select 
              value={growthToYear.toString()} 
              onValueChange={(v) => {
                const year = parseInt(v);
                if (year >= growthFromYear) {
                  setGrowthToYear(year);
                }
              }}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 14 + i).map((y) => (
                  <SelectItem key={y} value={y.toString()} disabled={y < growthFromYear}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {growthLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <MiniLineChart data={lineData} />
          )}
        </ChartCard>
      </div>

      {/* Bottom Row - Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Top Quốc gia bảo hộ"
          subtitle="Số lượng IP theo quốc gia"
          linkTo="dashboard/geo-distribution"
          delay={700}
        >
          {countryLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <TopList title="" items={topCountries} />
          )}
        </ChartCard>

        <ChartCard
          title="Top Ngành hàng"
          subtitle="Phân bổ IP theo lĩnh vực"
          linkTo="dashboard/sector-analysis"
          delay={800}
        >
          {sectorLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : topSectors.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Không có dữ liệu
            </div>
          ) : (
            <TopList title="" items={topSectors} />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Index;
