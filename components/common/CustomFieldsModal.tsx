"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Settings2, Plus, Trash2, Loader2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFieldsService, IpType, CustomField } from "@/services/custom-fields.service";

interface CustomFieldsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipType: IpType;
}

export default function CustomFieldsModal({
  open,
  onOpenChange,
  ipType,
}: CustomFieldsModalProps) {
  const queryClient = useQueryClient();
  const [newFieldName, setNewFieldName] = useState("");

  const { data: activeFieldsData, isLoading: isLoadingActive } = useQuery({
    queryKey: ["custom-fields", ipType, "active"],
    queryFn: () => customFieldsService.getCustomFields({ ip_type: ipType, is_active: true, limit: 100 }),
    enabled: open,
  });

  const { data: inactiveFieldsData, isLoading: isLoadingInactive } = useQuery({
    queryKey: ["custom-fields", ipType, "inactive"],
    queryFn: () => customFieldsService.getCustomFields({ ip_type: ipType, is_active: false, limit: 100 }),
    enabled: open,
  });

  const isLoading = isLoadingActive || isLoadingInactive;
  
  const customFields = React.useMemo(() => {
    const fieldsMap = new Map<number, CustomField>();
    
    (inactiveFieldsData?.items || []).forEach(field => {
      fieldsMap.set(field.id, field);
    });
    
    (activeFieldsData?.items || []).forEach(field => {
      fieldsMap.set(field.id, field);
    });
    
    return Array.from(fieldsMap.values());
  }, [activeFieldsData, inactiveFieldsData]);

  const createMutation = useMutation({
    mutationFn: (aliasName: string) => customFieldsService.createCustomField(ipType, { alias_name: aliasName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields", ipType] });
      setNewFieldName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => 
      customFieldsService.updateCustomField(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields", ipType] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (customFieldId: number) => customFieldsService.deleteCustomField(customFieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields", ipType] });
    },
  });

  const handleFieldToggle = (field: CustomField, checked: boolean) => {
    updateMutation.mutate({ id: field.id, is_active: checked });
  };

  const handleCreateField = () => {
    if (newFieldName.trim()) {
      createMutation.mutate(newFieldName.trim());
    }
  };

  const handleDeleteField = (field: CustomField) => {
    if (confirm(`Bạn có chắc muốn xóa trường "${field.alias_name}"?`)) {
      deleteMutation.mutate(field.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Quản lý Trường nội bộ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add new field */}
          <div className="flex gap-2">
            <Input
              placeholder="Tên trường mới..."
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateField();
              }}
            />
            <Button 
              onClick={handleCreateField} 
              disabled={!newFieldName.trim() || createMutation.isPending}
              size="sm"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Field list */}
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Đang tải...
              </div>
            ) : customFields.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Chưa có trường nội bộ nào. Thêm mới ở trên!
              </div>
            ) : (
              <div className="divide-y">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        id={`field-${field.id}`}
                        checked={field.is_active}
                        onCheckedChange={(checked) => handleFieldToggle(field, checked as boolean)}
                        disabled={updateMutation.isPending}
                      />
                      <label
                        htmlFor={`field-${field.id}`}
                        className="text-sm cursor-pointer select-none truncate max-w-[300px]"
                        title={field.alias_name}
                      >
                        {field.alias_name}
                      </label>
                      {!field.is_active && (
                        <span className="text-xs text-gray-400 flex-shrink-0">(Đã ẩn)</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteField(field)}
                      disabled={deleteMutation.isPending}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                      title="Xóa trường"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Tích chọn để hiển thị trường trong bảng kết quả. Bỏ tích để ẩn trường.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
