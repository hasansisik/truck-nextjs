"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  disabled,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      
      setIsUploading(true);
      
      // Handle multiple files
      const files = Array.from(e.target.files);
      
      // Initialize progress tracking for each file
      const initialProgress: {[key: string]: number} = {};
      files.forEach((file) => {
        initialProgress[file.name] = 0;
      });
      setUploadProgress(initialProgress);
      
      // Upload each file one by one to better track progress and handle errors
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        try {
          // Update progress to show we're processing this file
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 10
          }));
          
          const imageUrl = await uploadToCloudinary(file);
          
          if (imageUrl) {
            uploadedUrls.push(imageUrl);
            // Mark this file as complete
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 100
            }));
          }
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`${file.name}: ${error.message || 'Yükleme hatası'}`);
        }
      }
      
      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} fotoğraf başarıyla yüklendi`);
      }
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "Fotoğraf yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      // Clear the input value to allow uploading the same file again
      if (document.getElementById("imageUpload")) {
        (document.getElementById("imageUpload") as HTMLInputElement).value = "";
      }
    }
  };

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image 
              fill 
              className="object-cover" 
              alt="Image" 
              src={url} 
              sizes="200px"
              unoptimized
            />
          </div>
        ))}
      </div>
      <div>
        <Button
          type="button"
          disabled={isUploading || disabled}
          variant="secondary"
          onClick={() => document.getElementById("imageUpload")?.click()}
          className="relative"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Fotoğraf Yükle
            </>
          )}
        </Button>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
          disabled={isUploading || disabled}
          multiple
        />
        {isUploading && Object.keys(uploadProgress).length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="flex items-center justify-between mb-1">
                <span className="truncate max-w-[200px]">{fileName}</span>
                <span>{progress}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 