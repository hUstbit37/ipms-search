"use client";

import { useState } from "react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { CompanyDropdown } from "@/components/dashboard/CompanyDropdown";
import { MiniDonutChart } from "@/components/dashboard/MiniDonutChart";
import { MiniBarChart } from "@/components/dashboard/MiniBarChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGroupIpSummary, useCompanyIpDetail, useCompaniesIpDetail } from "@/hooks/useDashboardQuery";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { chartColors, ipTypeColors } from "@/lib/mockData";
import { Loader2, Search } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from "recharts";

const companyColorPalette = [chartColors.primary, chartColors.accent, chartColors.purple, chartColors.green, chartColors.pink, chartColors.slate];
const getCompanyColor = (index: number) => companyColorPalette[index % companyColorPalette.length];

const CompanyAnalysis = () => {
  const [dateType, setDateType] = useState<"application" | "certificate">("application");
  const [preset, setPreset] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Fetch data from APIs
  const { data: groupData, isLoading: groupLoading } = useGroupIpSummary({
    dateType,
    datasource: "MASAN",
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  const { data: companyDetailData, isLoading: companyDetailLoading } = useCompanyIpDetail({
    dateType,
    datasource: "MASAN",
    companyId: selectedCompany !== "all" ? Number(selectedCompany) : undefined,
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  const { data: companiesData, isLoading: companiesLoading } = useCompaniesIpDetail({
    dateType,
    datasource: "MASAN",
    ...(preset === "custom" && fromDate && toDate ? { fromDate, toDate } : (preset !== "all" && preset !== "custom" ? { preset: preset as any } : {})),
  });

  // Transform data for group overview
  const allCompaniesData = groupData?.companies || [];
  const top5Companies = allCompaniesData.slice(0, 5);
  const otherCompanies = allCompaniesData.slice(5);
  
  const groupDonutData = [
    ...top5Companies.map((company, index) => ({
      name: company.companyName,
      value: company.ipCount,
      color: getCompanyColor(index),
    })),
    ...(otherCompanies.length > 0
      ? [{
          name: "Khác",
          value: otherCompanies.reduce((sum, c) => sum + c.ipCount, 0),
          color: chartColors.slate,
        }]
      : []),
  ];

  // Transform data for company detail
  const companyTypeData = (companyDetailData?.byType || []).map((type) => ({
    name: type.typeName,
    value: type.ipCount,
    color: ipTypeColors[type.typeCode] || chartColors.slate,
  }));

  // Stacked bar data from companiesIpDetail
  const stackedBarData = (companiesData?.companies || []).slice(0, 5).map((company) => {
    const byTypeMap = company.byType.reduce((acc, t) => ({ ...acc, [t.typeCode]: t.ipCount }), {} as Record<string, number>);
    return {
      name: company.companyShortName || String(company.companyId),
      KDCN: byTypeMap.KDCN || 0,
      NH: byTypeMap.NH || 0,
      KCD: byTypeMap.KCD || 0,
      GPH: byTypeMap.GPH || 0,
    };
  });

  // Export functions
  const exportGroupPieChart = async () => {
    await exportToExcel("Ty_trong_IP_toan_Tap_doan", [
      {
        sheetName: "Tỷ trọng IP",
        columns: [
          { header: "Công ty", key: "companyName", width: 40 },
          { header: "Số lượng IP", key: "ipCount", width: 15 },
          { header: "Tỷ trọng (%)", key: "percentage", width: 15 },
        ],
        data: allCompaniesData.map((c) => ({
          companyName: c.companyName,
          ipCount: c.ipCount,
          percentage: ((c.percentage || 0) * 100).toFixed(2),
        })),
      },
    ]);
  };

  const exportCompanyDetail = async () => {
    if (!companyDetailData) return;
    await exportToExcel(`Tai_san_IP_${companyDetailData.companyName}`, [
      {
        sheetName: "Chi tiết IP",
        columns: [
          { header: "Loại IP", key: "typeName", width: 30 },
          { header: "Số lượng", key: "ipCount", width: 15 },
          { header: "Tỷ trọng (%)", key: "percentage", width: 15 },
        ],
        data: companyDetailData.byType.map((t) => ({
          typeName: t.typeName,
          ipCount: t.ipCount,
          percentage: companyDetailData.totalIpCount
            ? ((t.ipCount / companyDetailData.totalIpCount) * 100).toFixed(2)
            : 0,
        })),
      },
    ]);
  };

  const exportStackedBar = async () => {
    await exportToExcel("So_sanh_loai_IP_theo_Don_vi", [
      {
        sheetName: "So sánh loại IP",
        columns: [
          { header: "Đơn vị", key: "name", width: 30 },
          { header: "Nhãn hiệu (KDCN)", key: "KDCN", width: 20 },
          { header: "Sáng chế (NH)", key: "NH", width: 20 },
          { header: "Kiểu dáng (KCD)", key: "KCD", width: 20 },
          { header: "Giải pháp hữu ích (GPH)", key: "GPH", width: 25 },
        ],
        data: stackedBarData,
      },
    ]);
  };

  const exportCompanyList = async () => {
    await exportToExcel("Danh_sach_don_vi_thanh_vien", [
      {
        sheetName: "Danh sách đơn vị",
        columns: [
          { header: "Đơn vị", key: "companyName", width: 40 },
          { header: "Số lượng IP", key: "ipCount", width: 15 },
          { header: "Tỷ trọng (%)", key: "percentage", width: 15 },
        ],
        data: (groupData?.companies || []).map((c) => ({
          companyName: c.companyName,
          ipCount: c.ipCount,
          percentage: ((c.percentage || 0) * 100).toFixed(2),
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
              Thống kê theo Đơn vị
            </h1>
            <p className="text-muted-foreground mt-1">
              Phân tích chi tiết IP theo từng công ty thành viên
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap lg:justify-end">
            <CompanyDropdown
              value={String(selectedCompany)}
              onValueChange={(value) => setSelectedCompany(value)}
            />
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

      {/* Group Overview / Company Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {selectedCompany === "all" ? (
          <ChartCard
            title="Tỷ trọng IP toàn Tập đoàn"
            subtitle="Phân bổ tài sản SHTT giữa các công ty thành viên"
            delay={100}
            onExport={exportGroupPieChart}
          >
              {groupLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
              <div className="relative h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={groupDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      label={({ name, percent }) => name && percent ? `${name.split(" ").slice(-1)[0]} ${(percent * 100).toFixed(0)}%` : ""}
                      labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                    >
                      {groupDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover px-4 py-3 rounded-lg border border-border shadow-lg z-50">
                              <p className="font-medium text-foreground">{data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.value.toLocaleString()} IP
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-3xl font-display font-bold text-foreground">
                    {(groupData?.totalIpCount || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">Tổng IP</span>
                </div>
              </div>
              )}
            </ChartCard>
        ) : (
          <ChartCard
            title="Tổng Tài sản IP"
            subtitle={companyDetailData?.companyName || "..."}
            delay={100}
            onExport={exportCompanyDetail}
          >
            {companyDetailLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6 p-4">
                <div className="text-3xl font-bold">{(companyDetailData?.totalIpCount || 0).toLocaleString()}</div>
                <div className="space-y-4">
                  {companyTypeData.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{item.name}: {item.value.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">
                          {companyDetailData?.totalIpCount ? Math.round((item.value / companyDetailData.totalIpCount) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${companyDetailData?.totalIpCount ? (item.value / companyDetailData.totalIpCount) * 100 : 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        )}

        <ChartCard
          title="So sánh loại IP theo Đơn vị"
          subtitle="Nhãn hiệu, Sáng chế, Kiểu dáng, Giải pháp hữu ích"
          delay={200}
          onExport={exportStackedBar}
        >
              {companiesLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="KDCN" name="Nhãn hiệu" stackId="a" fill={chartColors.primary} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="NH" name="Sáng chế" stackId="a" fill={chartColors.accent} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="KCD" name="Kiểu dáng" stackId="a" fill={chartColors.purple} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="GPH" name="Giải pháp hữu ích" stackId="a" fill={chartColors.green} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              )}
            </ChartCard>
          </div>

      {/* Company List - Always visible */}
      <ChartCard title="Danh sách đơn vị thành viên" delay={300} onExport={exportCompanyList}>
        {groupLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Đơn vị</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Số lượng IP</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Tỷ trọng</th>
                    <th className="py-3 px-4 text-sm font-semibold text-muted-foreground w-48">Biểu đồ</th>
                  </tr>
                </thead>
                <tbody>
                  {(groupData?.companies || []).map((company, index) => (
                    <tr key={company.companyId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCompanyColor(index) }}
                          />
                          <span className="font-medium text-foreground">{company.companyName}</span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-semibold text-foreground">
                        {company.ipCount.toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-4 text-muted-foreground">
                        {((company.percentage || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(company.percentage || 0) * 100}%`,
                              backgroundColor: getCompanyColor(index),
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

export default CompanyAnalysis;
