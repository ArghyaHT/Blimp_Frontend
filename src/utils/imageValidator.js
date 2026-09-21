/**
 * Image Quality and Resolution Validation Utility
 */

export const validateImageQualityAndSafety = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      type = "image", // 'banner' | 'gallery' | 'profile'
      minWidth = type === "banner" ? 800 : 400,
      minHeight = type === "banner" ? 450 : 400,
    } = options;

    if (!file) {
      return reject(new Error("No file selected."));
    }

    if (!file.type.startsWith("image/")) {
      return reject(new Error(`"${file.name}" is not a valid image file.`));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // 1. Resolution Check
      if (width < minWidth || height < minHeight) {
        return reject(
          new Error(
            `Image resolution is too low (${width}x${height}px). ${
              type === "banner"
                ? `Banner images must be at least ${minWidth}x${minHeight}px for crisp display.`
                : `Images must be at least ${minWidth}x${minHeight}px.`
            }`
          )
        );
      }

      // 2. Pixelation & Sharpness Analysis via Canvas 2D Data
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const sampleSize = Math.min(width, height, 400);
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        let totalGradient = 0;
        let count = 0;

        for (let i = 0; i < data.length - 4; i += 4) {
          const r1 = data[i];
          const g1 = data[i + 1];
          const b1 = data[i + 2];

          const r2 = data[i + 4];
          const g2 = data[i + 1 + 4];
          const b2 = data[i + 2 + 4];

          const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
          totalGradient += diff;
          count++;
        }

        const avgGradient = totalGradient / (count || 1);

        if (avgGradient < 1.0 && width > 100 && height > 100) {
          return reject(
            new Error(
              `"${file.name}" appears to be extremely blurry or pixelated. Please upload a clear, high-quality image.`
            )
          );
        }
      } catch (err) {
        console.warn("Canvas sharpness validation skipped:", err);
      }

      resolve({ valid: true, width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load "${file.name}". The image file may be corrupted.`));
    };

    img.src = objectUrl;
  });
};
