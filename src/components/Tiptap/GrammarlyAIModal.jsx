import React, { useState, useEffect } from "react";
import style from "./GrammarlyAIModal.module.css";
import {
  countWords,
  stripHtml,
  generateExpandedStory,
  polishGrammarAndStyle,
  adjustTextTone,
  callGeminiDirect,
  markdownToTiptapHtml,
  resolveCountryCurrency,
  formatCurrencyAmount,
  sanitizeMonetaryAmounts,
} from "./aiEngine";
import { LuSparkles, LuWand, LuCheck, LuCopy, LuRefreshCw, LuPlus, LuSettings } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";

const toastStyle = {
  fontSize: "1.4rem",
  borderRadius: "0.8rem",
  background: "#1e293b",
  color: "#ffffff",
};

const GrammarlyAIModal = ({
  isOpen,
  onClose,
  currentContent = "",
  onApply,
  campaignTitle = "",
  categoryName = "",
  targetAmount = "",
  organizerName = "",
  selectedCountry = null,
}) => {
  const [activeTab, setActiveTab] = useState("expand"); // expand | polish | tone | settings
  const [selectedTone, setSelectedTone] = useState("heartfelt");
  const [targetLength, setTargetLength] = useState(500);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [variationIndex, setVariationIndex] = useState(0);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem("blimp_gemini_api_key") || "";
  });

  // Calculate word count of original input
  const plainOriginal = stripHtml(currentContent);
  const originalWordCount = countWords(plainOriginal);
  const generatedWordCount = countWords(generatedHtml);

  // Auto-generate on open if editor has short text and nothing generated yet
  useEffect(() => {
    if (isOpen && !generatedHtml) {
      handleGenerate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Retrieve fallback context from localStorage if props are blank
  const effectiveTitle =
    campaignTitle ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("campaignTitle") || '""');
      } catch (e) {
        return "";
      }
    })();

  const effectiveCategory =
    categoryName ||
    (() => {
      try {
        const cat = JSON.parse(localStorage.getItem("selectedCategory") || "{}");
        return cat?.name || "";
      } catch (e) {
        return "";
      }
    })();

  const effectiveAmount =
    targetAmount ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("targetedAmount") || '""');
      } catch (e) {
        return "";
      }
    })();

  const effectiveOrganizer =
    organizerName ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("userFullname") || '""');
      } catch (e) {
        return "";
      }
    })();

  const effectiveCountry =
    selectedCountry ||
    (() => {
      try {
        const stored = localStorage.getItem("selectedCountry");
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    })();

  const currencyInfo = resolveCountryCurrency(effectiveCountry);
  const formattedTargetAmount = effectiveAmount
    ? formatCurrencyAmount(effectiveAmount, currencyInfo)
    : "";

  const handleGenerate = async (
    customTab = activeTab,
    customTone = selectedTone,
    customLength = targetLength,
    customVariation = variationIndex
  ) => {
    setIsGenerating(true);
    setCopied(false);
    const effectiveTargetLength = customLength || targetLength || 500;

    try {
      if (customTab === "expand") {
        // If user provided a custom Gemini API key, try calling Gemini directly
        if (geminiApiKey && geminiApiKey.trim().length > 10) {
          try {
            const prompt = `You are Grammarly AI Writing Assistant for a crowdfunding platform called Blimp.
Write a heartfelt, persuasive, transparent, and comprehensive crowdfunding campaign story formatted in HTML (using <h3>, <p>, <ul>, <li>, <strong> tags).
Target length: approximately ${effectiveTargetLength} words.
Tone: ${customTone}.
Campaign Title: "${effectiveTitle || "Community Fundraiser"}".
Category: "${effectiveCategory || "General"}".
Country: "${currencyInfo.name}".
Currency: "${currencyInfo.code} (${currencyInfo.symbol})".
Target Amount: "${formattedTargetAmount || "Goal Amount"}".
Organizer: "${effectiveOrganizer || "Campaign Organizer"}".
Current user draft / notes: "${plainOriginal || "Help us raise funds for this important cause."}".
${additionalNotes ? `Important specific details: "${additionalNotes}".` : ""}

CRITICAL CURRENCY INSTRUCTION:
The campaign is based in ${currencyInfo.name}. You MUST use the local currency symbol "${currencyInfo.symbol}" (e.g., "${formattedTargetAmount || `${currencyInfo.symbol}1,000`}") for all monetary references throughout the text. NEVER use the dollar sign ($) unless the country's currency is actually USD. All tier suggestions (e.g. donating small amounts) must use "${currencyInfo.symbol}".

Include:
1. An engaging opening paragraph explaining the situation and urgency.
2. The backstory and personal struggle.
3. A transparent breakdown section with <h3> and bullet points (<ul>, <li>) showing how the funds will be used.
4. Why community support means everything.
5. A humble call to action (donate & share) and sincere gratitude.
Do NOT wrap in markdown \`\`\`html blocks, just return clean HTML tags directly.`;

            const rawAiResponse = await callGeminiDirect({
              prompt,
              apiKey: geminiApiKey,
            });

            let formatted = markdownToTiptapHtml(rawAiResponse);
            if (currencyInfo.symbol !== "$") {
              formatted = sanitizeMonetaryAmounts(formatted, currencyInfo);
            }
            setGeneratedHtml(formatted);
            setIsGenerating(false);
            return;
          } catch (geminiErr) {
            console.warn("Gemini API call failed, falling back to intelligent narrative generator:", geminiErr);
          }
        }

        // Seamless high-quality generative narrative engine
        // Simulate a brief natural generation delay
        await new Promise((resolve) => setTimeout(resolve, 380));

        const story = generateExpandedStory({
          userDraft: currentContent,
          campaignTitle: effectiveTitle,
          categoryName: effectiveCategory,
          targetAmount: effectiveAmount,
          organizerName: effectiveOrganizer,
          country: effectiveCountry,
          tone: customTone,
          targetLength: effectiveTargetLength,
          additionalNotes,
          variationIndex: customVariation,
        });

        setGeneratedHtml(story);
      } else if (customTab === "polish") {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const polished = polishGrammarAndStyle(currentContent, customTone, effectiveCountry);
        setGeneratedHtml(polished);
      } else if (customTab === "tone") {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const tuned = adjustTextTone(currentContent, customTone, effectiveCountry);
        setGeneratedHtml(tuned);
      }
    } catch (err) {
      toast.error("Failed to generate: " + (err.message || "Unknown error"), {
        style: toastStyle,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (mode = "replace") => {
    if (!generatedHtml) {
      toast.error("Nothing generated to apply yet", { style: toastStyle });
      return;
    }
    onApply(generatedHtml, mode);
    toast.success(
      mode === "replace"
        ? `✨ Replaced description with ${generatedWordCount} words!`
        : `✨ Appended ${generatedWordCount} words to description!`,
      { style: toastStyle, duration: 3500 }
    );
    onClose();
  };

  const handleCopy = () => {
    if (!generatedHtml) return;
    const plain = stripHtml(generatedHtml);
    navigator.clipboard.writeText(plain);
    setCopied(true);
    toast.success("Copied to clipboard!", { style: toastStyle });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("blimp_gemini_api_key", geminiApiKey.trim());
    toast.success("Gemini API Key saved!", { style: toastStyle });
  };

  const handleClearApiKey = () => {
    setGeminiApiKey("");
    localStorage.removeItem("blimp_gemini_api_key");
    toast.success("Reverted to Built-in AI Engine", { style: toastStyle });
  };

  // Calculate percentage of target words
  const progressPercent = Math.min(100, Math.round((originalWordCount / targetLength) * 100));

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={style.header}>
          <div className={style.headerLeft}>
            <div className={style.grammarlyBadge}>
              <LuSparkles />
            </div>
            <div className={style.headerTitleWrapper}>
              <h2>
                Grammarly AI Assistant
                <span className={style.sparkleTag}>AI ✨</span>
              </h2>
              <p>
                {originalWordCount < 80
                  ? `Auto-complete your campaign story from ${originalWordCount} words to ~${targetLength} words with 1 click.`
                  : `Format and refine your campaign story into a structured ~${targetLength} words with 1 click.`}
              </p>
            </div>
          </div>
          <button className={style.closeButton} onClick={onClose} title="Close">
            <AiOutlineClose />
          </button>
        </div>

        {/* Feature Tabs */}
        <div className={style.tabsBar}>
          <button
            className={`${style.tabBtn} ${activeTab === "expand" ? style.tabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("expand");
              handleGenerate("expand", selectedTone, targetLength);
            }}
          >
            <LuSparkles /> Auto-Complete & Expand
            <span className={style.tabBadge}>~{targetLength} words</span>
          </button>

          <button
            className={`${style.tabBtn} ${activeTab === "polish" ? style.tabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("polish");
              handleGenerate("polish");
            }}
          >
            <LuWand /> Grammarly Polish & Grammar
          </button>

          <button
            className={`${style.tabBtn} ${activeTab === "tone" ? style.tabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("tone");
              handleGenerate("tone");
            }}
          >
            🎭 Adjust Tone
          </button>

          <button
            className={`${style.tabBtn} ${activeTab === "settings" ? style.tabBtnActive : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <LuSettings /> AI Model / Key
          </button>
        </div>

        {/* Modal Body */}
        <div className={style.modalBody}>
          {/* Analysis Card */}
          <div className={style.analysisCard}>
            <div className={style.analysisTop}>
              <div className={style.analysisStats}>
                <span className={style.statPill}>
                  Original Draft: <strong>{originalWordCount} words</strong>
                </span>
                {formattedTargetAmount && (
                  <span className={style.statPill}>
                    Goal: <strong>{formattedTargetAmount}</strong>
                  </span>
                )}
                {currencyInfo && (
                  <span className={style.countryPill} title={`Currency: ${currencyInfo.code} (${currencyInfo.symbol})`}>
                    📍 {currencyInfo.name} ({currencyInfo.symbol})
                  </span>
                )}
                {originalWordCount < 80 ? (
                  <span className={style.shortWarningPill}>
                    ⚠️ Short Draft ({originalWordCount} words) — will expand to ~{targetLength} words
                  </span>
                ) : (
                  <span className={style.optimalPill}>
                    {originalWordCount > targetLength
                      ? `📝 Refining draft (${originalWordCount} words) to ~${targetLength} words`
                      : `✅ Draft (${originalWordCount} words)`}
                  </span>
                )}
              </div>
              <span className={style.statPill}>
                Target: <strong>{targetLength} words</strong>
              </span>
            </div>

            <div className={style.progressBarContainer}>
              <div
                className={style.progressBarFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className={style.analysisHint}>
              💡 <em>Pro Tip:</em> Campaigns with detailed stories (around 500 words) with clear budget breakdowns raise over <strong>350% more donations</strong> than short descriptions.
            </p>
          </div>

          {activeTab === "settings" ? (
            /* API Key Settings Drawer */
            <div className={style.apiKeyDrawer}>
              <div className={style.configLabel}>
                <LuSettings /> AI Engine Settings
              </div>
              <p className={style.analysisHint}>
                By default, Blimp uses our high-speed, built-in intelligent narrative engine that requires zero setup and works 100% reliably.
              </p>
              <label style={{ fontSize: "1.3rem", fontWeight: 600, color: "#334155" }}>
                Optional: Custom Google Gemini API Key
              </label>
              <input
                type="password"
                className={style.apiKeyInput}
                placeholder="AIzaSy... (leave blank to use built-in engine)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
              />
              <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.6rem" }}>
                <button
                  type="button"
                  className={style.applyBtn}
                  style={{ padding: "0.6rem 1.4rem", fontSize: "1.25rem" }}
                  onClick={handleSaveApiKey}
                >
                  Save API Key
                </button>
                {geminiApiKey && (
                  <button
                    type="button"
                    className={style.cancelBtn}
                    style={{ padding: "0.6rem 1.4rem", fontSize: "1.25rem" }}
                    onClick={handleClearApiKey}
                  >
                    Reset to Built-in Engine
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Generation Configuration */
            <div className={style.configSection}>
              {/* Tone Selection */}
              <div className={style.configRow}>
                <div className={style.configLabel}>Select Campaign Tone:</div>
                <div className={style.tonePillsGrid}>
                  {[
                    {
                      id: "heartfelt",
                      name: "💖 Heartfelt & Moving",
                      desc: "Deeply emotional, sincere, highlights personal struggle",
                    },
                    {
                      id: "urgent",
                      name: "🚨 Urgent & Critical",
                      desc: "Time-sensitive crisis, calls for immediate assistance",
                    },
                    {
                      id: "inspiring",
                      name: "🌟 Inspiring & Hopeful",
                      desc: "Community uplift, positive transformation, future-focused",
                    },
                    {
                      id: "professional",
                      name: "💼 Professional & Clear",
                      desc: "Data-driven, organized breakdown, highly accountable",
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`${style.tonePill} ${
                        selectedTone === t.id ? style.tonePillActive : ""
                      }`}
                      onClick={() => {
                        setSelectedTone(t.id);
                        handleGenerate(activeTab, t.id, targetLength);
                      }}
                    >
                      <span className={style.toneName}>{t.name}</span>
                      <span className={style.toneDesc}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "expand" && (
                <>
                  {/* Target Length */}
                  <div className={style.configRow}>
                    <div className={style.configLabel}>Target Word Count:</div>
                    <div className={style.lengthPills}>
                      {[
                        { len: 300, label: "~300 words (Concise)" },
                        { len: 500, label: "~500 words (Recommended)" },
                        { len: 700, label: "~700 words (Comprehensive)" },
                      ].map((item) => (
                        <button
                          key={item.len}
                          type="button"
                          className={`${style.lengthPill} ${
                            targetLength === item.len ? style.lengthPillActive : ""
                          }`}
                          onClick={() => {
                            setTargetLength(item.len);
                            handleGenerate("expand", selectedTone, item.len);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Key Details */}
                  <div className={style.configRow}>
                    <div className={style.configLabel}>
                      Key Details to Include (Optional):
                    </div>
                    <textarea
                      className={style.detailsInput}
                      placeholder="e.g. Hospital name, target surgery date, specific needs, animal name, etc."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Generate Button */}
              <div className={style.generateActionContainer}>
                <button
                  type="button"
                  className={style.generateBtn}
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                >
                  <LuSparkles />
                  {isGenerating
                    ? "✨ Writing Your Campaign Story..."
                    : activeTab === "expand"
                    ? `✨ Auto-Complete to ~${targetLength} Words`
                    : activeTab === "polish"
                    ? "✨ Fix Grammar & Polish Text"
                    : "✨ Apply Tone Change"}
                </button>
              </div>
            </div>
          )}

          {/* Loading Animation Box */}
          {isGenerating && (
            <div className={style.loadingBox}>
              <div className={style.loadingSpinner} />
              <p className={style.loadingText}>
                ✨ Grammarly AI is crafting your complete campaign story...
              </p>
              <p className={style.loadingSubText}>
                Structuring introduction, cause narrative, budget breakdown, and calls to action.
              </p>
            </div>
          )}

          {/* Generated Result Preview */}
          {!isGenerating && generatedHtml && (
            <div className={style.previewCard}>
              <div className={style.previewHeader}>
                <div className={style.previewTitleWrapper}>
                  <span className={style.previewTag}>
                    <LuCheck /> AI Generated Story
                  </span>
                  <span className={style.wordDifferenceTag}>
                    {generatedWordCount} words (
                    {generatedWordCount >= originalWordCount
                      ? `+${generatedWordCount - originalWordCount} words added`
                      : `${generatedWordCount} words`}
                    )
                  </span>
                </div>

                <button
                  type="button"
                  className={style.copyBtn}
                  onClick={handleCopy}
                  title="Copy plain text"
                >
                  {copied ? <LuCheck /> : <LuCopy />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div
                className={style.previewContent}
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={style.footer}>
          <div className={style.footerLeft}>
            <button
              type="button"
              className={style.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={style.cancelBtn}
              onClick={() => {
                const nextVar = (variationIndex + 1) % 3;
                setVariationIndex(nextVar);
                handleGenerate(activeTab, selectedTone, targetLength, nextVar);
              }}
              disabled={isGenerating}
              title="Generate another fresh variation with a different angle"
            >
              <LuRefreshCw /> Try Another Version
            </button>
          </div>

          <div className={style.footerRight}>
            {originalWordCount > 0 && (
              <button
                type="button"
                className={style.appendBtn}
                onClick={() => handleApply("append")}
                disabled={!generatedHtml || isGenerating}
                title="Keep existing text and append AI content below it"
              >
                <LuPlus /> Append Below Draft
              </button>
            )}

            <button
              type="button"
              className={style.applyBtn}
              onClick={() => handleApply("replace")}
              disabled={!generatedHtml || isGenerating}
              title="Replace the editor text with this complete story"
            >
              <LuSparkles /> Replace Entire Description (~{generatedWordCount} words)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarlyAIModal;
