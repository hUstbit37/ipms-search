'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSlideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
  alt?: string;
  title?: string;
}

export const ImageSlideModal: React.FC<ImageSlideModalProps> = ({
  open,
  onOpenChange,
  images = [],
  initialIndex = 0,
  alt = 'Image',
  title = 'Xem ảnh',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const validImages = images.filter(img => img && img.trim() !== '');

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-auto"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>
            {title} {validImages.length > 1 && `(${currentIndex + 1}/${validImages.length})`}
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex items-center justify-center min-h-[400px] bg-muted rounded">
          {validImages.length > 0 ? (
            <>
              {validImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}
              <img
                src={validImages[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
              {validImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <ImageIcon className="w-16 h-16 mb-2" />
              <p>Không có ảnh</p>
            </div>
          )}
        </div>
        {validImages.length > 1 && (
          <div className="flex justify-center gap-2 mt-2 flex-wrap">
            {validImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 rounded border-2 overflow-hidden ${
                  index === currentIndex 
                    ? 'border-blue-500' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
