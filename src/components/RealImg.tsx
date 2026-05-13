import React from 'react';
import axios from 'axios';

// Default image URL
const DEFAULT_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// For single image key
export const keyToImg = async (key: string, retryCount = 0): Promise<string> => {
  if (!key) {
    return DEFAULT_IMAGE_URL;
  }

  try {
    const response = await axios.post("https://nextopson.com/api/v1/s3/keytoimg", { key });
    if (!response?.data?.data?.url) {
      console.warn('Invalid image URL response:', response);
      return DEFAULT_IMAGE_URL;
    }
    return response.data.data.url;
  } catch (error: any) {
    // Handle 429 (rate limit) with exponential backoff
    if (error?.response?.status === 429 && retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      await new Promise<void>(res => setTimeout(res, delay));
      return keyToImg(key, retryCount + 1);
    }
    // Log a friendlier message for 429
    if (error?.response?.status === 429) {
      console.warn('Image rate limit hit. Showing default image.');
    } else {
      console.error('Error converting key to image:', error);
    }
    return DEFAULT_IMAGE_URL;
  }
};

interface RealImgProps {
  imageKey: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  showSkeleton?: boolean;
  containerStyle?: React.CSSProperties;
  defaultImage?: string;
  priority?: 'low' | 'normal' | 'high';
  loadingDelay?: number;
  borderRadius?: number;
  alt?: string;
}

const RealImg: React.FC<RealImgProps> = ({
  imageKey,
  style,
  width,
  height,
  className = '',
  onLoad,
  onError,
  showSkeleton = true,
  containerStyle,
  defaultImage = DEFAULT_IMAGE_URL,
  priority = 'normal',
  loadingDelay = 500,
  borderRadius,
  alt = 'Image',
}) => {
  const [imageUrl, setImageUrl] = React.useState(defaultImage);
  const [isLoading, setIsLoading] = React.useState(true);
  // const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isImageReady, setIsImageReady] = React.useState(false);
  const maxRetries = 2;
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const loadImage = async () => {
      if (!imageKey) {
        setImageUrl(defaultImage);
        setIsLoading(false);
        setIsImageReady(true);
        return;
      }

      setIsLoading(true);
      // setHasError(false);
      setIsImageReady(false);

      try {
        const result = await keyToImg(imageKey);
        if (result === DEFAULT_IMAGE_URL) {
          // setHasError(true);
          onError?.(new Error('Invalid image key or failed to load'));
        }
        setImageUrl(result);

        // Add minimum loading delay
        loadingTimeoutRef.current = setTimeout(() => {
          setIsImageReady(true);
          onLoad?.();
        }, loadingDelay);

      } catch (error) {
        console.error('Error loading image:', error);
        // setHasError(true);
        onError?.(error instanceof Error ? error : new Error('Failed to load image'));

        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadImage();
          }, 1000 * (retryCount + 1));
        } else {
          setImageUrl(defaultImage);
          setIsImageReady(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imageKey, defaultImage, onLoad, onError, retryCount, loadingDelay]);

  const imageStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || '100%',
    objectFit: 'cover' as const,
    borderRadius: borderRadius,
    opacity: isImageReady ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    ...style,
  };

  const containerStyleCombined: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: width || '100%',
    height: height || '100%',
    borderRadius: borderRadius,
    ...containerStyle,
  };

  return (
    <div style={containerStyleCombined} className={className}>
      {(isLoading || !isImageReady) && showSkeleton ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            borderRadius: borderRadius || 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="animate-pulse bg-gray-300 rounded" style={{ width: '100%', height: '100%' }} />
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          style={imageStyle}
          onLoad={() => {
            if (!isImageReady) {
              loadingTimeoutRef.current = setTimeout(() => {
                setIsImageReady(true);
                onLoad?.();
              }, loadingDelay);
            }
          }}
          onError={() => {
            // setHasError(true);
            onError?.(new Error('Failed to load image'));
            setImageUrl(defaultImage);
            setIsImageReady(true);
          }}
          loading={priority === 'low' ? 'lazy' : 'eager'}
        />
      )}
    </div>
  );
};

export default RealImg;

// For multiple image keys
export const keyToImgArray = async (keys: string[]): Promise<string[]> => {
  if (!keys || keys.length === 0) {
    return [DEFAULT_IMAGE_URL];
  }

  try {
    const imagePromises = keys.map(key => keyToImg(key));
    const responses = await Promise.all(imagePromises);
    return responses.map(response => {
      if (!response || response === DEFAULT_IMAGE_URL) {
        return DEFAULT_IMAGE_URL;
      }
      return response;
    });
  } catch (error) {
    console.error('Error converting keys to images:', error);
    return [DEFAULT_IMAGE_URL];
  }
};
