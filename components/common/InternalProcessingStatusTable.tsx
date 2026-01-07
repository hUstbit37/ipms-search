"use client";

import { useState } from "react";
import { Edit2, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@/lib/react-query";
import { queryClient } from "@/lib/react-query";
import { internalProcessingStatusService, type IpType } from "@/services/internal-processing-status.service";
import moment from "moment";
import { cn } from "@/lib/utils";

interface InternalProcessingStatusTableProps {
  ipType: IpType;
  applicationNumber: string;
}

export function InternalProcessingStatusTable({
  ipType,
  applicationNumber,
}: InternalProcessingStatusTableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    deadline: "",
    status: "Chưa xử lý",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["internal-processing-status", ipType, applicationNumber],
    queryFn: () => internalProcessingStatusService.get(ipType, applicationNumber),
    enabled: !!applicationNumber,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { index: number; title?: string; deadline?: string | null; status?: string }) => {
      if (data.index === -1) {
        return internalProcessingStatusService.addItem(ipType, applicationNumber, {
          title: data.title!,
          deadline: data.deadline || null,
          status: data.status!,
        });
      } else {
        return internalProcessingStatusService.updateItem(ipType, applicationNumber, data.index, {
          title: data.title,
          deadline: data.deadline,
          status: data.status,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-processing-status", ipType, applicationNumber] });
      setIsEditing(false);
      setEditingIndex(null);
      setNewItem({ title: "", deadline: "", status: "Chưa xử lý" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (index: number) => {
      return internalProcessingStatusService.deleteItem(ipType, applicationNumber, index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-processing-status", ipType, applicationNumber] });
    },
  });

  const statusList = data?.internal_processing_status || [];

  const handleEdit = (index: number) => {
    const item = statusList[index];
    setEditingIndex(index);
    setNewItem({
      title: item.title,
      deadline: item.deadline ? moment(item.deadline).format("YYYY-MM-DD") : "",
      status: item.status,
    });
    setIsEditing(true);
  };

  const handleAdd = () => {
    setEditingIndex(-1);
    setNewItem({ title: "", deadline: "", status: "Chưa xử lý" });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!newItem.title.trim()) return;
    updateMutation.mutate({
      index: editingIndex!,
      title: newItem.title,
      deadline: newItem.deadline || null,
      status: newItem.status,
    });
  };

  const handleDelete = (index: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa mục này?")) {
      deleteMutation.mutate(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nội Bộ</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          className="h-8 px-3 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Thêm
        </Button>
      </div>

      {statusList.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-lg">
          Không có dữ liệu tiến trình nội bộ
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b">
                  Tiến trình
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b">
                  Deadline
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b">
                  Trạng thái
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 border-b w-[100px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {statusList.map((item, index) => {
                const isCompleted = item.status === "Đã xử lý";
                const isOverdue = item.deadline && moment(item.deadline).isBefore(moment(), 'day') && !isCompleted;

                return (
                  <tr
                    key={index}
                    className={cn(
                      "border-b last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50",
                      isOverdue && "bg-red-50/50 dark:bg-red-900/10"
                    )}
                  >
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className={cn(isCompleted && "line-through text-gray-400")}>
                        {item.title}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {item.deadline ? (
                        <span className={cn(isOverdue && "text-red-600 dark:text-red-400 font-medium")}>
                          {moment(item.deadline).format("DD/MM/YYYY")}
                          {isOverdue && " (Quá hạn)"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Badge
                        variant={isCompleted ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          isOverdue && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(index)}
                          className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-900"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(index)}
                          className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex === -1 ? "Thêm tiến trình mới" : "Chỉnh sửa tiến trình"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Tên tiến trình</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Nhập tên tiến trình"
              />
            </div>
            <div>
              <Label htmlFor="deadline">Ngày hết hạn</Label>
              <Input
                id="deadline"
                type="date"
                value={newItem.deadline}
                onChange={(e) => setNewItem({ ...newItem, deadline: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={newItem.status}
                onValueChange={(value) => setNewItem({ ...newItem, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chưa xử lý">Chưa xử lý</SelectItem>
                  <SelectItem value="Đã xử lý">Đã xử lý</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!newItem.title.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

