/**
 * 커스텀 마크업 태그를 제거하고 순수 텍스트만 반환
 * e.g. "<em-red>50.5</em-red>" → "50.5"
 */
export function stripMarkup(text: string): string {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<(strong|green|red|yellow|em-yellow|em-red|em-green|em-purple|hl-box|span)[^>]*>([\s\S]*?)<\/\1>/gi, "$2")
    .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
