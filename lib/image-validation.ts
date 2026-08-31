export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
export const MAX_WEBP_BYTES = 12 * 1024 * 1024;

export type SupportedImageMime = "image/jpeg" | "image/png" | "image/webp";

export function detectImageMime(bytes: Uint8Array): SupportedImageMime | null {
  if (bytes.length >= 12) {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  }
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value,
    )
  ) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    return "image/jpeg";
  }
  return null;
}

export function getWebPDimensions(bytes: Uint8Array) {
  if (detectImageMime(bytes) !== "image/webp" || bytes.length < 30) return null;
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  if (chunk === "VP8X") {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }
  if (chunk === "VP8L" && bytes.length >= 25) {
    const b1 = bytes[22];
    const b2 = bytes[23];
    const b3 = bytes[24];
    return {
      width: 1 + (((b2 & 0x3f) << 8) | b1),
      height: 1 + ((b3 << 6) | (b2 >> 2)),
    };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    return {
      width: (bytes[26] | (bytes[27] << 8)) & 0x3fff,
      height: (bytes[28] | (bytes[29] << 8)) & 0x3fff,
    };
  }
  return null;
}
