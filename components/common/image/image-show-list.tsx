import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageShowListProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallbackSrc?: string;
}

const ImageShowList: React.FC<ImageShowListProps> = ({
  src,
  alt = "Image",
  size = 'md',
  className = '',
  fallbackSrc = '/no-image.jpg'
}) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const sizeClasses = {
    sm: 'w-[40px] h-[40px] min-w-[40px] min-h-[40px]',
    md: 'w-[50px] h-[50px] min-w-[50px] min-h-[50px]',
    lg: 'w-[80px] h-[80px] min-w-[80px] min-h-[80px]'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
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
      <div className={`flex items-center justify-center border rounded overflow-hidden ${sizeClasses[size]} ${className}`}>
        <img
          loading="lazy"
          className="w-full h-full object-contain"
          src={fallbackSrc}
          alt="Fallback"
          onError={() => setFallbackError(true)}
        />
      </div>
    );
  }

  // Hiển thị ảnh chính
  return (
    <div className={`flex items-center justify-center border rounded overflow-hidden ${sizeClasses[size]} ${className}`}>
      <img
        loading="lazy"
        className="w-full h-full object-contain"
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default ImageShowList;
