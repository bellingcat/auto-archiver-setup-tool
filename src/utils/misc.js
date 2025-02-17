export function urlValidator(url) {
  if (!url) return true;
  if (url.length < 10) return "URL is too short";
  try {
    new URL(url);
    return true;
  } catch (_) {
    return "Not a valid URL";
  }
}

export function getUrlFromResult(item) {
  const final_media = item.result?.media?.filter(
    (m) => m?.properties?.id == "_final_media"
  );
  if (final_media && final_media.length > 0) {
    return final_media[0].urls;
  }
}
