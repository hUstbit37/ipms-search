import React, { useState, useRef } from 'react';
import { ImageIcon } from 'lucide-react';
import { ImageModal } from './image-modal';

interface ImageShowProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  className?: string;
  fallbackSrc?: string;
  modalTitle?: string;
  enableModal?: boolean;
  disableHover?: boolean;
}

const ImageShow: React.FC<ImageShowProps> = ({
  src,
  alt = "Image",
  size = 'md',
  className = '',
  fallbackSrc = '/no-image.jpg',
  modalTitle = 'Xem ảnh',
  enableModal = false,
  disableHover = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-[40px] h-[40px] min-w-[40px] min-h-[40px]',
    md: 'w-[50px] h-[50px] min-w-[50px] min-h-[50px]',
    lg: 'w-[80px] h-[80px] min-w-[80px] min-h-[80px]',
    xl: 'w-[100px] h-[100px] min-w-[100px] min-h-[100px]',
    xxl: 'w-[120px] h-[120px] min-w-[120px] min-h-[120px]',
    xxxl: 'w-[200px] h-[200px] min-w-[200px] min-h-[200px]'
  };

  const hoverSizes = {
    sm: { width: 60, height: 60 },      // 40 x 1.5
    md: { width: 75, height: 75 },      // 50 x 1.5
    lg: { width: 120, height: 120 },    // 80 x 1.5
    xl: { width: 150, height: 150 },    // 100 x 1.5
    xxl: { width: 180, height: 180 },   // 120 x 1.5
    xxxl: { width: 300, height: 300 }   // 200 x 1.5
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    xxl: 'w-14 h-14',
    xxxl: 'w-16 h-16'
  };

  const handleMouseEnter = () => {
    if (disableHover || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoverPosition({
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2
    });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Placeholder khi không có ảnh hoặc lỗi
  const PlaceholderIcon = () => (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
      <ImageIcon className={iconSizeClasses[size]} />
    </div>
  );

  // Hover overlay component
  const HoverOverlay = ({ imgSrc }: { imgSrc: string }) => {
    if (disableHover || !isHovering) return null;
    const hoverSize = hoverSizes[size];
    return (
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: hoverPosition.top,
          left: hoverPosition.left,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <img
          src={imgSrc}
          alt={alt}
          className="border border-gray-300 shadow-lg bg-white rounded"
          style={{ width: hoverSize.width, height: hoverSize.height, objectFit: 'contain' }}
        />
      </div>
    );
  };

  // Nếu không có src hoặc cả 2 đều lỗi
  if (!src || src.trim() === '' || (imageError && fallbackError)) {
    return (
      <div className={`flex items-center justify-center border rounded overflow-hidden ${sizeClasses[size]} ${className}`}>
        <PlaceholderIcon />
      </div>
    );
  }

  // Nếu src chính lỗi, hiển thị fallback
  if (imageError && !fallbackError) {
    return (
      <>
        <div 
          ref={containerRef}
          className={`flex items-center justify-center border rounded overflow-hidden relative ${enableModal ? 'cursor-pointer' : ''} ${sizeClasses[size]} ${className}`}
          onClick={enableModal ? () => setIsModalOpen(true) : undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            loading="lazy"
            className="w-full h-full object-contain rounded"
            src={fallbackSrc}
            alt="Fallback"
            onError={() => setFallbackError(true)}
          />
        </div>
        <HoverOverlay imgSrc={fallbackSrc} />
        {enableModal && (
          <ImageModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            src={fallbackSrc}
            alt="Fallback"
            title={modalTitle}
          />
        )}
      </>
    );
  }

  // Hiển thị ảnh chính
  return (
    <>
      <div 
        ref={containerRef}
        className={`flex items-center justify-center border rounded overflow-hidden relative ${enableModal ? 'cursor-pointer' : ''} ${sizeClasses[size]} ${className}`}
        onClick={enableModal ? () => setIsModalOpen(true) : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          loading="lazy"
          className="w-full h-full object-contain rounded"
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
        />
      </div>
      <HoverOverlay imgSrc={src} />
      {enableModal && (
        <ImageModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          src={src}
          alt={alt}
          title={modalTitle}
        />
      )}
    </>
  );
};

export default ImageShow;
