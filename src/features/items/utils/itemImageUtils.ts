/** Base64 thumbnail from list/detail responses (no data: prefix from backend). */
export function getItemImageSmallUri(
  imageSmall?: string | null,
): string | null {
  return imageSmall ? `data:image/jpeg;base64,${imageSmall}` : null;
}

/** Prefer medium image for detail/edit; fall back to list thumbnail. */
export function getItemPreviewUri(item: {
  imageMedium?: string | null;
  imageSmall?: string | null;
}): string | null {
  if (item.imageMedium) {
    return `data:image/jpeg;base64,${item.imageMedium}`;
  }
  return getItemImageSmallUri(item.imageSmall);
}
