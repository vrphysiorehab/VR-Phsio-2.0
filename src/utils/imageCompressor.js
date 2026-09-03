/**
 * Image Compressor Utility
 * Resizes and compresses high-resolution photos down to lightweight WebP/JPEG data URLs under 80KB
 * Prevents LocalStorage QuotaExceededErrors and enables fast Supabase uploads.
 */

export const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    // If already a small data URL or string
    if (typeof file === 'string' && file.length < 100000) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP / JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = event.target.result;
    };

    if (file instanceof File || file instanceof Blob) {
      reader.readAsDataURL(file);
    } else if (typeof file === 'string') {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = file;
    } else {
      resolve(null);
    }
  });
};

export default compressImage;
