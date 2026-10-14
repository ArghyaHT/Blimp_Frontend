// Builds the text used when sharing a campaign (WhatsApp, X, email, Instagram, native share).
// Format:
//   Please take a look at this campaign: <title>
//   "<first ~160 characters of the story>…"
//   <link>

const toPlainText = (html = "") => {
  let text = String(html || "").trim();
  // Some descriptions are stored as a JSON-quoted string.
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    try { text = JSON.parse(text); } catch { text = text.slice(1, -1); }
  }
  return String(text)
    .replace(/\\n/g, " ")
    .replace(/\\"/g, '"')
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
};

export const getStoryExcerpt = (campaign, maxLength = 160) => {
  const story = toPlainText(
    campaign?.description || campaign?.campaign_details || campaign?.rasing_funds_decription || ""
  ).replace(/^["'“”\s]+|["'“”\s]+$/g, "");
  if (!story) return "";
  if (story.length <= maxLength) return story;
  const cut = story.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : maxLength).replace(/[.,;:\s]+$/, "")}…`;
};

export const buildShareMessage = (campaign, url, { includeUrl = true } = {}) => {
  const title = campaign?.campaign_name || "this campaign";
  const excerpt = getStoryExcerpt(campaign);
  return [
    `Please take a look at this campaign: ${title}`,
    excerpt ? `"${excerpt}"` : "",
    includeUrl ? url : "",
  ].filter(Boolean).join("\n");
};
