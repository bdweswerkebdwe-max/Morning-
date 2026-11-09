/**
 * Image processing and normalization utility for MOLAN AI.
 * Handles client-side format conversion, HEIC/HEIF phone photos,
 * canvas resampling, and MIME type standardization to image/jpeg or image/png.
 */

export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.avif', '.bmp', '.svg'];

export function isSupportedImageFile(file: File): boolean {
  if (!file) return false;
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.startsWith('image/')) return true;
  return SUPPORTED_IMAGE_EXTENSIONS.some(ext => name.endsWith(ext));
}

/**
 * Converts any input image File (including HEIC, HEIF, JPG, PNG, WEBP, GIF, etc.)
 * into a normalized, valid base64 Data URL (image/jpeg or image/png).
 * Automatically downscales large camera photos (e.g. 12MB phone pictures)
 * so that they fit within optimum API payloads.
 */
export function processAndNormalizeImage(file: File, maxDimension = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('الملف مفقود'));
    }

    if (file.size > 15 * 1024 * 1024) {
      return reject(new Error('حجم الصورة كبير جداً. الحد الأقصى المسموح هو 15 ميجابايت.'));
    }

    if (!isSupportedImageFile(file)) {
      return reject(new Error('نوع الملف غير مدعوم. الصيغ المدعومة هي: JPG, JPEG, PNG, WEBP, GIF, HEIC, HEIF'));
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        let width = img.width || 800;
        let height = img.height || 800;

        // Downscale large camera photos if needed
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('فشل إنشاء سياق الرسم في المتصفح');
        }

        // Fill background with white in case of transparent PNG/WEBP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const exportMime = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(exportMime, 0.92);

        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
          throw new Error('فشلت عملية تحويل الصورة');
        }

        resolve(dataUrl);
      } catch (err: any) {
        // Fallback to FileReader if canvas conversion fails
        fallbackFileReader(file, resolve, reject);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to FileReader if native Image() fails to decode (e.g. non-Safari HEIC)
      fallbackFileReader(file, resolve, reject);
    };

    img.src = objectUrl;
  });
}

function fallbackFileReader(file: File, resolve: (val: string) => void, reject: (reason?: any) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    let result = reader.result as string;
    if (!result || typeof result !== 'string') {
      return reject(new Error('فشلت قراءة بيانات الملف'));
    }

    // Normalize image/jpg or image/pjpeg or image/heic to image/jpeg
    result = result.replace(/^data:image\/(jpg|pjpeg|x-png|heic|heif|avif);base64,/i, 'data:image/jpeg;base64,');

    if (!result.startsWith('data:image/')) {
      return reject(new Error('صيغة ملف الصورة غير صالحة'));
    }

    resolve(result);
  };
  reader.onerror = () => reject(new Error('خطأ في قراءة ملف الصورة من الجهاز'));
  reader.readAsDataURL(file);
}
