"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAllCompanies } from "@/hooks/useCompanyQuery";
import { Search } from "lucide-react";

interface CompanyDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CompanyDropdown = ({
  value,
  onValueChange,
  placeholder = "Chọn đơn vị",
  className = "w-48 bg-card",
}: CompanyDropdownProps) => {
  const [companySearch, setCompanySearch] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(20);

  // Fetch all companies for dropdown
  const { companies: allCompanies, isLoading: allCompaniesLoading } = useAllCompanies();

  // Filter companies based on search
  const filteredCompanies = allCompanies.filter((company) =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Paginated companies
  const visibleCompanies = filteredCompanies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCompanies.length;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-96">
        <div className="px-2 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm công ty..."
              value={companySearch}
              onChange={(e) => {
                setCompanySearch(e.target.value);
                setVisibleCount(20);
              }}
              className="pl-8 h-9"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <SelectItem value="all">Toàn tập đoàn</SelectItem>
          {visibleCompanies.map((company) => (
            <SelectItem key={company.id} value={String(company.id)}>
              {company.name}
            </SelectItem>
          ))}
        </div>
        {hasMore && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setVisibleCount((prev) => prev + 20);
              }}
            >
              Xem thêm ({filteredCompanies.length - visibleCount} công ty)
            </Button>
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
