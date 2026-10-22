const API_URL = "https://blimp-final-kk2n.onrender.com/api/v1/auth/view-campaign-history";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

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

const getCampaign = async (id) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ slug: id }),
  });
  if (!response.ok) throw new Error(`Campaign API returned ${response.status}`);
  const payload = await response.json();
  const campaign = payload?.data?.data || payload?.data?.campaign || payload?.data || null;
  if (campaign && String(campaign.id) !== String(id) && String(campaign.slug) !== String(id)) return null;
  return campaign;
};

export const handler = async (event) => {
  const id = event.queryStringParameters?.id || String(event.rawUrl || event.path || "").match(/\/campaign\/([^/?#]+)/)?.[1];
  const headers = event.headers || {};
  const forwardedHost = headers["x-forwarded-host"] || headers.host;
  const protocol = headers["x-forwarded-proto"] || "https";
  const origin = process.env.DEPLOY_PRIME_URL || process.env.URL || (forwardedHost ? `${protocol}://${forwardedHost}` : "https://blimpweb.netlify.app");
  const campaignUrl = `${origin}/campaign/${encodeURIComponent(id || "")}`;
  const fallbackTitle = "Fundraising for causes that matter | BLIMP";
  let title = fallbackTitle;
  let description = "Discover and support meaningful fundraising campaigns with BLIMP.";
  let image = "";

  if (id) {
    try {
      const campaign = await getCampaign(id);
      if (campaign) {
        title = plainText(campaign.campaign_name || campaign.title) || fallbackTitle;
        description = plainText(
          campaign.description || campaign.campaign_details || campaign.rasing_funds_decription || ""
        ).slice(0, 280) || `Read the story and support ${title} on BLIMP.`;
        image = `${origin}/campaign/${encodeURIComponent(id)}/og-image.png`;
      }
    } catch (error) {
      console.error("Could not load campaign metadata:", error.message);
    }
  }

  let html;
  try {
    const shellResponse = await fetch(`${origin}/index.html`);
    if (!shellResponse.ok) throw new Error(`Could not load app shell (${shellResponse.status})`);
    html = await shellResponse.text();
  } catch (error) {
    console.error("Could not load the application shell:", error.message);
    return { statusCode: 502, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "Unable to load campaign page." };
  }

  const titleSafe = escapeHtml(title);
  const descriptionSafe = escapeHtml(description);
  const imageSafe = escapeHtml(image);
  const urlSafe = escapeHtml(campaignUrl);
  const metadata = [
    `<title>${titleSafe} | BLIMP</title>`,
    `<meta name="description" content="${descriptionSafe}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="BLIMP" />',
    `<meta property="og:title" content="${titleSafe}" />`,
    `<meta property="og:description" content="${descriptionSafe}" />`,
    `<meta property="og:url" content="${urlSafe}" />`,
    `<meta name="twitter:card" content="${imageSafe ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${titleSafe}" />`,
    `<meta name="twitter:description" content="${descriptionSafe}" />`,
    `<link rel="canonical" href="${urlSafe}" />`,
  ];
  if (imageSafe) {
    metadata.push(
      `<meta property="og:image" content="${imageSafe}" />`,
      '<meta property="og:image:type" content="image/png" />',
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      `<meta property="og:image:alt" content="${titleSafe}" />`,
      `<meta name="twitter:image" content="${imageSafe}" />`
    );
  }

  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\b(?=[^>]*(?:property|name)\s*=\s*["'](?:og:[^"']+|twitter:[^"']+|description)["'])[^>]*>/gi, "")
    .replace(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi, "");
  html = html.replace("</head>", `    ${metadata.join("\n    ")}\n  </head>`);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
    },
    body: html,
  };
};
