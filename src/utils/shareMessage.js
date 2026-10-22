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

export const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
};

// Instagram has no link previews or web share URL. Share the campaign card image
// (the same one used for link previews) and copy the caption + link so it can be
// pasted or added as a Story link sticker.
// `notify(type, message)` is used for user feedback (e.g. react-hot-toast).
export const shareToInstagram = async ({ campaign, shareUrl, notify }) => {
  const message = buildShareMessage(campaign, shareUrl);
  const cardUrl = `${shareUrl.replace(/\/?(\?.*)?$/, "")}/og-image.png`;
  try { await copyText(message); } catch { /* clipboard may be blocked */ }

  try {
    const response = await fetch(cardUrl);
    if (!response.ok) throw new Error("Card unavailable");
    const blob = await response.blob();
    const file = new File([blob], `blimp-campaign-${campaign?.id || "card"}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      notify("success", "Caption & link copied. Pick Instagram, then paste it or add a link sticker.");
      await navigator.share({ files: [file], title: campaign?.campaign_name || "BLIMP campaign", text: message });
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(objectUrl);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    notify("success", "Campaign card downloaded and caption copied. Upload it to Instagram.");
  } catch (error) {
    if (error?.name === "AbortError") return;
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    notify("success", "Caption & link copied. Paste it into Instagram to share.");
  }
};
