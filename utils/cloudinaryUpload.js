/**
 * Utility function to upload files to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} preset - The Cloudinary upload preset to use
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<string>} - The upload response with secure URL
 */
import { uploadImageToCloudinary } from './cloudinary';

export async function uploadToCloudinary(file, preset = 'truck_uploads', folder = 'tow_trucks') {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    // Check if file size is too large (10MB limit for Cloudinary free plan)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      console.error('File size too large:', file.size);
      throw new Error(`Dosya boyutu çok büyük (maksimum 10MB): ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    // Use the TypeScript implementation for actual upload
    const imageUrl = await uploadImageToCloudinary(file);
    return imageUrl;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Helper function to get appropriate Cloudinary upload preset based on file type
 * @param {string} fileType - The type of file (e.g., 'image', 'icon', 'document')
 * @returns {string} - The Cloudinary preset to use
 */
export function getUploadPreset(fileType) {
  // Map file types to different presets if needed
  const presetMap = {
    image: 'truck_images',
    document: 'truck_docs'
  };

  return presetMap[fileType] || 'truck_uploads';
} 