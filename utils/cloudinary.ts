import crypto from 'crypto';

// Get Cloudinary settings from environment variables
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dbw3ozdoh";
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "742373231915158";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "rlJxEB-nHt5b6dIywf57q_fc0iE";

function generateSignature(timestamp: number): string {
  const str = `timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}


export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  // Check if we have the required Cloudinary credentials
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary credentials not found or invalid. Please check your environment variables.');
  }
  
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(timestamp);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          reject(new Error(data.error.message));
        } else {
          resolve(data.secure_url);
        }
      })
      .catch(error => {
        console.error('Upload error:', error);
        reject(error);
      });
  });
};