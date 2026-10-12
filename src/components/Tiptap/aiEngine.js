/**
 * Grammarly AI Engine for Tiptap Editor
 * Handles intelligent story expansion, grammar polish, tone adjustment,
 * semantic title parsing, heading-aware narrative generation,
 * and integration with Gemini API (or seamless built-in AI narrative generator).
 */

export const stripHtml = (html = "") => {
  if (!html) return "";
  if (typeof document !== "undefined") {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  return String(html).replace(/<[^>]*>?/gm, "");
};

export const countWords = (text = "") => {
  const clean = typeof text === "string" ? stripHtml(text).trim() : "";
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
};

// Fallback cause categories detector
export const detectCause = (text = "", title = "", category = "") => {
  const combined = `${text} ${title} ${category}`.toLowerCase();

  if (combined.match(/cancer|surgery|hospital|medical|treatment|doctor|chemo|transplant|therapy|illness|disease|clinic|medicine|health/)) {
    return "medical";
  }
  if (combined.match(/\b(dog|dogs|cat|cats|puppy|puppies|kitten|kittens|animal|animals|pet|pets|shelter|vet|rescue|paws|wildlife|stray|strays)\b/)) {
    return "animals";
  }
  if (combined.match(/\b(school|college|tuition|student|students|education|degree|books|scholarship|study|university|class|learn)\b/)) {
    return "education";
  }
  if (combined.match(/\b(funeral|memorial|loss|tribute|passed away|loving memory|rest in peace|grave|cemetery|demise)\b/)) {
    return "memorial";
  }
  if (combined.match(/\b(flood|fire|earthquake|storm|disaster|hurricane|rebuild|homeless|damage|emergency|shelter|home)\b/)) {
    return "disaster";
  }
  if (combined.match(/\b(water|borewell|drinking water|well|handpump)\b/)) {
    return "water";
  }
  if (combined.match(/\b(church|temple|mosque|faith|community|mission|youth|elderly|food drive|orphanage)\b/)) {
    return "community";
  }
  if (combined.match(/\b(art|film|music|project|album|game|book|theater|dance|creative)\b/)) {
    return "creative";
  }
  if (combined.match(/\b(sports|team|athlete|athletes|tournament|coach|championship|marathon|competition)\b/)) {
    return "sports";
  }
  return "general";
};

/**
 * Intelligent country & currency resolver.
 * Handles country objects, names, codes, phone codes, and localStorage fallbacks.
 * Platform default is India (₹ / INR).
 */
export const resolveCountryCurrency = (countryInput = null) => {
  let countryObj = null;

  if (typeof countryInput === "object" && countryInput !== null) {
    countryObj = countryInput;
  } else if (typeof countryInput === "string" && countryInput.trim()) {
    try {
      countryObj = JSON.parse(countryInput);
    } catch {
      countryObj = { name: countryInput.trim() };
    }
  }

  // Fallback to localStorage if not supplied
  if (!countryObj && typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem("selectedCountry");
      if (stored) {
        countryObj = JSON.parse(stored);
      }
    } catch {
      // ignore parse errors
    }
  }

  const name = String(countryObj?.name || "").toLowerCase().trim();
  const code = String(countryObj?.code || "").toUpperCase().trim();
  const phone = String(countryObj?.phone_code || "").trim();
  const directSymbol = countryObj?.symbol ? String(countryObj.symbol).trim() : "";
  const directCurrency = String(countryObj?.currency || "").toUpperCase().trim();

  // If a valid direct symbol is already present on the country object, use it
  if (directSymbol) {
    const isIndia = name.includes("india") || code === "IN" || directCurrency === "INR" || directSymbol === "₹";
    return {
      symbol: directSymbol,
      code: directCurrency || (isIndia ? "INR" : "USD"),
      name: countryObj?.name || (isIndia ? "India" : "Country"),
      unitName: isIndia ? "rupee" : (directSymbol === "$" ? "dollar" : "contribution"),
      locale: isIndia ? "en-IN" : "en-US",
    };
  }

  // Country detection rules
  if (
    name.includes("india") ||
    code === "IN" ||
    phone === "+91" ||
    phone === "91" ||
    directCurrency === "INR"
  ) {
    return { symbol: "₹", code: "INR", name: "India", unitName: "rupee", locale: "en-IN" };
  }

  if (
    name.includes("united kingdom") ||
    name.includes("britain") ||
    name.includes("england") ||
    code === "GB" ||
    code === "UK" ||
    phone === "+44" ||
    directCurrency === "GBP"
  ) {
    return { symbol: "£", code: "GBP", name: "United Kingdom", unitName: "pound", locale: "en-GB" };
  }

  if (
    name.includes("united states") ||
    name.includes("usa") ||
    code === "US" ||
    directCurrency === "USD"
  ) {
    return { symbol: "$", code: "USD", name: "United States", unitName: "dollar", locale: "en-US" };
  }

  if (name.includes("canada") || code === "CA" || directCurrency === "CAD") {
    return { symbol: "CA$", code: "CAD", name: "Canada", unitName: "dollar", locale: "en-CA" };
  }

  if (name.includes("australia") || code === "AU" || directCurrency === "AUD") {
    return { symbol: "A$", code: "AUD", name: "Australia", unitName: "dollar", locale: "en-AU" };
  }

  if (
    name.includes("germany") ||
    name.includes("france") ||
    name.includes("italy") ||
    name.includes("spain") ||
    name.includes("netherlands") ||
    name.includes("europe") ||
    directCurrency === "EUR"
  ) {
    return { symbol: "€", code: "EUR", name: countryObj?.name || "Europe", unitName: "euro", locale: "de-DE" };
  }

  if (name.includes("japan") || code === "JP" || directCurrency === "JPY") {
    return { symbol: "¥", code: "JPY", name: "Japan", unitName: "yen", locale: "ja-JP" };
  }

  if (
    name.includes("emirates") ||
    name.includes("uae") ||
    code === "AE" ||
    phone === "+971" ||
    directCurrency === "AED"
  ) {
    return { symbol: "AED ", code: "AED", name: "UAE", unitName: "dirham", locale: "en-AE" };
  }

  if (
    name.includes("saudi") ||
    code === "SA" ||
    phone === "+966" ||
    directCurrency === "SAR"
  ) {
    return { symbol: "SAR ", code: "SAR", name: "Saudi Arabia", unitName: "riyal", locale: "en-SA" };
  }

  if (name.includes("singapore") || code === "SG" || directCurrency === "SGD") {
    return { symbol: "S$", code: "SGD", name: "Singapore", unitName: "dollar", locale: "en-SG" };
  }

  if (name.includes("bangladesh") || code === "BD" || directCurrency === "BDT") {
    return { symbol: "৳", code: "BDT", name: "Bangladesh", unitName: "taka", locale: "bn-BD" };
  }

  // Default fallback for Blimp platform is India (₹)
  return {
    symbol: "₹",
    code: "INR",
    name: countryObj?.name || "India",
    unitName: "rupee",
    locale: "en-IN",
  };
};

/**
 * Formats a monetary amount with the correct country currency symbol and number localization.
 * Strips mismatched currency signs (e.g. cleans "$1000000" to "₹10,00,000" if country is India).
 */
export const formatCurrencyAmount = (amount, countryOrCurrencyInfo = null) => {
  if (amount === undefined || amount === null || amount === "") return "";
  const currencyInfo = countryOrCurrencyInfo?.symbol
    ? countryOrCurrencyInfo
    : resolveCountryCurrency(countryOrCurrencyInfo);

  const rawStr = String(amount).trim();
  const cleanedNumStr = rawStr.replace(/[^0-9.]/g, "");
  if (!cleanedNumStr) {
    return rawStr;
  }

  const num = parseFloat(cleanedNumStr);
  if (isNaN(num)) return rawStr;

  let formattedNumber = "";
  if (currencyInfo.code === "INR") {
    formattedNumber = num.toLocaleString("en-IN");
  } else {
    formattedNumber = num.toLocaleString(currencyInfo.locale || "en-US");
  }

  return `${currencyInfo.symbol}${formattedNumber}`;
};

/**
 * Sanitizes monetary amounts in free-form text or drafts.
 * If the selected country does not use USD ($), converts $1000000 -> ₹10,00,000.
 */
export const sanitizeMonetaryAmounts = (text = "", currencyInfo = null) => {
  if (!text || typeof text !== "string") return text;
  if (!currencyInfo || currencyInfo.symbol === "$") return text;

  return text.replace(/\$\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/g, (match, numStr) => {
    const rawNum = numStr.replace(/,/g, "");
    const val = parseFloat(rawNum);
    if (!isNaN(val)) {
      return formatCurrencyAmount(val, currencyInfo);
    }
    return `${currencyInfo.symbol}${numStr}`;
  });
};

/**
 * Extracts the authentic core narrative from a draft without blowing up word counts.
 */
export const extractUserCoreContext = (plainDraft = "", maxWords = 80) => {
  if (!plainDraft) return "";
  const words = plainDraft.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return plainDraft.trim();
  }
  const sliced = words.slice(0, maxWords).join(" ");
  const lastPunctuation = Math.max(
    sliced.lastIndexOf("."),
    sliced.lastIndexOf("!"),
    sliced.lastIndexOf("?")
  );
  if (lastPunctuation > sliced.length * 0.5) {
    return sliced.slice(0, lastPunctuation + 1);
  }
  return sliced + "...";
};

/**
 * Extracts the primary beneficiary or subject from the campaign heading/title.
 * Handles diverse real-world patterns like:
 * - "Help 5-Year-Old Aarav Fight Blood Cancer" -> "5-Year-Old Aarav"
 * - "Save Bruno: Emergency Spine Surgery" -> "Bruno"
 * - "Support Priya's Engineering Fees" -> "Priya"
 * - "Clean Drinking Water for 500 Families" -> "500 Families"
 * - "Emergency Heart Surgery for My Father Ramesh" -> "My Father Ramesh"
 */
export const extractBeneficiary = (title = "") => {
  if (!title || typeof title !== "string") return "";
  const s = title.trim();

  // 1. Colon pattern: e.g. "Save Bruno: ...", "Help Aarav: ..."
  const colonMatch = s.match(/^(?:help|save|support|fund)\s+([A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+)?)\s*:/i);
  if (colonMatch) return colonMatch[1].trim();

  // 2. Age + Name pattern: "Help 5-Year-Old Aarav Fight ...", "5-year-old Aarav"
  const ageNameMatch = s.match(/(\d+[\s-]*(?:year|yr)s?[\s-]*(?:old)?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (ageNameMatch) {
    const namePart = ageNameMatch[2].replace(/\b(?:fight|beat|battle|survive|recover|overcome|need|needs|fund|support)\b.*$/i, "").trim();
    if (namePart) return `${ageNameMatch[1]} ${namePart}`;
    return ageNameMatch[1];
  }

  // 3. Possessive pattern: "Support Priya's ...", "Aarav's Fight ..."
  const possMatch = s.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\x27s/);
  if (possMatch) {
    let val = possMatch[1].trim().replace(/^(?:help|save|support|fund)\s+/i, "");
    if (!["this", "our", "urgent", "emergency"].includes(val.toLowerCase())) {
      return val;
    }
  }

  // 4. "for [Name/Group]"
  const forMatch = s.match(/\bfor\s+((?:[0-9]+\s+[A-Za-z]+|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|my\s+[a-z]+(?:\s+[A-Za-z]+)*|our\s+[a-z]+(?:\s+[A-Za-z]+)*))/i);
  if (forMatch) {
    let clean = forMatch[1].replace(/^(?:the|a|an)\s+/i, "");
    clean = clean.replace(/\s+(?:to|who|in|at)\b.*$/i, "");
    clean = clean.replace(/\s+(?:fight|beat|battle|survive|recover|overcome|compete|participate)\b.*$/i, "").trim();
    return clean;
  }

  // 5. "Help/Save/Support [Name/Title] to/in"
  const verbToMatch = s.match(/^(?:help|save|support|fund)\s+([A-Za-z\s]+?)\s+(?:to|in|fight|beat|reach|overcome)\b/i);
  if (verbToMatch) {
    let clean = verbToMatch[1].trim().replace(/^(?:a|an|the|our|my)\s+/i, "");
    if (clean.length > 2 && !["this", "urgent", "emergency"].includes(clean.toLowerCase())) {
      return clean;
    }
  }

  // 6. Direct "Help/Save/Support [Name]"
  const directMatch = s.match(/^(?:help|save|support|fund)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (directMatch && !["urgent", "emergency", "our", "this"].includes(directMatch[1].toLowerCase())) {
    let clean = directMatch[1].replace(/\s+(?:fight|beat|battle|survive|recover|overcome|compete|reach|get)\b.*$/i, "").trim();
    return clean;
  }

  return "";
};

/**
 * Performs semantic title analysis to identify specific subcategories,
 * beneficiaries, and precise clinical/human context from the heading.
 */
export const parseCampaignContext = ({
  campaignTitle = "",
  categoryName = "",
  userDraft = "",
  additionalNotes = "",
}) => {
  const title = campaignTitle ? campaignTitle.trim() : "";
  const fullText = `${title} ${categoryName} ${userDraft} ${additionalNotes}`.toLowerCase();

  let beneficiary = extractBeneficiary(title);
  if (!beneficiary && userDraft) {
    beneficiary = extractBeneficiary(userDraft.slice(0, 100));
  }

  // Check animal first with word boundaries
  const isAnimal = /\b(dog|dogs|cat|cats|puppy|puppies|kitten|kittens|animal|animals|pet|pets|stray|strays|shelter|vet|veterinary|paws|canine|feline)\b/i.test(fullText);

  let subCategory = "general";
  let conditionOrTopic = "";

  if (isAnimal) {
    if (fullText.match(/\b(surgery|spine|fracture|wheelchair|amputation|injured|injury|trauma|leg|hit and run|accident)\b/i)) {
      subCategory = "animal_surgery";
      conditionOrTopic = fullText.includes("wheelchair")
        ? "Spine Surgery & Mobility Recovery"
        : fullText.includes("spine")
        ? "Spinal Surgery & Rehab"
        : "Emergency Veterinary Surgery";
    } else {
      subCategory = "animal_welfare";
      conditionOrTopic = "Animal Rescue, Shelter & Healthcare";
    }
  } else if (fullText.match(/\b(blood cancer|leukemia|lymphoma|cancer|tumor|chemo|chemotherapy|bone marrow|oncology|biopsy)\b/i)) {
    subCategory = "medical_oncology";
    conditionOrTopic = fullText.includes("leukemia")
      ? "Leukemia (Blood Cancer)"
      : fullText.includes("blood cancer")
      ? "Blood Cancer"
      : "Cancer Treatment";
  } else if (fullText.match(/\b(heart|cardiac|valve replacement|bypass|open heart|stent|angioplasty|heart attack)\b/i)) {
    subCategory = "medical_cardiac";
    conditionOrTopic = fullText.includes("valve")
      ? "Heart Valve Replacement Surgery"
      : fullText.includes("bypass")
      ? "Cardiac Bypass Surgery"
      : "Urgent Heart Surgery";
  } else if (fullText.match(/\b(kidney|renal|dialysis|kidney transplant|creatinine)\b/i)) {
    subCategory = "medical_renal";
    conditionOrTopic = fullText.includes("transplant")
      ? "Kidney Transplant"
      : "Urgent Renal Dialysis & Treatment";
  } else if (fullText.match(/\b(brain|stroke|spine|spinal|neuro|neurosurgery|hemorrhage|paralysis|coma)\b/i)) {
    subCategory = "medical_neuro";
    conditionOrTopic = fullText.includes("stroke")
      ? "Brain Stroke Recovery"
      : fullText.includes("spine")
      ? "Spine Surgery & Neuro Care"
      : "Neurosurgical Treatment";
  } else if (fullText.match(/\b(baby|infant|premature|preterm|nicu|incubator|pediatric)\b/i)) {
    subCategory = "medical_pediatric";
    conditionOrTopic = "Pediatric & NICU Critical Care";
  } else if (fullText.match(/\b(accident|highway|trauma|icu|fracture|burn|burns|critical condition|ventilator)\b/i)) {
    subCategory = "medical_trauma";
    conditionOrTopic = "Emergency Trauma & ICU Care";
  } else if (fullText.match(/\b(surgery|hospital|medical|doctor|treatment|clinic|medicine|illness|disease)\b/i)) {
    subCategory = "medical_general";
    conditionOrTopic = "Urgent Medical Treatment";
  } else if (fullText.match(/\b(college|engineering|b\.tech|mbbs|degree|master\x27s|masters|university|tuition|scholarship|semester)\b/i)) {
    subCategory = "education_higher";
    conditionOrTopic = fullText.includes("engineering")
      ? "Engineering College Education"
      : fullText.includes("mbbs")
      ? "Medical College Education"
      : "University Degree & Tuition";
  } else if (fullText.match(/\b(school|student|students|classroom|computer lab|library|books|study|learn|rural kids)\b/i)) {
    subCategory = "education_school";
    conditionOrTopic = "School Education & Digital Learning";
  } else if (fullText.match(/\b(water|borewell|drinking water|handpump|drought|well)\b/i)) {
    subCategory = "community_water";
    conditionOrTopic = "Clean Drinking Water Borewell Project";
  } else if (fullText.match(/\b(flood|fire|earthquake|storm|disaster|landslide|cyclone|rebuild)\b/i)) {
    subCategory = "disaster_rebuilding";
    conditionOrTopic = "Disaster Relief & Home Reconstruction";
  } else if (fullText.match(/\b(food|hunger|ration|blanket|homeless|elderly|orphanage)\b/i)) {
    subCategory = "community_welfare";
    conditionOrTopic = "Community Relief & Essential Supplies";
  } else if (fullText.match(/\b(sports|athlete|athletes|tournament|championship|boxing|cricket|olympic|training camp)\b/i)) {
    subCategory = "sports_athletic";
    conditionOrTopic = "National Championship & Athlete Training";
  } else if (fullText.match(/\b(funeral|memorial|loving memory|passed away|bereaved)\b/i)) {
    subCategory = "memorial_tribute";
    conditionOrTopic = "Memorial & Bereaved Family Support";
  } else if (fullText.match(/\b(film|art|music|book|documentary|app|startup|project)\b/i)) {
    subCategory = "creative_tech";
    conditionOrTopic = "Creative Project & Production";
  } else {
    subCategory = "general";
    conditionOrTopic = title || "Our Mission";
  }

  // Clean fallback beneficiary
  if (!beneficiary) {
    if (subCategory.startsWith("animal")) beneficiary = "our rescued companion";
    else if (subCategory.startsWith("medical")) beneficiary = "our loved one";
    else if (subCategory.startsWith("education")) beneficiary = "this deserving student";
    else if (subCategory.startsWith("community") || subCategory === "disaster_rebuilding") beneficiary = "our community";
    else beneficiary = "this important cause";
  }

  return { title, beneficiary, conditionOrTopic, subCategory };
};

/**
 * Builds an authentic, heading-tailored opening paragraph based on tone, variation, and target length.
 */
export const getIntroParagraph = ({
  tone = "heartfelt",
  lengthMode = 500,
  variationIndex = 0,
  effectiveTitle = "",
  effectiveAmount = "",
  beneficiary = "",
  conditionOrTopic = "",
}) => {
  const b = beneficiary || "our loved one";
  const c = conditionOrTopic || "this critical situation";
  const v = (variationIndex || 0) % 3;

  if (tone === "urgent") {
    if (v === 0) {
      if (lengthMode === 300) {
        return `We are reaching out in an urgent, time-sensitive moment where every single hour counts. We launched <strong>"${effectiveTitle}"</strong> with the goal of raising <strong>${effectiveAmount}</strong> to support ${b} through ${c}. We humbly ask for your immediate compassion, prayers, and financial support.`;
      } else if (lengthMode === 700) {
        return `We are reaching out to you today during one of the most critical and time-sensitive crossroads our family has ever encountered. Life often presents unexpected crises without warning, and right now, time is our most precious asset. We have launched this campaign, <strong>"${effectiveTitle}"</strong>, with a vital fundraising milestone of <strong>${effectiveAmount}</strong> to provide essential care for ${b} as we battle ${c}. Monumental obstacles cannot be overcome in isolation, which is why we are turning to the generosity of friends, family, and compassionate supporters to help us bridge this decisive gap before time runs out.`;
      } else {
        return `We are reaching out today in an urgent moment of need. Life can change in an instant, and right now, every single hour counts. We have launched <strong>"${effectiveTitle}"</strong> to raise <strong>${effectiveAmount}</strong> for ${b} to overcome ${c}. We cannot face this critical situation alone and humbly appeal for your immediate compassion and financial support.`;
      }
    } else if (v === 1) {
      if (lengthMode === 300) {
        return `A critical crossroads has arrived for ${b}, and immediate intervention is required. Through <strong>"${effectiveTitle}"</strong>, our goal is to secure <strong>${effectiveAmount}</strong> without delay to treat ${c}. Every moment matters, and your swift help brings life-saving relief.`;
      } else if (lengthMode === 700) {
        return `An urgent appeal is being made on behalf of ${b}, as we confront a high-stakes challenge that requires swift and decisive intervention. We cannot afford any delay in securing proper care for ${c}, which is why we initiated <strong>"${effectiveTitle}"</strong> to raise <strong>${effectiveAmount}</strong>. Every day that passes without reaching our milestone intensifies the pressure, yet knowing our community stands ready to assist gives us hope that we will overcome this challenge before time runs out.`;
      } else {
        return `Time is of the absolute essence for ${b}. We have initiated <strong>"${effectiveTitle}"</strong> with an urgent fundraising goal of <strong>${effectiveAmount}</strong> to directly confront ${c}. Without timely intervention, the road ahead becomes dangerously uncertain. We humbly ask for your prompt support today.`;
      }
    } else {
      if (lengthMode === 300) {
        return `Life has taken an unexpected, critical turn for ${b}. We launched <strong>"${effectiveTitle}"</strong> to gather <strong>${effectiveAmount}</strong> urgently for ${c}. We need your compassion and support today more than ever.`;
      } else if (lengthMode === 700) {
        return `Unforeseen emergencies have an abrupt way of shaking the foundations of everyday life. Today, our family finds itself in an urgent race against the clock to ensure ${b} receives necessary treatment for ${c}. By creating <strong>"${effectiveTitle}"</strong> with a vital goal of <strong>${effectiveAmount}</strong>, we are humbly asking our extended community to stand with us in solidarity during this decisive hour of need.`;
      } else {
        return `We are in a race against the clock to support ${b} through ${c}. Through <strong>"${effectiveTitle}"</strong>, we are fundraising <strong>${effectiveAmount}</strong> to cover urgent costs. Please stand with us in this crucial hour of need.`;
      }
    }
  } else if (tone === "inspiring") {
    if (v === 0) {
      if (lengthMode === 300) {
        return `Every meaningful journey begins with hope and community collaboration. We are excited to present <strong>"${effectiveTitle}"</strong> with a goal of <strong>${effectiveAmount}</strong> to support ${b} through ${c}. Together, we have a unique opportunity to create a lasting transformation.`;
      } else if (lengthMode === 700) {
        return `Every transformative movement in human history began with a dedicated community deciding to stand together for a meaningful cause. Today, we invite you to be an integral part of <strong>"${effectiveTitle}"</strong>. With a targeted milestone of <strong>${effectiveAmount}</strong>, this campaign is about more than raising funds—it is about restoring dignity, building long-term hope for ${b}, and demonstrating that collective kindness can turn adversity into an inspiring victory against ${c}.`;
      } else {
        return `Every great journey begins with hope and a community willing to stand together. We are thrilled to share our mission behind <strong>"${effectiveTitle}"</strong> to raise <strong>${effectiveAmount}</strong> for ${b}. By uniting our efforts against ${c}, we have a unique opportunity to create lasting, positive change.`;
      }
    } else if (v === 1) {
      if (lengthMode === 300) {
        return `Hope and collective kindness have the power to overcome any obstacle. We launched <strong>"${effectiveTitle}"</strong> to secure <strong>${effectiveAmount}</strong> for ${b}. Together, we can transform ${c} into a story of triumph.`;
      } else if (lengthMode === 700) {
        return `When compassionate individuals unite behind a shared vision, monumental hurdles turn into inspiring victories. We launched <strong>"${effectiveTitle}"</strong> with a milestone of <strong>${effectiveAmount}</strong> to champion ${b} through ${c}. Your involvement represents a vital thread in a tapestry of goodwill, showing that resilience and community support can light up even the darkest chapters of life.`;
      } else {
        return `Transformative change occurs when people unite behind someone who needs a helping hand. We launched <strong>"${effectiveTitle}"</strong> with a goal of <strong>${effectiveAmount}</strong> to support ${b} through ${c}. Together, we can write a story of hope and healing.`;
      }
    } else {
      if (lengthMode === 300) {
        return `Believing in positive change is where real impact begins. Join us in <strong>"${effectiveTitle}"</strong> as we raise <strong>${effectiveAmount}</strong> to empower ${b} and overcome ${c}.`;
      } else if (lengthMode === 700) {
        return `True empowerment begins when a community decides that no one has to face insurmountable hardships alone. Through <strong>"${effectiveTitle}"</strong>, our aim is to gather <strong>${effectiveAmount}</strong> to give ${b} the full support needed to conquer ${c}. Every contribution becomes an inspiring testament to human compassion and unity.`;
      } else {
        return `We invite you to be a part of an uplifting mission. Through <strong>"${effectiveTitle}"</strong>, we are raising <strong>${effectiveAmount}</strong> to help ${b} prevail over ${c}. Together, our collective kindness will make a profound, permanent difference.`;
      }
    }
  } else if (tone === "professional") {
    if (v === 0) {
      if (lengthMode === 300) {
        return `Welcome to the official campaign for <strong>"${effectiveTitle}"</strong>. We are fundraising <strong>${effectiveAmount}</strong> to address the critical requirements of ${c} for ${b} with complete fiscal transparency and accountability.`;
      } else if (lengthMode === 700) {
        return `Welcome to the official verified initiative for <strong>"${effectiveTitle}"</strong>. This campaign has been organized to secure <strong>${effectiveAmount}</strong> to address immediate operational and clinical requirements of ${c} for ${b} with complete fiscal transparency, scheduled milestone reporting, and direct stakeholder accountability. We invite community leaders, organizational partners, and benefactors to examine our plan and partner with us toward sustainable, measurable impact.`;
      } else {
        return `Welcome to the official fundraising initiative for <strong>"${effectiveTitle}"</strong>. We are initiating this campaign to raise <strong>${effectiveAmount}</strong> to address ${c} for ${b} with full transparency and direct community accountability. We invite supporters and advocates to review our plan and partner with us.`;
      }
    } else {
      if (lengthMode === 300) {
        return `We present <strong>"${effectiveTitle}"</strong> with a verified target of <strong>${effectiveAmount}</strong>. All resources are directly allocated to support ${b} through ${c} under rigorous oversight.`;
      } else if (lengthMode === 700) {
        return `This verified fundraising initiative, <strong>"${effectiveTitle}"</strong>, has been established with clear governance, verified itemized budgeting, and direct accountability to secure <strong>${effectiveAmount}</strong> for ${b} facing ${c}. We maintain strict fiscal oversight, ensuring every single allocation is documented with official receipts and milestone reports available to all donors.`;
      } else {
        return `This campaign, <strong>"${effectiveTitle}"</strong>, has been organized to secure <strong>${effectiveAmount}</strong> for ${b} in addressing ${c}. We are committed to structured execution, itemized expense management, and complete donor transparency at every phase.`;
      }
    }
  } else {
    // Default Heartfelt
    if (v === 0) {
      if (lengthMode === 300) {
        return `Thank you for taking a moment to read our story. Reaching out is vulnerable, but our campaign, <strong>"${effectiveTitle}"</strong>, represents hope in uncertainty. Our goal of <strong>${effectiveAmount}</strong> is essential to support ${b} through ${c}.`;
      } else if (lengthMode === 700) {
        return `Thank you from the bottom of our hearts for taking a few moments of your day to read our story. Writing this and asking for assistance is one of the most humbling and vulnerable experiences our family has ever faced, but our campaign, <strong>"${effectiveTitle}"</strong>, represents a lifeline of hope during a season of deep challenge. Our targeted goal of <strong>${effectiveAmount}</strong> is essential to securing the care and future ${b} is fighting for against ${c}, and having you alongside us means the world.`;
      } else {
        return `Thank you for taking a moment to read our story. Writing this is one of the most vulnerable things we have ever had to do, but we are reaching out with humble hearts. Our campaign, <strong>"${effectiveTitle}"</strong>, represents hope in a time of uncertainty, and our goal of <strong>${effectiveAmount}</strong> is essential to support ${b} through ${c}.`;
      }
    } else if (v === 1) {
      if (lengthMode === 300) {
        return `We write to you with humble hearts and sincere hope. Through <strong>"${effectiveTitle}"</strong>, we are raising <strong>${effectiveAmount}</strong> to help ${b} navigate ${c}. Your kindness gives us strength.`;
      } else if (lengthMode === 700) {
        return `Opening our hearts and sharing such a deeply personal trial is never easy, but when someone you love is facing ${c}, love overcomes fear. We established <strong>"${effectiveTitle}"</strong> to raise <strong>${effectiveAmount}</strong> for ${b}. Every supportive message, prayer, and donation reassures our family that we do not have to carry this heavy burden alone.`;
      } else {
        return `From the depths of our hearts, thank you for being here. Reaching out for assistance is difficult, but our campaign, <strong>"${effectiveTitle}"</strong>, is a ray of hope for ${b}. Raising <strong>${effectiveAmount}</strong> will allow us to face ${c} with courage and reassurance.`;
      }
    } else {
      if (lengthMode === 300) {
        return `During life’s most difficult chapters, kindness makes all the difference. We launched <strong>"${effectiveTitle}"</strong> with a goal of <strong>${effectiveAmount}</strong> to stand by ${b} through ${c}.`;
      } else if (lengthMode === 700) {
        return `When life presents challenges that feel insurmountable, the warmth of caring people becomes our greatest sanctuary. We created <strong>"${effectiveTitle}"</strong> to secure <strong>${effectiveAmount}</strong> to support ${b} in overcoming ${c}. Your empathy and generosity remind us that even amidst profound adversity, human compassion can restore light and healing.`;
      } else {
        return `In moments of hardship, community becomes our greatest anchor. Through <strong>"${effectiveTitle}"</strong>, we hope to raise <strong>${effectiveAmount}</strong> for ${b} as we confront ${c}. Your presence and support mean more than words can express.`;
      }
    }
  }
};

/**
 * Generates custom headings, deep narrative paragraphs, and tailored budget points
 * corresponding directly to the heading topic, beneficiary, and variation index.
 */
export const getCauseNarrativeAndBudget = ({
  subCategory = "general",
  beneficiary = "",
  conditionOrTopic = "",
  cleanTitle = "",
  lengthMode = 500,
  variationIndex = 0,
}) => {
  const b = beneficiary || "our loved one";
  const c = conditionOrTopic || "this critical challenge";
  const v = (variationIndex || 0) % 3;

  let heading = "";
  let paragraphs = [];
  let budgetHeading = "";
  let budgetPoints = [];
  let ctaHeading = "";

  switch (subCategory) {
    case "medical_oncology":
      if (v === 0) {
        heading = `<h3>${b}’s Battle Against ${c} & The Road Ahead</h3>`;
        paragraphs = [
          `<p>When the diagnosis of ${c} was confirmed, our world was turned completely upside down. ${b} has shown extraordinary courage facing continuous hospital admissions, painful biopsies, and exhausting cycles of chemotherapy, but the medical reality is overwhelming.</p>`,
          `<p>Oncologists have laid out a strict, uninterrupted treatment regimen to aggressively target the cancer cells. Any postponement or missed treatment session drastically reduces the chances of a complete remission. Between specialized chemotherapy medications, hospital bed isolation, regular blood platelet transfusions, and intensive clinician care, our family savings and personal reserves have been fully exhausted.</p>`,
          lengthMode === 700 ? `<p>Every single day in the oncology ward is a test of emotional and physical resilience. Yet, doctors remain optimistic that with timely clinical intervention and the full protocol completed, ${b} has a fighting chance at a complete, healthy life. We cannot fight this battle alone, and that is why we are humbly reaching out to our community.</p>` : ""
        ].filter(Boolean);
      } else if (v === 1) {
        heading = `<h3>The Critical Window: Why Immediate Action Is Vital for ${b}</h3>`;
        paragraphs = [
          `<p>Time is the most critical factor in our fight against ${c}. The oncology team treating ${b} has stressed that the coming weeks represent a decisive window where aggressive treatment can turn the tide.</p>`,
          `<p>However, the escalating financial burden of specialized cancer drugs, ICU monitoring, and supportive oncology care has brought us to a devastating standstill. We have stretched every resource to the limit, yet the projected costs to complete the required cycles remain beyond our reach without external support.</p>`,
          lengthMode === 700 ? `<p>Delaying ${b}’s scheduled therapies is simply not an option. Having guaranteed access to the necessary medications and medical team means ${b} can stay on track to beat this disease. Your immediate intervention bridges the financial gap at the exact moment it matters most.</p>` : ""
        ].filter(Boolean);
      } else {
        heading = `<h3>Standing Beside ${b}: Restoring Hope in the Fight Against Cancer</h3>`;
        paragraphs = [
          `<p>Cancer is an unforgiving adversary, but the power of community, compassion, and collective kindness is stronger. Today, we are rallying around ${b} to ensure that financial hardship never stands between a loved one and life-saving cancer care.</p>`,
          `<p>Throughout this painful journey with ${c}, ${b} has maintained an inspiring spirit, reminding all of us of the beauty of hope. By uniting our efforts and resources, we can ensure that every required dose of chemotherapy, every blood transfusion, and every clinical consultation is fully covered without delay.</p>`,
          lengthMode === 700 ? `<p>Your support does far more than pay medical bills—it lifts an immense emotional weight off our family’s shoulders and surrounds ${b} with a circle of care and strength. Together, we can transform this difficult chapter into an inspiring victory of survival and healing.</p>` : ""
        ].filter(Boolean);
      }

      budgetHeading = `<h3>Transparent Fund Allocation for ${b}’s Oncology Protocol</h3>`;
      budgetPoints = [
        `<strong>Chemotherapy & Targeted Oncology Infusions:</strong> Securing specialized chemotherapy drugs, immunotherapy infusions, and clinical administration.`,
        `<strong>Inpatient Hospitalization & Isolation Ward:</strong> Covering sterile isolation room charges, nursing care, and continuous vital monitoring during intensive cycles.`,
        `<strong>Blood & Platelet Transfusions:</strong> Funding necessary hematology screenings, donor cross-matching, and urgent platelet support units.`,
        `<strong>Diagnostic Scans & Pathology Panels:</strong> Regular bone marrow evaluations, PET/CT scans, and complete blood count (CBC) panels.`,
        `<strong>Emergency Medical & Infection Contingency:</strong> Protecting against unexpected clinical complications, sterile home-care kits, and extended intensive care.`,
      ];
      ctaHeading = `<h3>How You Can Stand with ${b} Today</h3>`;
      break;

    case "medical_cardiac":
      if (v === 0) {
        heading = `<h3>${b}’s Urgent Heart Journey: The Road to Surgical Recovery</h3>`;
        paragraphs = [
          `<p>The cardiovascular system allows no room for hesitation. Following detailed clinical screenings and consultations with cardiologists, ${b} was advised to undergo ${c} as an urgent, life-saving necessity.</p>`,
          `<p>Every single day that passes puts immense strain on ${b}’s vital organs. The surgical team is fully prepared and confident that timely intervention will restore normal function and grant ${b} many more healthy years. However, the comprehensive costs—encompassing specialized cardiac implants, operating theater fees, and intensive cardiac care unit (CCU) monitoring—exceed our personal savings.</p>`,
          lengthMode === 700 ? `<p>Facing open-heart surgical intervention is emotionally overwhelming for any family, but witnessing ${b} struggle with chest discomfort and exhaustion makes our determination stronger. We are placing our faith in the generosity of compassionate individuals to help us meet the hospital deposit requirements.</p>` : ""
        ].filter(Boolean);
      } else {
        heading = `<h3>A Lifeline for ${b}: Restoring Heart Health and Strength</h3>`;
        paragraphs = [
          `<p>When someone you love experiences severe cardiac illness, every heartbeat becomes precious. We have reached a decisive crossroads where ${c} offers ${b} the only safe path forward toward recovery.</p>`,
          `<p>Our personal resources and family borrowings have been channeled into initial ICU stabilization, angiograms, and daily medication. Now, with the main surgical milestone ahead, we need community support to bridge the funding gap and ensure the procedure takes place without postponement.</p>`,
          lengthMode === 700 ? `<p>With timely surgery and proper post-operative cardiac rehabilitation, the prognosis is exceptionally bright. Your financial contribution directly funds the surgical intervention that will save ${b}’s life.</p>` : ""
        ].filter(Boolean);
      }

      budgetHeading = `<h3>Itemized Allocation for ${b}’s Cardiac Surgery</h3>`;
      budgetPoints = [
        `<strong>Specialized Cardiac Surgery & Surgeon Fees:</strong> Operating room procedures, perfusionist fees, and surgical team charges.`,
        `<strong>Cardiac CCU & Inpatient Hospitalization:</strong> Intensive monitoring, bedside telemetry, and post-operative recovery ward fees.`,
        `<strong>Cardiac Implants & Medical Consumables:</strong> Heart valve/stent hardware, specialized sutures, and cardiopulmonary supplies.`,
        `<strong>Diagnostic Angiography & Echocardiograms:</strong> Comprehensive pre-operative imaging, laboratory panels, and regular blood tests.`,
        `<strong>Post-Surgical Cardiac Rehabilitation & Medication:</strong> Blood thinners, cardiac therapies, and specialized follow-up consultations.`,
      ];
      ctaHeading = `<h3>How You Can Save ${b}’s Heart Today</h3>`;
      break;

    case "medical_renal":
      heading = `<h3>${b}’s Fight Against Kidney Failure & The Road to Recovery</h3>`;
      paragraphs = [
        `<p>Living with advanced kidney failure requires unimaginable endurance. ${b} has spent countless hours hooked to dialysis machines, battling extreme exhaustion, fluid restrictions, and dangerous creatinine spikes.</p>`,
        `<p>Nephrologists have concluded that ${c} is the definitive solution to restore health and prevent organ shutdown. While dialysis provides a temporary lifeline, it places a heavy toll on the body and personal finances over time. Securing this procedure means giving ${b} a genuine second chance at life.</p>`,
        lengthMode === 700 ? `<p>The financial requirements for pre-transplant cross-matching, donor tissue workups, high-dependency surgical wards, and immunosuppressive therapies are extensive. With your compassionate backing, we can cross this final bridge.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Allocation for ${b}’s Renal Care</h3>`;
      budgetPoints = [
        `<strong>Kidney Transplant Surgery & Operating Theater:</strong> Surgical team charges, organ recovery logistics, and anesthesia.`,
        `<strong>Pre-Operative Hemodialysis Cycles:</strong> Uninterrupted dialysis access, catheter maintenance, and renal medication.`,
        `<strong>HLA Tissue Matching & Cross-Match Panels:</strong> Comprehensive donor-recipient immunology screening and antibody testing.`,
        `<strong>Post-Transplant Immunosuppressive Therapy:</strong> Anti-rejection prescription therapies and clinical infection control.`,
        `<strong>Nephrology ICU Inpatient Recovery:</strong> Sterile isolation bed fees and daily biochemical monitoring panels.`,
      ];
      ctaHeading = `<h3>How You Can Stand With ${b} Today</h3>`;
      break;

    case "medical_neuro":
      heading = `<h3>${b}’s Neurological Recovery: Fighting for Every Step Forward</h3>`;
      paragraphs = [
        `<p>The nervous system governs every thought, movement, and breath. When ${b} suffered from ${c}, our family was thrown into a terrifying fight against time to preserve mobility and cognitive function.</p>`,
        `<p>The neurosurgical team has emphasized that immediate surgical decompression and continuous neuro-ICU monitoring are vital to prevent permanent nerve damage. Every single hour counts when it comes to brain and spinal trauma recovery, and having guaranteed medical resources ensures uninterrupted intensive care.</p>`,
        lengthMode === 700 ? `<p>Rehabilitation will require patience and consistent physical therapy, but the first and most critical milestone is securing the surgery and stabilizing ${b}’s neurological vitals. Your support directly powers this life-saving intervention.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Fund Allocation for Neurosurgical Care</h3>`;
      budgetPoints = [
        `<strong>Neurosurgical Procedures & Operating Room:</strong> Complex neuro-decompression surgery, neurosurgeon fees, and anesthesia.`,
        `<strong>Neuro-ICU Critical Monitoring:</strong> Ventilator support, intracranial pressure monitoring, and specialized nursing care.`,
        `<strong>High-Resolution MRI, CT Scans & Diagnostics:</strong> Frequent neural imaging, electroencephalograms, and pathology panels.`,
        `<strong>Neuro-Rehabilitation & Physiotherapy:</strong> Dedicated physical therapy, speech rehabilitation, and mobility recovery aids.`,
        `<strong>Post-Operative Neurological Medications:</strong> Anti-edema drugs, anticonvulsants, and nerve regeneration therapies.`,
      ];
      ctaHeading = `<h3>How You Can Support ${b}’s Recovery</h3>`;
      break;

    case "medical_pediatric":
      heading = `<h3>Fighting for Little ${b}: The Critical Pediatric Journey</h3>`;
      paragraphs = [
        `<p>No parent should ever have to see their little baby fighting for life in a sterile intensive care unit. ${b} was brought into this world facing critical medical complications, and every single day in the pediatric ICU is a brave battle for survival.</p>`,
        `<p>The pediatric specialists and neonatologists caring for ${b} are optimistic that with uninterrupted incubator care, advanced respiratory support, and timely clinical intervention, ${b} will grow strong and healthy. However, the daily costs of pediatric intensive care have completely exhausted our savings.</p>`,
        lengthMode === 700 ? `<p>Seeing tiny ${b} surrounded by medical monitors breaks our hearts, yet their resilience inspires us to keep fighting. We are pleading for the warmth and generosity of compassionate hearts to help us cover the hospital bills and bring our baby home safely.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Fund Allocation for Baby ${b}’s ICU Care</h3>`;
      budgetPoints = [
        `<strong>Pediatric ICU & Incubator Care:</strong> Daily sterile intensive care bed charges, oxygen support, and phototherapy.`,
        `<strong>Pediatric Specialist & Clinician Fees:</strong> Round-the-clock neonatology oversight, consultations, and intensive nursing.`,
        `<strong>Diagnostic Panels & Infant Monitoring:</strong> Arterial blood gas tests, pediatric ultrasound scans, and infection screenings.`,
        `<strong>Specialized Infant Medications & Nutrition:</strong> Total parenteral nutrition (TPN), IV antibiotics, and vital infant therapies.`,
        `<strong>Pediatric Emergency Buffer:</strong> Guarding against unexpected clinical complications or extended hospital stay.`,
      ];
      ctaHeading = `<h3>How You Can Help Baby ${b} Survive & Thrive</h3>`;
      break;

    case "medical_trauma":
      heading = `<h3>The Unforeseen Crisis: ${b}’s Urgent Fight for Recovery</h3>`;
      paragraphs = [
        `<p>Trauma arrives without warning, shattering everyday normalcy in a fraction of a second. Following this severe emergency, ${b} was rushed to the hospital in critical condition requiring emergency surgical stabilization.</p>`,
        `<p>Between multi-stage surgical procedures, orthopedic implants, blood transfusions, and intensive care monitoring, the financial burden has rapidly outpaced our ability to cope. Doctors have emphasized that uninterrupted clinical care during this acute trauma phase is the key to preventing permanent disability and ensuring complete recovery.</p>`,
        lengthMode === 700 ? `<p>Our family has pooled together every rupee we could muster, but the mounting hospital bills threaten to stall ongoing care. Your immediate generosity bridges this critical gap and helps ${b} pull through this traumatic chapter.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Allocation for Emergency Trauma Care</h3>`;
      budgetPoints = [
        `<strong>Emergency Trauma Surgeries & Surgical Implants:</strong> Complex orthopedic/trauma surgery, orthopedic plating, and theater charges.`,
        `<strong>ICU Critical Care & Ventilator Monitoring:</strong> High-dependency inpatient stay, respiratory support, and vital tracking.`,
        `<strong>Blood Units & Diagnostic Radiology:</strong> Multiple units of cross-matched blood, full-body CT scans, and X-rays.`,
        `<strong>Wound Care & Prescription Medications:</strong> Intensive antibiotic therapy, surgical dressings, and pain management.`,
        `<strong>Post-Trauma Rehabilitation & Physiotherapy:</strong> Mobility aids, physical therapy sessions, and recovery logistics.`,
      ];
      ctaHeading = `<h3>How You Can Stand With ${b} Right Now</h3>`;
      break;

    case "animal_surgery":
      heading = `<h3>${b}’s Fighting Chance: From Pain to Life-Saving Surgery</h3>`;
      paragraphs = [
        `<p>Animals love unconditionally, yet they suffer in silence when severe accidents and spinal or bone trauma strike. ${b} was found in agonizing distress, unable to move freely, yet wagging their tail and looking up with eyes full of trust and hope.</p>`,
        `<p>Veterinary surgeons have evaluated ${b} and confirmed that prompt ${c} will relieve agonizing nerve pain, stabilize the trauma, and restore mobility. Without this surgery, ${b} faces permanent paralysis and severe medical complications. We refuse to abandon this innocent soul when a full recovery is completely achievable with proper clinical intervention.</p>`,
        lengthMode === 700 ? `<p>From advanced veterinary X-rays and surgical implants to specialized canine wheelchairs, physical therapy, and loving foster recovery, we are providing every ounce of care possible. Your support directly funds the medical procedures that will allow ${b} to run, play, and live a joyful life.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Allocation for ${b}’s Veterinary Surgery</h3>`;
      budgetPoints = [
        `<strong>Specialized Veterinary Neuro/Orthopedic Surgery:</strong> Surgeon fees, anesthesia, operating theater charges, and surgical implants.`,
        `<strong>Diagnostic Imaging & Pre-Operative Blood Work:</strong> Spinal/orthopedic X-rays, ultrasound diagnostics, and biochemical panels.`,
        `<strong>Custom Mobility Wheelchair & Rehab Cart:</strong> Ergonomic rehabilitation cart to assist with walking and nerve recovery.`,
        `<strong>Post-Operative Veterinary Foster & Medications:</strong> Anti-inflammatories, nerve supplements, sterile dressings, and antibiotics.`,
        `<strong>High-Grade Recovery Nutrition & Orthopedic Bedding:</strong> Nutritious recovery meals and clean, padded convalescent bedding.`,
      ];
      ctaHeading = `<h3>How You Can Give ${b} a Second Chance at Life</h3>`;
      break;

    case "animal_welfare":
      heading = `<h3>A Voice for the Voiceless: Dedicated Care for ${b}</h3>`;
      paragraphs = [
        `<p>Every street animal deserves a life free from hunger, abuse, and untreated sickness. Through this initiative, we are mobilizing on the front lines to provide rescue, shelter, medical treatment, and nourishment for ${b}.</p>`,
        `<p>Every single day, innocent animals face severe hardships—from hit-and-run injuries and contagious infections to freezing winters and scorching heatwaves. By organizing regular sterilization drives, rabies vaccinations, emergency rescue transit, and daily nutritious feeding, we are systematically reducing suffering and building a compassionate environment.</p>`,
        lengthMode === 700 ? `<p>We operate with complete dedication, ensuring that every wounded stray receives professional veterinary attention and loving foster care until they are healthy enough for adoption or safe release. Your donation translates directly into filled food bowls, life-saving medicines, and warm, secure shelters.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Fund Allocation for Animal Welfare</h3>`;
      budgetPoints = [
        `<strong>Emergency Rescue Ambulance & Transport Logistics:</strong> Fuel and safe transit to veterinary clinics and shelters.`,
        `<strong>Animal Birth Control (ABC) & Rabies Vaccinations:</strong> Humane sterilization surgeries and life-saving immunization doses.`,
        `<strong>Daily Wholesome Food & Clean Water Supplies:</strong> High-protein dog/cat food, grains, and clean community feeding bowls.`,
        `<strong>Veterinary Medicines, Wound Sprays & Anti-Parasitics:</strong> First-aid kits, tick/flea treatments, and prescription antibiotics.`,
        `<strong>Shelter Maintenance & Weather-Proof Bedding:</strong> Kennel repairs, waterproof tarpaulins, and warm winter bedding.`,
      ];
      ctaHeading = `<h3>How You Can Champion ${b} Today</h3>`;
      break;

    case "education_higher":
      heading = `<h3>Unlocking ${b}’s Future: Overcoming the Final Tuition Barrier</h3>`;
      paragraphs = [
        `<p>Education is the greatest equalizer, opening doors that would otherwise remain firmly shut. ${b} has worked tirelessly, burning the midnight oil and overcoming immense socio-economic hurdles to secure admission and excel in their studies.</p>`,
        `<p>Now, at the most critical juncture of their academic degree, an unexpected financial roadblock threatens to derail years of sacrifice and hard work. Without timely payment of college semester fees, ${b} risks losing student enrollment and being barred from final examinations. A single semester fee should never be the barrier that extinguishes raw talent and academic dreams.</p>`,
        lengthMode === 700 ? `<p>By supporting ${b}, you are doing far more than clearing a tuition bill—you are investing in a future engineer, doctor, or leader who will uplift their family and contribute meaningfully to society for decades to come. Your kindness ensures that focused academic learning continues uninterrupted.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Itemization for ${b}’s Academic Fees</h3>`;
      budgetPoints = [
        `<strong>Semester Tuition Fees & University Registration:</strong> Direct institutional tuition payment to maintain active student enrollment.`,
        `<strong>Textbooks, Research Materials & Courseware:</strong> Required academic reference books, digital library licenses, and journals.`,
        `<strong>Academic Hardware & Computational Tools:</strong> Essential study laptop, specialized software tools, and laboratory access.`,
        `<strong>Modest Student Housing & Living Stipend:</strong> Safe hostel accommodation and basic living essentials to enable undivided focus.`,
        `<strong>Examination & Graduation Certification Fees:</strong> Clearing official exam registration and degree certification charges.`,
      ];
      ctaHeading = `<h3>How You Can Empower ${b}’s Academic Dream</h3>`;
      break;

    case "education_school":
      heading = `<h3>Empowering Young Minds: Modern Learning for ${b}</h3>`;
      paragraphs = [
        `<p>Every child, regardless of economic background, deserves access to quality education, modern digital tools, and an inspiring learning environment. Through this initiative, we are working to transform educational opportunities for ${b}.</p>`,
        `<p>In many underprivileged schools and rural communities, students lack basic learning resources—studying without computers, science kits, desks, or even sufficient textbooks. By providing modern educational infrastructure, digital computer labs, and comprehensive stationery kits, we bridge the learning divide and ignite a lifelong passion for knowledge.</p>`,
        lengthMode === 700 ? `<p>Education breaks the cycle of generational poverty. With your support, we can equip classrooms with interactive learning tools and ensure that bright young minds are prepared to thrive in the modern world. Together, we can build a strong foundation for their future.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Fund Allocation for Educational Infrastructure</h3>`;
      budgetPoints = [
        `<strong>Computer Workstations & Digital Learning Tablets:</strong> Refurbished and new computers equipped with educational software.`,
        `<strong>Science Laboratory & Hands-On Experiment Kits:</strong> Interactive STEM learning kits, microscopes, and classroom models.`,
        `<strong>Classroom Desks, Whiteboards & Solar Backup:</strong> Ergonomic benches, clean writing boards, and solar power backup.`,
        `<strong>Textbooks, Notebooks & Stationery Packs:</strong> Complete annual learning packages distributed directly to deserving students.`,
        `<strong>Teacher Training & Multi-Year Hardware Maintenance:</strong> Training local educators and maintaining digital hardware reliability.`,
      ];
      ctaHeading = `<h3>How You Can Support ${b} Today</h3>`;
      break;

    case "community_water":
      heading = `<h3>Quenching Thirst: The Clean Drinking Water Lifeline for ${b}</h3>`;
      paragraphs = [
        `<p>Access to safe, clean drinking water is a fundamental human right, yet for ${b}, every single sunrise begins with a grueling struggle against thirst and waterborne contamination.</p>`,
        `<p>Women and children often walk several kilometers under scorching temperatures every morning just to fetch muddy water from seasonal pits. This chronic crisis not only triggers frequent waterborne illnesses but also robs children of school hours and keeps entire communities trapped in hardship. Installing a deep, solar-powered borewell project brings a permanent, reliable source of safe water directly to their doorstep.</p>`,
        lengthMode === 700 ? `<p>Our engineering plan incorporates hydro-geological aquifer surveys, deep drilling down to pure groundwater tables, solar submersible pumping, and community multi-tap distribution stations. Your contribution directly funds permanent, clean water that will sustain hundreds of lives for decades.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Itemized Engineering Budget for ${b}’s Water Project</h3>`;
      budgetPoints = [
        `<strong>Hydro-Geological Survey & Deep Borewell Drilling:</strong> Industrial rig machinery drilling to reach deep, perennial clean aquifers.`,
        `<strong>Solar Submersible Water Pump & Inverter System:</strong> Heavy-duty solar photovoltaic panels and pump operating with zero power costs.`,
        `<strong>Multi-Stage Water Filtration & Storage Reservoirs:</strong> Industrial-grade filtration units and 10,000-liter clean water storage tanks.`,
        `<strong>Community Distribution Pipelines & Tap Stands:</strong> Direct piping network connecting storage reservoirs to accessible village points.`,
        `<strong>Community Water Committee Training & Maintenance:</strong> Training local youth for pump upkeep and stocking spare replacement parts.`,
      ];
      ctaHeading = `<h3>How You Can Gift Clean Water to ${b} Today</h3>`;
      break;

    case "disaster_rebuilding":
      heading = `<h3>Rising from the Ruins: Rebuilding Home & Hope for ${b}</h3>`;
      paragraphs = [
        `<p>When natural calamity struck without warning, ${b} lost their home, belongings, and years of hard-earned security in a single day. Facing the harsh weather in temporary shelters has tested their resilience to the limit.</p>`,
        `<p>We refuse to let our affected neighbors suffer in despair. Through this emergency initiative, we are mobilizing to provide immediate relief and rebuild durable, weather-proof housing that restores safety, warmth, and dignity. Rebuilding brick by brick requires collective community solidarity.</p>`,
        lengthMode === 700 ? `<p>From immediate dry food rations and emergency waterproof tarpaulins to structural masonry, roof trusses, and safe electrical restoration, every contribution directly rebuilds a secure home. Your kindness proves that no family has to stand alone amidst disaster.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Allocation for Disaster Reconstruction</h3>`;
      budgetPoints = [
        `<strong>Emergency Immediate Relief & Waterproof Tarpaulins:</strong> High-grade rain shelters, hygiene supplies, and dry food rations.`,
        `<strong>Structural Building Materials & Masonry:</strong> Bricks, cement, reinforced steel rods, and weather-proof roofing sheets.`,
        `<strong>Plumbing, Safe Sanitation & Drinking Water Setup:</strong> Restoring clean water pipes, toilet facilities, and basic drainage.`,
        `<strong>Essential Household Furnishings & Cookware:</strong> Basic beds, cooking gas stoves, and essential household utility items.`,
        `<strong>Disaster Resilience & Contingency Buffer:</strong> Reinforcing foundations against future seasonal flooding or storms.`,
      ];
      ctaHeading = `<h3>How You Can Help ${b} Rebuild Today</h3>`;
      break;

    case "sports_athletic":
      heading = `<h3>Chasing the Gold: Fueling ${b}’s Championship Dream</h3>`;
      paragraphs = [
        `<p>Behind every champion lies countless hours of silent sacrifice, 5 AM training sessions, and fierce determination. ${b} has earned the right to compete at the highest level through sheer grit and athletic excellence.</p>`,
        `<p>Yet, talent alone cannot overcome the financial barriers of national and international competition. Tournament entry fees, official registrations, airfare, sports nutrition, and professional athletic equipment create an immense financial burden that threatens to halt ${b}’s journey at the doorstep of victory.</p>`,
        lengthMode === 700 ? `<p>By supporting ${b}, you are not just funding travel expenses—you are putting a determined athlete on the podium and showing that financial constraints should never extinguish sporting brilliance. Let us stand united behind ${b} as they represent our community with pride.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Itemized Allocation for ${b}’s Championship Campaign</h3>`;
      budgetPoints = [
        `<strong>Official Championship Entry Fees & Registration:</strong> Clearing international/national federation registration fees.`,
        `<strong>Air Travel, Visa Clearances & Safe Accommodation:</strong> Safe tournament travel logistics and accommodation near the competition venue.`,
        `<strong>Professional High-Performance Sports Gear:</strong> Specialized athletic footwear, competitive equipment, and protective gear.`,
        `<strong>Sports Nutrition, Physiotherapy & Recovery:</strong> High-protein athletic dietary requirements, physio support, and injury prevention.`,
        `<strong>Intensive Pre-Tournament Coaching & Training Camps:</strong> Specialized coaching sessions and high-altitude preparatory camps.`,
      ];
      ctaHeading = `<h3>How You Can Champion ${b}’s Victory Today</h3>`;
      break;

    case "memorial_tribute":
      heading = `<h3>In Loving Memory: Honoring the Life and Legacy of ${b}</h3>`;
      paragraphs = [
        `<p>The sudden loss of ${b} has left a void in our hearts that words can never fully capture. In this moment of profound grief, we reflect on a life defined by warmth, generosity, and quiet strength.</p>`,
        `<p>Alongside the heartbreaking emotional grief, the family faces immediate funeral arrangements, outstanding medical bills, and sudden financial uncertainty. This memorial fund has been created to honor ${b}’s legacy with dignity and wrap the bereaved family in compassionate support during their darkest season.</p>`,
        lengthMode === 700 ? `<p>Your support ensures that final arrangements are carried out respectfully and provides a cushion of security for the grieving family as they navigate the difficult months ahead. We are deeply grateful for every memory shared, prayer offered, and contribution made.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Fund Allocation for Memorial Support</h3>`;
      budgetPoints = [
        `<strong>Funeral, Memorial Service & Resting Rites:</strong> Dignified memorial ceremony, resting arrangements, and chapel services.`,
        `<strong>Immediate Household Living Assistance:</strong> Providing basic living sustenance for the grieving family during this transition.`,
        `<strong>Settlement of Outstanding End-of-Life Medical Bills:</strong> Clearing hospital invoices and clinical expenses incurred during final care.`,
        `<strong>Educational Security for Surviving Children:</strong> Protecting the uninterrupted schooling of dependent family members.`,
        `<strong>Memorial Legacy & Family Stabilization Buffer:</strong> Establishing an emergency stability fund for the immediate household.`,
      ];
      ctaHeading = `<h3>How You Can Honor ${b} Today</h3>`;
      break;

    case "creative_tech":
      heading = `<h3>Bringing the Vision to Life: The Mission Behind ${cleanTitle}</h3>`;
      paragraphs = [
        `<p>Every great creative and technological breakthrough begins with an ambitious idea and the courage to bring something meaningful into the world. Through this initiative, we are dedicating our skills to create lasting cultural and technological value.</p>`,
        `<p>After months of pre-production, prototyping, and tireless development, we have arrived at the decisive phase where external backing is required to finalize production, license professional tools, and bring this project to the public. Crowdfunding allows us to retain creative independence and deliver something truly exceptional.</p>`,
        lengthMode === 700 ? `<p>We are committed to absolute transparency, regular milestone updates, and recognizing every supporter as a vital partner in our creative journey. Your contribution directly funds the production resources necessary to turn this vision into reality.</p>` : ""
      ].filter(Boolean);
      budgetHeading = `<h3>Transparent Production Budget for ${cleanTitle}</h3>`;
      budgetPoints = [
        `<strong>Core Production Hardware & Specialized Software:</strong> Essential equipment, development licenses, and studio infrastructure.`,
        `<strong>Studio Time, Filming & Technical Operations:</strong> Dedicated recording, field production, and engineering hours.`,
        `<strong>Post-Production, Mastering & Color Grading:</strong> Professional editing, audio mastering, and final asset preparation.`,
        `<strong>Community Outreach, Exhibition & Distribution:</strong> Marketing, festival submissions, and public premiere access.`,
        `<strong>Project Contingency & Independent Delivery Buffer:</strong> Guarding against unexpected logistical costs to guarantee delivery.`,
      ];
      ctaHeading = `<h3>How You Can Support This Vision Today</h3>`;
      break;

    default:
      if (v === 0) {
        heading = `<h3>Why ${cleanTitle} Matters: The Vision & Urgent Need</h3>`;
        paragraphs = [
          `<p>Every meaningful endeavor begins with a committed heart and the conviction that positive change is possible. When challenges arise that surpass individual capacity, community collaboration becomes the bridge to real solutions.</p>`,
          `<p>We have poured our passion, energy, and personal savings into supporting ${b}, and now we need your partnership to carry it across the finish line with complete transparency. Every contribution will be carefully managed and allocated directly toward making an immediate, tangible difference.</p>`,
          lengthMode === 700 ? `<p>Together, we have the opportunity to turn this shared vision into lasting, positive transformation for everyone involved. Having you alongside us in this mission gives us the strength to keep pressing forward with optimism and purpose.</p>` : ""
        ].filter(Boolean);
      } else if (v === 1) {
        heading = `<h3>The Critical Window: Making ${cleanTitle} a Reality</h3>`;
        paragraphs = [
          `<p>A critical milestone has arrived where immediate community support will decide our ability to move forward. We are facing a vital gap that requires prompt intervention.</p>`,
          `<p>By uniting behind ${b}, we can ensure that every operational requirement is fulfilled without delay. Transparency and efficiency are our core commitments, and we pledge to honor every contribution with complete stewardship.</p>`,
          lengthMode === 700 ? `<p>No milestone is achieved in isolation. Your participation provides more than financial relief—it sends an empowering message that we are united in turning adversity into meaningful impact.</p>` : ""
        ].filter(Boolean);
      } else {
        heading = `<h3>A Community Alliance: Standing Behind ${cleanTitle}</h3>`;
        paragraphs = [
          `<p>True community strength is measured by how we show up for one another in times of need. Today, we are rallying support for ${b} to ensure that this mission achieves its fullest potential.</p>`,
          `<p>Every single gesture of kindness brings us one step closer to our goal. With full transparency, documented progress, and heartfelt gratitude, we invite you to be a cornerstone of this journey.</p>`,
          lengthMode === 700 ? `<p>We are profoundly touched by everyone who takes the time to read, share, and support our cause. Together, we can turn this vision into a resounding victory.</p>` : ""
        ].filter(Boolean);
      }

      budgetHeading = `<h3>How Your Donations Will Be Allocated</h3>`;
      budgetPoints = [
        `<strong>Primary Operational Direct Costs:</strong> Securing the fundamental supplies and services needed to execute the project.`,
        `<strong>Logistics, Materials & Safety:</strong> Ensuring all regulatory, transportation, and safety measures are met.`,
        `<strong>Milestone Completion Buffer:</strong> Guarding against unexpected price fluctuations or delays to guarantee completion.`,
        `<strong>Community Outreach & Coordination:</strong> Managing field logistics and direct beneficiary support.`,
        `<strong>Accountability & Reporting:</strong> Providing regular photographic updates and verified documentation.`,
      ];
      ctaHeading = `<h3>How You Can Stand With ${b} Today</h3>`;
      break;
  }

  return { heading, paragraphs, budgetHeading, budgetPoints, ctaHeading };
};

/**
 * Intelligent client-side narrative generator that produces a strictly word-calibrated
 * campaign story (300, 500, or 700 words) with proper HTML tags (h3, p, ul, li).
 * Deeply integrates the campaign title, beneficiary, condition, tone, and variation index.
 */
export const generateExpandedStory = ({
  userDraft = "",
  campaignTitle = "",
  categoryName = "",
  targetAmount = "",
  organizerName = "",
  country = null,
  tone = "heartfelt", // heartfelt, urgent, inspiring, professional
  targetLength = 500,
  additionalNotes = "",
  variationIndex = 0,
}) => {
  const currencyInfo = resolveCountryCurrency(country);
  const plainDraftRaw = stripHtml(userDraft).trim();
  const plainDraft = sanitizeMonetaryAmounts(plainDraftRaw, currencyInfo);

  // Normalize targetLength to supported targets (300, 500, 700)
  const lengthMode = targetLength <= 350 ? 300 : targetLength >= 650 ? 700 : 500;
  const vIndex = (variationIndex || 0) % 3;

  // Semantic parsing of the campaign title
  const context = parseCampaignContext({
    campaignTitle,
    categoryName,
    userDraft: plainDraft,
    additionalNotes,
  });

  const { beneficiary, conditionOrTopic, subCategory } = context;
  const effectiveTitle = campaignTitle?.trim() || (plainDraft.length > 0 ? plainDraft.slice(0, 50) + "..." : "Our Fundraising Campaign");
  const effectiveAmount = targetAmount
    ? formatCurrencyAmount(targetAmount, currencyInfo)
    : "our target goal";
  const author = organizerName?.trim() || "our team";

  // 1. Dynamic Intro tailored to title, beneficiary, tone, length, and variation
  const intro = getIntroParagraph({
    tone,
    lengthMode,
    variationIndex: vIndex,
    effectiveTitle,
    effectiveAmount,
    beneficiary,
    conditionOrTopic,
  });

  // 2. Core User Draft Integration
  const userCoreLimit = lengthMode === 300 ? 50 : lengthMode === 700 ? 110 : 80;
  const userCoreText = extractUserCoreContext(plainDraft, userCoreLimit);

  let coreParagraph = "";
  if (userCoreText && userCoreText.length > 5) {
    if (lengthMode === 300) {
      coreParagraph = `<p>${userCoreText}</p>`;
    } else if (lengthMode === 700) {
      coreParagraph = `
        <p>${userCoreText}</p>
        <p>Over the past weeks and months, navigating this situation has tested our emotional, physical, and financial resilience. Every single day brings new hurdles, and the mounting expenses continue to outpace what our personal resources and family support can bear.</p>
        <p>We have explored every possible alternative, yet we find ourselves facing an urgent gap. This is why we are reaching out directly to the community—because collective compassion can turn an impossible struggle into an inspiring victory for ${beneficiary}.</p>
      `;
    } else {
      coreParagraph = `
        <p>${userCoreText}</p>
        <p>As you can see, this challenge has placed an immense emotional and financial strain on everyone involved. What started as an unexpected circumstance has now grown into a hurdle that exceeds what our personal savings can manage on our own.</p>
      `;
    }
  } else {
    if (lengthMode === 300) {
      coreParagraph = `<p>We are facing a vital challenge that requires immediate intervention. The funds gathered through this platform will bridge the decisive gap between where we are today and a secure, healthy future for ${beneficiary}.</p>`;
    } else if (lengthMode === 700) {
      coreParagraph = `
        <p>We are facing a vital challenge that requires immediate intervention and dedicated community stewardship. The unforeseen nature of this crisis has exhausted our existing reserves, leaving us with a critical funding deficit that threatens our progress.</p>
        <p>Every milestone achieved through this platform brings tangible relief and bridges the gap between where we are today and the secure future we are tirelessly striving toward for ${beneficiary}.</p>
      `;
    } else {
      coreParagraph = `<p>We are facing a vital challenge that requires immediate intervention. The funds gathered through this platform will bridge the gap between where we are today and the secure future we are tirelessly striving toward for ${beneficiary}.</p>`;
    }
  }

  // 3. Dynamic Narrative & Tailored Budget
  const causeData = getCauseNarrativeAndBudget({
    subCategory,
    beneficiary,
    conditionOrTopic,
    cleanTitle: effectiveTitle,
    lengthMode,
    variationIndex: vIndex,
  });

  const causeNarrativeHtml = `
    ${causeData.heading}
    ${causeData.paragraphs.join("\n")}
  `;

  // 4. Itemized Budget Allocation HTML
  const budgetListHtml = `
    ${causeData.budgetHeading}
    <p>We believe in 100% financial transparency. Every contribution given is treated with utmost respect and directly powers the following essential priorities:</p>
    <ul>
      ${causeData.budgetPoints.map((pt) => `<li>${pt}</li>`).join("\n")}
    </ul>
  `;

  // 5. Additional user notes if supplied
  let extraNotesHtml = "";
  if (additionalNotes && additionalNotes.trim().length > 0) {
    const sanitizedNotes = sanitizeMonetaryAmounts(additionalNotes.trim(), currencyInfo);
    extraNotesHtml = `
      <h3>Important Updates & Campaign Specifics</h3>
      <p>${sanitizedNotes}</p>
    `;
  }

  // 6. Call to Action & Gratitude
  const donationTiers = currencyInfo.symbol === "₹"
    ? "₹100, ₹500, or ₹1,000"
    : `${currencyInfo.symbol}10, ${currencyInfo.symbol}25, or ${currencyInfo.symbol}50`;

  let callToAction = "";
  if (lengthMode === 300) {
    callToAction = `
      ${causeData.ctaHeading}
      <p>Every single gesture makes an immediate, real difference today:</p>
      <ol>
        <li><strong>Make a Contribution:</strong> Even a donation of ${donationTiers} brings us one step closer to our goal.</li>
        <li><strong>Share This Campaign:</strong> Sharing this link on WhatsApp, Facebook, or Instagram helps us reach generous hearts.</li>
      </ol>
      <p>Thank you with all our hearts for your warmth, empathy, and support!<br/><strong>${author} and Supporters</strong></p>
    `;
  } else if (lengthMode === 700) {
    callToAction = `
      ${causeData.ctaHeading}
      <p>There are two powerful, indispensable ways you can make a life-changing difference today:</p>
      <ol>
        <li><strong>Make a Contribution:</strong> No amount is too small. Even a donation of ${donationTiers} brings us one step closer to our goal and brings immense relief to our hearts during this decisive journey for ${beneficiary}.</li>
        <li><strong>Share This Campaign:</strong> If you are unable to donate right now, sharing this campaign link on WhatsApp, Facebook, Instagram, LinkedIn, or via email helps us reach generous supporters we could never reach on our own.</li>
      </ol>
      <p>We promise full transparency and will post regular updates directly on this page so you can witness the impact of your support every step of the way.</p>
      <p>From the bottom of our hearts, thank you for your compassion, your prayers, and your generosity. We will keep you updated every step of the way as we hit our milestones together!</p>
      <p>With deepest gratitude,<br/><strong>${author} and Supporters</strong></p>
    `;
  } else {
    callToAction = `
      ${causeData.ctaHeading}
      <p>There are two powerful ways you can make a life-changing difference today:</p>
      <ol>
        <li><strong>Make a Contribution:</strong> No amount is too small. Even a donation of ${donationTiers} brings us one step closer to our goal and brings immense comfort to our hearts.</li>
        <li><strong>Share This Campaign:</strong> If you are unable to donate right now, sharing this campaign link on WhatsApp, Facebook, Instagram, LinkedIn, or via email helps us reach generous hearts we could never find on our own.</li>
      </ol>
      <p>From the bottom of our hearts, thank you for your compassion, your prayers, and your generosity. We will keep you updated every step of the way as we hit our milestones together!</p>
      <p>With deepest gratitude,<br/><strong>${author} and Supporters</strong></p>
    `;
  }

  // 7. Transparency & Oversight Section
  let oversightHtml = "";
  if (lengthMode >= 500) {
    if (lengthMode === 700) {
      oversightHtml = `
        <h3>Transparency, Oversight & Real-Time Updates</h3>
        <p>We believe that trust is earned through complete transparency. Throughout this entire journey, we will post frequent, documented updates directly to this campaign page, including official invoices, progress photos, and milestone receipts. Donors will be able to follow each phase and witness firsthand how their kindness directly creates positive change for ${beneficiary}.</p>
        <p>No matter the size of your contribution, you are an essential stakeholder in this mission. We pledge to treat every single donation with profound gratitude and the highest standards of financial stewardship.</p>
      `;
    } else {
      oversightHtml = `
        <h3>Transparency, Oversight & Real-Time Updates</h3>
        <p>We are committed to maintaining 100% accountability throughout this initiative. Every supporter will receive direct updates detailing our progress, verified clinical invoices, and milestone receipts as we reach our goals. Your trust is our highest priority, and we promise to honor every contribution with complete integrity.</p>
      `;
    }
  }

  const fullHtml = `
    <p>${intro}</p>
    ${coreParagraph}
    ${causeNarrativeHtml}
    ${budgetListHtml}
    ${oversightHtml}
    ${extraNotesHtml}
    ${callToAction}
  `.trim();

  // Dynamic calibration to precisely hit target length (300, 500, or 700 words)
  let calibratedHtml = fullHtml;
  let wordCountNow = countWords(calibratedHtml);

  if (wordCountNow < lengthMode - 20) {
    const supplement = `
      <p>Every contribution directly accelerates our timeline, secures essential provisions, and lifts an immense burden off our shoulders. Knowing that our community stands behind ${beneficiary} with compassion gives us the strength to keep moving forward with confidence and hope.</p>
    `;
    calibratedHtml = calibratedHtml.replace(causeData.ctaHeading, `${supplement}\n${causeData.ctaHeading}`);
    wordCountNow = countWords(calibratedHtml);
  }

  if (wordCountNow < lengthMode - 20) {
    const supplement2 = `
      <p>We are profoundly touched by every individual who takes the time to read, share, and support our campaign. Together, we are creating a network of generosity that proves no one has to walk through difficult seasons alone.</p>
    `;
    calibratedHtml = calibratedHtml.replace(causeData.ctaHeading, `${supplement2}\n${causeData.ctaHeading}`);
  }

  return calibratedHtml;
};

/**
 * Grammarly-style grammar, spelling, punctuation & clarity polishing.
 */
export const polishGrammarAndStyle = (rawText = "", tone = "heartfelt", country = null) => {
  const currencyInfo = resolveCountryCurrency(country);
  let text = stripHtml(rawText);
  if (!text || text.trim().length === 0) return "<p></p>";

  // Clean monetary signs matching country currency
  text = sanitizeMonetaryAmounts(text, currencyInfo);

  // Common typo corrections & phrasing enhancements
  const replacements = [
    [/\bi\b/g, "I"],
    [/\bi'm\b/gi, "I am"],
    [/\bdont\b/gi, "don't"],
    [/\bcant\b/gi, "cannot"],
    [/\bwont\b/gi, "will not"],
    [/\bplz\b/gi, "please"],
    [/\bpls\b/gi, "please"],
    [/\bthx\b/gi, "thank you"],
    [/\bu\b/g, "you"],
    [/\bur\b/g, "your"],
    [/\br\b/g, "are"],
    [/\bteh\b/gi, "the"],
    [/\brecieve\b/gi, "receive"],
    [/\bseperate\b/gi, "separate"],
    [/\buntill\b/gi, "until"],
    [/\bdefinately\b/gi, "definitely"],
    [/\balot\b/gi, "a lot"],
    [/\bhelp me out\b/gi, "support our journey"],
    [/\bneed money\b/gi, "urgently require financial assistance"],
    [/\bgive money\b/gi, "consider contributing to our cause"],
  ];

  let cleaned = text;
  replacements.forEach(([regex, rep]) => {
    cleaned = cleaned.replace(regex, rep);
  });

  // Capitalize first letter of sentences
  cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, sep, char) => sep + char.toUpperCase());

  // Split into clean paragraphs
  const paragraphs = cleaned
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return `<p>${cleaned}</p>`;
  }

  return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
};

/**
 * Adjusts tone of an existing text (Heartfelt, Urgent, Inspiring, Professional).
 */
export const adjustTextTone = (text = "", tone = "inspiring", country = null) => {
  const currencyInfo = resolveCountryCurrency(country);
  let plain = stripHtml(text);
  if (!plain) return "";

  plain = sanitizeMonetaryAmounts(plain, currencyInfo);

  let prefix = "";
  let suffix = "";

  switch (tone) {
    case "urgent":
      prefix = "<p><strong>URGENT UPDATE:</strong> Time is of the essence, and we are appealing to your goodwill at a decisive moment.</p>";
      suffix = "<p>Please consider making an immediate donation or sharing this page urgently. Every single minute and every contribution counts.</p>";
      break;
    case "inspiring":
      prefix = "<p>Together, we have the collective power to bring hope and light where it is needed most.</p>";
      suffix = "<p>Thank you for believing in this cause and standing with us. Your kindness inspires us every day!</p>";
      break;
    case "professional":
      prefix = "<p>We present this campaign with clear objectives, rigorous accountability, and direct community stewardship.</p>";
      suffix = "<p>Full documentation and expense receipts will be made available to all stakeholders and donors upon request.</p>";
      break;
    case "heartfelt":
    default:
      prefix = "<p>From the bottom of our hearts, we share this personal story in the hope that kindness will prevail.</p>";
      suffix = "<p>Words cannot express our gratitude for your warmth, empathy, and steadfast support.</p>";
      break;
  }

  return `${prefix}\n<p>${plain}</p>\n${suffix}`;
};

/**
 * Direct Google Gemini API connector (if user supplies their key or if present in environment).
 */
export const callGeminiDirect = async ({ prompt, apiKey }) => {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("No Gemini API key provided.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response received from Gemini API.");
  }

  return text;
};

/**
 * Convert plain text or markdown to clean TipTap HTML.
 */
export const markdownToTiptapHtml = (markdown = "") => {
  if (!markdown) return "";
  let html = markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^\s*[-*]\s+(.*)$/gim, "<li>$1</li>")
    .replace(/^\s*\d+\.\s+(.*)$/gim, "<li>$1</li>");

  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`);

  const chunks = html.split(/\n\n+/);
  const formatted = chunks
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<p") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return formatted;
};
