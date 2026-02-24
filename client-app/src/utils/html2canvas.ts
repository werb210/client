type CaptureOptions = {
  scale?: number;
};

export default async function html2canvas(element: HTMLElement, options: CaptureOptions = {}) {
  const scale = options.scale || 1;
  const width = Math.max(element.scrollWidth, window.innerWidth);
  const height = Math.max(element.scrollHeight, window.innerHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  context.scale(scale, scale);
  context.fillStyle = "rgb(255 255 255)";
  context.fillRect(0, 0, width, height);

  try {
    const serialized = new XMLSerializer().serializeToString(document.documentElement);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${serialized}</foreignObject></svg>`;
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to render document screenshot."));
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });

    context.drawImage(img, 0, 0, width, height);
  } catch (error) {
    console.error("Falling back to blank screenshot capture", error);
  }

  return canvas;
}
