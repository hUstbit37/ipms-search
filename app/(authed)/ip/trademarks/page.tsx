"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, Plus } from "lucide-react"
import CreateTrademarkWizard from "@/components/trademarks/create/CreateTrademarkWizard"
import moment from "moment"

// Mock data
const mockTrademarks = [
  {
    id: 1,
    logo: "https://via.placeholder.com/60",
    name: "OMACHI SPICY",
    requestDate: "2025-12-15",
    applicationNumber: "",
    tag: "",
    status: "Nháp",
    lastUpdate: "15/12/2025",
    updatedBy: "nguyen@gmail.com"
  },
  {
    id: 2,
    logo: "https://via.placeholder.com/60",
    name: "CHIN-SU VIP",
    requestDate: "2025-12-14",
    applicationNumber: "",
    tag: "",
    status: "Chờ duyệt",
    lastUpdate: "14/12/2025",
    updatedBy: ""
  },
  {
    id: 3,
    logo: "https://via.placeholder.com/60",
    name: "KOKOMI DẠI",
    requestDate: "2025-12-07",
    applicationNumber: "4-2025-99881, 4-2025-99882",
    tag: "",
    status: "Đã duyệt",
    lastUpdate: "07/12/2025",
    updatedBy: ""
  },
  {
    id: 4,
    logo: "https://via.placeholder.com/60",
    name: "WAKE-UP 247",
    requestDate: "2025-12-10",
    applicationNumber: "",
    tag: "",
    status: "Từ chối",
    lastUpdate: "10/12/2025",
    updatedBy: ""
  }
]

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    "Nháp": { label: "Nháp", className: "bg-gray-500 hover:bg-gray-600" },
    "Chờ duyệt": { label: "Chờ duyệt", className: "bg-orange-500 hover:bg-orange-600" },
    "Đã duyệt": { label: "Đã duyệt", className: "bg-blue-500 hover:bg-blue-600" },
    "Từ chối": { label: "Từ chối", className: "bg-red-500 hover:bg-red-600" }
  }
  
  const config = statusMap[status] || { label: status, className: "bg-gray-500" }
  return (
    <Badge className={`${config.className} text-white`}>
      {config.label}
    </Badge>
  )
}

export default function TrademarksPage() {
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")

  if (showCreateWizard) {
    return (
      <div className="container mx-auto py-6">
        <CreateTrademarkWizard onCancel={() => setShowCreateWizard(false)} />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh sách Yêu cầu Nhãn hiệu</h1>
        <Button 
          onClick={() => setShowCreateWizard(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Yêu cầu Mới
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-5 gap-4">
        <Input
          placeholder="Tìm kiếm tên nhãn hiệu"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="col-span-2 w-full"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Nháp">Nháp</SelectItem>
            <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
            <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
            <SelectItem value="Từ chối">Từ chối</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="food">#food</SelectItem>
            <SelectItem value="beverage">#beverage</SelectItem>
          </SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Công ty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="company1">Công ty A</SelectItem>
            <SelectItem value="company2">Công ty B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Mẫu Nhãn</TableHead>
              <TableHead>Tên Nhãn hiệu</TableHead>
              <TableHead>Ngày Yêu cầu</TableHead>
              <TableHead>Số Đơn</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày cập nhật cuối</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTrademarks.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                <TableCell>
                  <img 
                    src={item.logo} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded border"
                  />
                </TableCell>
                <TableCell className="font-semibold">{item.name}</TableCell>
                <TableCell className="text-sm">{item.requestDate}</TableCell>
                <TableCell className="text-sm">
                  {item.applicationNumber ? (
                    <div className="space-y-1">
                      {item.applicationNumber.split(", ").map((num, idx) => (
                        <div key={idx} className="text-blue-600">{num}</div>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-sm">{item.tag || "-"}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-sm">
                  <div>{item.lastUpdate}</div>
                  {item.updatedBy && (
                    <div className="text-xs text-gray-500">bởi {item.updatedBy}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {item.status === "Nháp" && (
                      <>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                    {item.status === "Chờ duyệt" && (
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {item.status === "Đã duyệt" && (
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {item.status === "Từ chối" && (
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
