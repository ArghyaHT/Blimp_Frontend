import sharp from "sharp";

const API_URL = "https://blimp-final-kk2n.onrender.com/api/v1/auth/view-campaign-history";
const MAX_BANNER_BYTES = 8 * 1024 * 1024;

const escapeXml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const plainText = (value = "") => String(value)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/\s+/g, " ")
  .trim();

const fetchCampaign = async (id) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id }),
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Campaign API returned ${response.status}`);
  const payload = await response.json();
  const campaign = payload?.data?.data || payload?.data?.campaign || payload?.data || null;
  if (!campaign || String(campaign.id) !== String(id)) return null;
  return campaign;
};

const fetchBannerData = async (url) => {
  if (typeof url !== "string") return "";
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "";
  }
  if (parsed.protocol !== "https:") return "";

  const response = await fetch(parsed, { signal: AbortSignal.timeout(3500) });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) return "";
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_BANNER_BYTES) return "";

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  if (!imageBuffer.length || imageBuffer.length > MAX_BANNER_BYTES) return "";
  const optimized = await sharp(imageBuffer, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(1000, 620, { fit: "cover", position: "centre" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${optimized.toString("base64")}`;
};

const numberText = (value, locale) => {
  const number = Number(String(value ?? 0).replace(/[^0-9.]/g, "")) || 0;
  return number.toLocaleString(locale, { maximumFractionDigits: 0 });
};

const wrapTitle = (title, maxChars = 24, maxLines = 3) => {
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  const consumed = lines.join(" ").length;
  if (consumed < title.length && lines.length) {
    const last = lines.length - 1;
    lines[last] = `${lines[last].replace(/[.\s]+$/, "")}…`;
  }
  return lines;
};

const createPosterSvg = ({ campaign, bannerData }) => {
  const title = plainText(campaign.campaign_name || campaign.title || "Support this campaign");
  const country = campaign.country || {};
  const currency = country.symbol || country.currency || "";
  const locale = String(country.currency || "").toUpperCase() === "INR" || currency === "₹" ? "en-IN" : "en-US";
  const raised = campaign.raisedAmount ?? campaign.raised_amount ?? 0;
  const goal = campaign.targetAmount ?? campaign.target_amount ?? 0;
  const targetNumber = Number(String(goal).replace(/[^0-9.]/g, "")) || 0;
  const raisedNumber = Number(String(raised).replace(/[^0-9.]/g, "")) || 0;
  const fallbackPercentage = targetNumber ? (raisedNumber / targetNumber) * 100 : 0;
  const percentage = Math.min(100, Math.max(0, Number(campaign.percentageAchieved || fallbackPercentage)));
  const safeTitle = escapeXml(title);
  const lines = wrapTitle(title).map((line, index) =>
    `<text x="72" y="${215 + index * 65}" class="title">${escapeXml(line)}</text>`
  ).join("");
  const imageMarkup = bannerData
    ? `<image x="650" y="112" width="478" height="348" preserveAspectRatio="xMidYMid slice" href="${bannerData}" clip-path="url(#photoClip)"/>`
    : `<rect x="650" y="112" width="478" height="348" rx="26" fill="#c9e9df"/><text x="889" y="292" text-anchor="middle" class="placeholder">BLIMP</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <clipPath id="photoClip"><rect x="650" y="112" width="478" height="348" rx="26"/></clipPath>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbf9ef"/><stop offset="1" stop-color="#f1f5eb"/></linearGradient>
      <style>
        .brand{font:italic 900 43px Georgia,serif;fill:#075c40}.brandMark{font:700 28px Arial,sans-serif;fill:#075c40}
        .eyebrow{font:700 17px Arial,sans-serif;letter-spacing:3px;fill:#147a5a}
        .title{font:900 48px Arial,sans-serif;letter-spacing:-1.8px;fill:#171b19}
        .raised{font:800 27px Arial,sans-serif;fill:#141a16}.goal{font:400 23px Arial,sans-serif;fill:#66716a}
        .percent{font:800 25px Arial,sans-serif;fill:#147a5a}.cta{font:800 18px Arial,sans-serif;letter-spacing:1px;fill:#153c2f}
        .url{font:500 16px Arial,sans-serif;fill:#63716a}.placeholder{font:italic 900 45px Georgia,serif;fill:#075c40}
      </style>
    </defs>
    <rect width="1200" height="630" rx="34" fill="url(#background)"/>
    <text x="72" y="76" class="brand">blimp</text><text x="188" y="48" class="brandMark">✦</text>
    <text x="72" y="145" class="eyebrow">HELP THIS CAMPAIGN</text>
    ${lines}
    <rect x="72" y="430" width="500" height="1" fill="#d8e0d8"/>
    <text x="72" y="482" class="raised">${escapeXml(currency)}${numberText(raised, locale)} RAISED</text>
    <text x="72" y="520" class="goal">of ${escapeXml(currency)}${numberText(goal, locale)}${!country.symbol && country.currency ? ` ${escapeXml(country.currency)}` : ""}</text>
    <text x="72" y="578" class="cta">LEARN MORE &amp; SUPPORT  →</text>
    ${imageMarkup}
    <rect x="650" y="484" width="478" height="18" rx="9" fill="#d8e2da"/>
    <rect x="650" y="484" width="${(478 * percentage / 100).toFixed(1)}" height="18" rx="9" fill="#45a872"/>
    <text x="650" y="542" class="goal">${escapeXml(currency)}${numberText(raised, locale)} raised</text>
    <text x="1128" y="542" text-anchor="end" class="percent">${Math.round(percentage)}%</text>
    <text x="650" y="582" class="url">A BLIMP campaign  •  Share to help it reach more people</text>
  </svg>`;
};

export const handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return { statusCode: 400, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "A numeric campaign ID is required." };
  }

  try {
    const campaign = await fetchCampaign(id);
    if (!campaign) {
      return { statusCode: 404, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "Campaign not found." };
    }

    let bannerData = "";
    try {
      bannerData = await fetchBannerData(campaign.banner_image || campaign.image);
    } catch (error) {
      console.warn("Campaign banner could not be prepared for poster:", error.message);
    }

    const svg = createPosterSvg({ campaign, bannerData });
    const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 8 }).toBuffer();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(png.length),
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
      body: png.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Could not generate campaign poster:", error.message);
    return {
      statusCode: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      body: "Unable to generate campaign poster.",
    };
  }
};
