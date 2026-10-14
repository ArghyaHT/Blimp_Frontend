import fs from "node:fs";
import path from "node:path";

const API_URL = "https://blimp-final-kk2n.onrender.com/api/v1/auth/view-campaign-history";
const W = 1200;
const H = 630;

// Netlify's Lambda runtime ships with no system fonts, so SVG text renders as
// empty boxes. Point fontconfig at our bundled font BEFORE sharp is loaded.
const findAssetDir = () => [
  path.join(process.env.LAMBDA_TASK_ROOT || "", "netlify/functions/fonts"),
  path.join(process.cwd(), "netlify/functions/fonts"),
  path.join(process.cwd(), "fonts"),
].find((dir) => fs.existsSync(path.join(dir, "Inter.ttf")));

const setupFonts = () => {
  const fontDir = findAssetDir();
  if (!fontDir) {
    console.warn("Bundled font not found; text may not render.");
    return;
  }
  const confPath = "/tmp/fonts.conf";
  fs.writeFileSync(confPath, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>/tmp/fontconfig-cache</cachedir>
  <config></config>
</fontconfig>`);
  process.env.FONTCONFIG_FILE = confPath;
  process.env.FONTCONFIG_PATH = path.dirname(confPath);
};

let sharpPromise;
const getSharp = () => {
  if (!sharpPromise) {
    setupFonts();
    sharpPromise = import("sharp").then((m) => m.default);
  }
  return sharpPromise;
};

const escapeXml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const plainText = (value = "") => String(value)
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

const fetchCampaign = async (id) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Campaign API returned ${response.status}`);
  const payload = await response.json();
  const campaign = payload?.data?.data || payload?.data?.campaign || payload?.data || null;
  if (!campaign || String(campaign.id) !== String(id)) return null;
  return campaign;
};

const fetchImage = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
};

const toNumber = (v) => Number(String(v ?? 0).replace(/[^0-9.]/g, "")) || 0;

const wrapTitle = (title, maxChars = 30, maxLines = 2) => {
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  let i = 0;
  for (; i < words.length; i++) {
    const next = line ? `${line} ${words[i]}` : words[i];
    if (next.length > maxChars && line) {
      lines.push(line);
      line = words[i];
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) { lines.push(line); i = words.length; }
  if (i < words.length) lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,:;\s]+$/, "")}…`;
  return lines;
};

const BANNER = { x: 60, y: 230, w: 500, h: 340, r: 28 };

const createSvg = (campaign) => {
  const font = "Inter, sans-serif";
  const title = plainText(campaign.campaign_name || campaign.title || "Support this campaign");
  const country = campaign.country || {};
  const symbol = country.symbol || "";
  const locale = String(country.currency || "").toUpperCase() === "INR" ? "en-IN" : "en-US";
  const fmt = (n) => `${symbol}${n.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  const raised = toNumber(campaign.raisedAmount ?? campaign.total_raised);
  const goal = toNumber(campaign.targetAmount ?? campaign.target_amount);
  const pct = Math.min(100, Math.max(0, Math.round(
    Number(campaign.percentageAchieved) || (goal ? (raised / goal) * 100 : 0)
  )));
  const donors = Number(campaign.donation_count || campaign.donationInfo?.length || 0);
  const category = campaign.categories?.name || "";
  const organiser = campaign.campaigns?.fullname || "";

  const titleLines = wrapTitle(title).map((line, i) =>
    `<text x="60" y="${105 + i * 64}" font-family="${font}" font-size="54" font-weight="900" letter-spacing="-1" fill="#20191c">${escapeXml(line.toUpperCase())}</text>`
  ).join("");

  const barW = 470;
  const fillW = Math.max(pct > 0 ? 14 : 0, Math.round((barW * pct) / 100));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbf9ef"/><stop offset="1" stop-color="#f3efdf"/></linearGradient>
    <linearGradient id="mint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b3f3ec"/><stop offset="1" stop-color="#7fe3d9"/></linearGradient>
    <linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#42c978"/><stop offset="1" stop-color="#07843d"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  ${titleLines}

  <!-- banner frame (image composited separately) -->
  <rect x="${BANNER.x - 6}" y="${BANNER.y - 6}" width="${BANNER.w + 12}" height="${BANNER.h + 12}" rx="${BANNER.r + 4}" fill="#ffffff"/>
  <rect x="${BANNER.x}" y="${BANNER.y}" width="${BANNER.w}" height="${BANNER.h}" rx="${BANNER.r}" fill="#e3e0d2"/>
  ${category ? `<rect x="${BANNER.x + 18}" y="${BANNER.y + 18}" width="${category.length * 13 + 36}" height="40" rx="20" fill="#08714d"/>
  <text x="${BANNER.x + 36}" y="${BANNER.y + 45}" font-family="${font}" font-size="20" font-weight="700" fill="#fff">${escapeXml(category)}</text>` : ""}


  <!-- stats panel -->
  <rect x="610" y="305" width="530" height="200" rx="26" fill="url(#mint)" stroke="#65d7cf" stroke-width="3"/>
  <text x="640" y="368" font-family="${font}" font-size="52" font-weight="800" letter-spacing="-1.5" fill="#20191c">${escapeXml(fmt(raised))}</text>
  <text x="1110" y="368" text-anchor="end" font-family="${font}" font-size="44" font-weight="800" fill="#08714d">${pct}%</text>
  <text x="640" y="408" font-family="${font}" font-size="24" font-weight="600" fill="#20191c">RAISED of ${escapeXml(fmt(goal))} goal</text>
  <rect x="640" y="428" width="${barW}" height="16" rx="8" fill="#ffffff" opacity="0.85"/>
  ${fillW ? `<rect x="640" y="428" width="${fillW}" height="16" rx="8" fill="#08714d"/>` : ""}
  <text x="640" y="482" font-family="${font}" font-size="21" font-weight="600" fill="#2f4a3f">${donors} ${donors === 1 ? "donation" : "donations"}${organiser ? ` · by ${escapeXml(organiser)}` : ""}</text>

  <!-- CTA -->
  <rect x="750" y="530" width="390" height="66" rx="33" fill="#08743f"/>
  <rect x="757" y="535" width="376" height="54" rx="27" fill="url(#green)"/>
  <text x="945" y="571" text-anchor="middle" font-family="${font}" font-size="25" font-weight="900" letter-spacing="1" fill="#fff">DONATE NOW</text>
</svg>`;
};

const renderBanner = async (sharp, buffer) => {
  if (!buffer) return null;
  try {
    const mask = Buffer.from(`<svg width="${BANNER.w}" height="${BANNER.h}"><rect width="${BANNER.w}" height="${BANNER.h}" rx="${BANNER.r}" fill="#fff"/></svg>`);
    return await sharp(buffer)
      .resize(BANNER.w, BANNER.h, { fit: "cover", position: "attention" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
  } catch (error) {
    console.error("Banner render failed:", error.message);
    return null;
  }
};

// Official BLIMP logo (green, with sparkle), bundled next to the font.
const renderLogo = async (sharp) => {
  const dir = findAssetDir();
  if (!dir) return null;
  try {
    return await sharp(fs.readFileSync(path.join(dir, "BlimpLogo.png"))).resize({ width: 220 }).png().toBuffer();
  } catch (error) {
    console.error("Logo render failed:", error.message);
    return null;
  }
};

const extractId = (event) =>
  event.queryStringParameters?.id || String(event.rawUrl || event.path || "").match(/\/campaign\/(\d+)/)?.[1];

export const handler = async (event) => {
  const id = extractId(event);
  if (!id || !/^\d+$/.test(String(id))) {
    return { statusCode: 400, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "A numeric campaign ID is required." };
  }

  try {
    const sharp = await getSharp();
    const campaign = await fetchCampaign(id);
    if (!campaign) {
      return { statusCode: 404, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "Campaign not found." };
    }

    const bannerUrl = campaign.banner_image || campaign.campaignsImages?.[0]?.image;
    const [base, banner] = await Promise.all([
      sharp(Buffer.from(createSvg(campaign))).png().toBuffer(),
      fetchImage(bannerUrl).then((buf) => renderBanner(sharp, buf)),
    ]);

    const layers = [];
    const logo = await renderLogo(sharp);
    if (logo) layers.push({ input: logo, left: 615, top: 192 });
    if (banner) layers.push({ input: banner, left: BANNER.x, top: BANNER.y });
    // Re-draw category pill on top of the banner so it stays visible.
    const category = campaign.categories?.name;
    if (banner && category) {
      const pill = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <rect x="${BANNER.x + 18}" y="${BANNER.y + 18}" width="${category.length * 13 + 36}" height="40" rx="20" fill="#08714d"/>
        <text x="${BANNER.x + 36}" y="${BANNER.y + 45}" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#fff">${escapeXml(category)}</text>
      </svg>`;
      layers.push({ input: Buffer.from(pill), left: 0, top: 0 });
    }

    const card = await sharp(base).composite(layers).png().toBuffer();

    // Facebook (and some other apps) crop the edges of link previews. Shrink the
    // card into a centred "safe zone" on the same background so nothing is cut.
    const SAFE = 0.86;
    const innerW = Math.round(W * SAFE);
    const innerH = Math.round(H * SAFE);
    const scaled = await sharp(card).resize(innerW, innerH).png().toBuffer();
    const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbf9ef"/><stop offset="1" stop-color="#f3efdf"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#p)"/></svg>`);
    const png = await sharp(bg)
      .composite([{ input: scaled, left: Math.round((W - innerW) / 2), top: Math.round((H - innerH) / 2) }])
      .png({ compressionLevel: 8 })
      .toBuffer();
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
    console.error("Could not generate campaign OG image:", error);
    return {
      statusCode: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      body: "Unable to generate campaign image.",
    };
  }
};
