'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageIcon } from 'lucide-react';

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src?: string | null;
  alt?: string;
  title?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  open,
  onOpenChange,
  src,
  alt = 'Image',
  title = 'Xem ảnh',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center min-h-[400px] bg-muted rounded">
          {src ? (
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <ImageIcon className="w-16 h-16 mb-2" />
              <p>Không có ảnh</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
