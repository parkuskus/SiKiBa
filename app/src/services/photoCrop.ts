export function photoCrop(width: number, height: number, zoom: number, x: number, y: number) {
  const side = Math.min(width, height) / zoom
  return { sx: (width - side) * x / 100, sy: (height - side) * y / 100, side }
}
