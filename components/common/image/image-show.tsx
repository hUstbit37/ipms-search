import React, { useState } from 'react';
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

  const sizeClasses = {
    sm: 'w-[40px] h-[40px] min-w-[40px] min-h-[40px]',
    md: 'w-[50px] h-[50px] min-w-[50px] min-h-[50px]',
    lg: 'w-[80px] h-[80px] min-w-[80px] min-h-[80px]',
    xl: 'w-[100px] h-[100px] min-w-[100px] min-h-[100px]',
    xxl: 'w-[120px] h-[120px] min-w-[120px] min-h-[120px]',
    xxxl: 'w-[200px] h-[200px] min-w-[200px] min-h-[200px]'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    xxl: 'w-14 h-14',
    xxxl: 'w-16 h-16'
  };

  // Placeholder khi không có ảnh hoặc lỗi
  const PlaceholderIcon = () => (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
      <ImageIcon className={iconSizeClasses[size]} />
    </div>
  );

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
          className={`flex items-center justify-center border rounded overflow-visible relative ${enableModal ? 'cursor-pointer' : ''} ${sizeClasses[size]} ${className}`}
          onClick={enableModal ? () => setIsModalOpen(true) : undefined}
        >
          <img
            loading="lazy"
            className={`w-full h-full object-contain rounded ${
              disableHover 
                ? '' 
                : 'transition-transform duration-300 hover:scale-150 hover:z-[9999] hover:border hover:border-gray-300 hover:shadow-lg hover:bg-white relative'
            }`}
            src={fallbackSrc}
            alt="Fallback"
            onError={() => setFallbackError(true)}
          />
        </div>
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
        className={`flex items-center justify-center border rounded overflow-visible relative ${enableModal ? 'cursor-pointer' : ''} ${sizeClasses[size]} ${className}`}
        onClick={enableModal ? () => setIsModalOpen(true) : undefined}
      >
        <img
          loading="lazy"
          className={`w-full h-full object-contain rounded ${
            disableHover 
              ? '' 
              : 'transition-transform duration-300 hover:scale-150 hover:z-[9999] hover:border hover:border-gray-300 hover:shadow-lg hover:bg-white relative'
          }`}
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
        />
      </div>
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
