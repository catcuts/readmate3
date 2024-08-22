export default function getMaxZIndex(selector) {
  const ZIndexes = [];

  for (const element of Array.from(document.querySelectorAll(selector || "body *"))) {
    // console.log(element);
    const ZIndex = window.getComputedStyle(element, null).getPropertyValue("z-index");

    if (ZIndex !== null && ZIndex !== "auto") {
      ZIndexes.push(Number(ZIndex));
    }
  }

  if (ZIndexes.length === 0) {
    return 0;
  }

  return Math.max(...ZIndexes);
}