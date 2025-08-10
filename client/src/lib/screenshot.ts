import html2canvas from "html2canvas";
export async function captureScreenAsDataUrl(root: HTMLElement = document.body): Promise<string>{
  const canvas = await html2canvas(root, { useCORS: true, logging: false, scale: 1 });
  return canvas.toDataURL("image/png");
}