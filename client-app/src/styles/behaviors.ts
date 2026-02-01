export const behaviors = {
  otp: {
    length: 6,
    autoFocus: true,
  },
};

export function scrollToFirstError() {
  if (typeof document === "undefined") return;
  const target = document.querySelector("[data-error='true']");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}
