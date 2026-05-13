import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { animations, variants } from '../theme';

export interface UploadedImage {
  file: File;
  uri: string;
  uploading: boolean;
  error?: string;
  imgClassifications?: string;
  url?: string;
  key?: string;
  accurencyPercent?: string;
}

interface PropertyImageUploadProps {
  onChange?: (imgs: UploadedImage[]) => void;
  images?: UploadedImage[];
  loading?: boolean;
  maxImages?: number;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  onChange,
  images = [],
  loading = false,
  maxImages = 15
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(images);
  const [isUploading, setIsUploading] = useState(false);

  // Sync internal state with props when images prop changes (for form reset)
  React.useEffect(() => {
    setUploadedImages(images);
  }, [images]);

  const handleImageUpload = useCallback((files: FileList) => {
    if (!files || files.length === 0) return;

    const userData = localStorage.getItem('user');
    const portalUserData = localStorage.getItem('portalUser');
    if (!userData && !portalUserData) {
      alert('Please login to upload images');
      return;
    }

    setIsUploading(true);

    // Process all files and add them to the uploaded images list
    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file`);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Please select an image smaller than 10MB`);
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setUploadedImages(prev => [...prev, {
        file: file,
        uri: imageUrl,
        uploading: false
      }]);
    });

    setIsUploading(false);
  }, []);


  const handleDelete = useCallback((uri: string, key?: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.uri !== uri);
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);



  // Memoized values
  const uploadingCount = useMemo(() =>
    uploadedImages.filter(img => img.uploading).length,
    [uploadedImages]
  );

  const successfulImages = useMemo(() =>
    uploadedImages.filter(img => !img.uploading && !img.error && img.file),
    [uploadedImages]
  );

  const hasValidImages = useMemo(() =>
    successfulImages.length > 0,
    [successfulImages]
  );

  const canAddMoreImages = useMemo(() =>
    uploadedImages.length < maxImages,
    [uploadedImages.length, maxImages]
  );

  const isUserAvailable = useMemo(() => {
    const userData = localStorage.getItem('user');
    const portalUserData = localStorage.getItem('portalUser');
    return !!userData || !!portalUserData;
  }, []);

  // Update parent component when images change
  React.useEffect(() => {
    if (onChange) {
      onChange(uploadedImages);
    }
  }, [uploadedImages, onChange]);

  return (
    <motion.div
      className="space-y-6"
      variants={variants.springDrop}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={animations.springDrop}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Property Images
        </h3>
        <span className="text-primary bg-gray-100 px-3 py-1 rounded-full text-sm">
          {uploadedImages.length} / {maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-4 gap-2">
        {uploadedImages.map((image, index) => (
          <div
            key={image.uri || index}
            className="relative group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md">
              <img
                src={image.uri}
                alt={`Property ${index + 1}`}
                className="w-full h-full object-cover transition-opacity duration-200"
              />
              {image.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-30">
                  <span className="text-white text-xs text-center px-2 font-medium">
                    Upload Failed
                  </span>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(image.uri, image.key)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white shadow-md"
            >
              ×
            </button>

            {/* Image Label */}
            <div className="mt-2 text-xs text-center px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
              {image.imgClassifications || `Image ${index + 1}`}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      {canAddMoreImages && (
        <div className="upload-area">
          <label className="cursor-pointer block">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
              disabled={isUploading || !isUserAvailable}
            />
            <div className="text-center">
              {isUploading ? (
                <span>
                  Processing images...
                </span>
              ) : (
                <>
                  <span className="font-medium hover:underline transition-all duration-200 text-primary">
                    Click to select
                  </span>
                  {' '}or drag and drop
                </>
              )}
            </div>
            <p className="text-xs mt-2 text-gray-500">
              PNG, JPG, GIF up to 10MB each
            </p>
          </label>
        </div>
      )}

      {/* Status Messages */}
      {!isUserAvailable && (
        <div className="alert alert-warning text-center">
          <p className="text-sm">
            Please login to upload images
          </p>
        </div>
      )}

      {!canAddMoreImages && (
        <div className="alert alert-error text-center">
          <p className="text-sm">
            Maximum {maxImages} images allowed
          </p>
        </div>
      )}

      {hasValidImages && (
        <div className="alert alert-success text-center">
          <p className="text-sm font-medium">
            ✓ {successfulImages.length} image{successfulImages.length > 1 ? 's' : ''} selected successfully
          </p>
        </div>
      )}

      {uploadingCount > 0 && (
        <div className="alert alert-info text-center">
          <p className="text-sm">
            Processing {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {uploadedImages.length === 0 && !loading && (
        <div className="alert text-center bg-gray-100 border-gray-200">
          <p className="text-sm italic text-gray-500">
            No images selected yet. Please add at least one image.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PropertyImageUpload; 