import sharp from "sharp";

const API_URL = "https://blimp-final-kk2n.onrender.com/api/v1/auth/view-campaign-history";

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

const numberText = (value, locale) => {
  const number = Number(String(value ?? 0).replace(/[^0-9.]/g, "")) || 0;
  return number.toLocaleString(locale, { maximumFractionDigits: 0 });
};

const wrapTitle = (title, maxChars = 34, maxLines = 3) => {
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

const createPosterSvg = ({ campaign }) => {
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
  const titleLines = wrapTitle(title);
  const lines = titleLines.map((line, index) =>
    `<text x="72" y="${77 + index * 59}" font-family="Arial, Helvetica, sans-serif" font-size="49" font-weight="900" letter-spacing="-1.5" fill="#20191c">${escapeXml(line.toUpperCase())}</text>`
  ).join("");
  const panelRaised = `${escapeXml(currency)}${numberText(raised, locale)}`;
  const panelGoal = `${escapeXml(currency)}${numberText(goal, locale)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbf9ef"/><stop offset="1" stop-color="#f5f2e5"/></linearGradient>
      <linearGradient id="mint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a7f1e9"/><stop offset="1" stop-color="#79e4db"/></linearGradient>
      <linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#42c978"/><stop offset="1" stop-color="#07843d"/></linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#paper)"/>
    ${lines}
    <!-- Hand-drawn donation box illustration -->
    <path d="M62 369 L176 324 L302 373 L206 428 Z" fill="#ed202b"/>
    <path d="M176 324 L278 271 L399 323 L302 373 Z" fill="#e51c28"/>
    <path d="M206 428 L302 373 L431 422 L431 556 L206 615 Z" fill="#d71925"/>
    <path d="M62 369 L206 428 L206 615 L75 561 Z" fill="#d81723"/>
    <path d="M176 324 L302 373 L399 323" fill="none" stroke="#1d1113" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M62 369 L206 428 L431 422" fill="none" stroke="#1d1113" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M206 428 L206 615" fill="none" stroke="#1d1113" stroke-width="8" stroke-linecap="round"/>
    <path d="M320 484 C298 459 268 474 275 501 C280 520 320 543 320 543 C320 543 362 517 366 496 C372 468 338 459 320 484 Z" fill="#fff"/>
    <!-- BLIMP mark and campaign progress -->
    <text x="625" y="340" font-family="Georgia, serif" font-size="47" font-style="italic" font-weight="900" fill="#08714d">blimp</text>
    <path d="M824 293 Q838 319 863 322 Q838 326 824 352 Q817 329 792 324 Q817 319 824 293 Z" fill="none" stroke="#08714d" stroke-width="4"/>
    <rect x="590" y="365" width="550" height="174" rx="25" fill="url(#mint)" stroke="#65d7cf" stroke-width="3"/>
    <text x="620" y="430" font-family="Arial, Helvetica, sans-serif" font-size="49" font-weight="500" letter-spacing="-2" fill="#20191c">${panelRaised}</text>
    <text x="620" y="489" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="400" letter-spacing="1" fill="#20191c">RAISED</text>
    <text x="1105" y="485" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="37" font-weight="800" fill="#20191c">${Math.round(percentage)}%</text>
    <text x="620" y="521" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600" fill="#47534a">of ${panelGoal}${!country.symbol && country.currency ? ` ${escapeXml(country.currency)}` : ""} goal</text>
    <rect x="740" y="553" width="390" height="64" rx="32" fill="#08743f"/>
    <rect x="747" y="558" width="376" height="52" rx="26" fill="url(#green)"/>
    <text x="935" y="592" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="900" letter-spacing="1" fill="#fff">DONATE NOW</text>
  </svg>`;
};

export const handler = async (event) => {
  const id = event.queryStringParameters?.id || String(event.rawUrl || event.path || "").match(/\/campaign\/(\d+)/)?.[1];
  if (!id || !/^\d+$/.test(String(id))) {
    return { statusCode: 400, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "A numeric campaign ID is required." };
  }

  try {
    const campaign = await fetchCampaign(id);
    if (!campaign) {
      return { statusCode: 404, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "Campaign not found." };
    }

    const svg = createPosterSvg({ campaign });
    const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 8 }).toBuffer();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline",
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
