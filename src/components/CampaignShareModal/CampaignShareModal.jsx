import React, { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaRegEnvelope,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import styles from "./CampaignShareModal.module.css";
import toast from "react-hot-toast";
import { toastStyle } from "../../utils/toastStyles";
import blimpLogo from "../../assets/BlimpLogo1.png";

const CampaignShareModal = ({ campaign, shareUrl, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const dialogRef = useRef(null);
  const posterRef = useRef(null);
  const qrPanelRef = useRef(null);

  const title = campaign?.campaign_name || "Help make a difference";
  const image = campaign?.banner_image;
  const symbol = campaign?.country?.symbol || "";
  const currency = campaign?.country?.currency || "";
  const raised = campaign?.raisedAmount ?? campaign?.raised_amount ?? 0;
  const goal = campaign?.targetAmount ?? campaign?.target_amount ?? 0;
  const shareHost = (() => {
    try {
      return new URL(shareUrl).host;
    } catch {
      return "BLIMP";
    }
  })();
  const progress = Math.min(100, Math.max(0, Number(
    campaign?.percentageAchieved || (Number(goal) ? (Number(raised) / Number(goal)) * 100 : 0)
  )));
  const formatAmount = (value) => {
    const amount = Number(String(value ?? 0).replace(/[^0-9.]/g, "")) || 0;
    return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const copyLink = async (successMessage = "Campaign link copied!") => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = shareUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      toast.success(successMessage, { style: toastStyle });
    } catch {
      toast.error("Could not copy the link. Please copy it manually.", { style: toastStyle });
    }
  };

  const socialUrl = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(`Support: ${title}`);
    const messages = encodeURIComponent(`Please take a look at this campaign: ${title}`);
    const targets = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${messages}%20${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${messages}%0A%0A${encodedUrl}`,
    };
    return targets[platform];
  };

  const shareTo = (platform) => {
    if (platform === "instagram") {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      copyLink("Campaign link copied. Paste it into Instagram to share.");
      return;
    }
    const target = socialUrl(platform);
    if (platform === "email") {
      window.location.href = target;
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer,width=640,height=640");
  };

  const getPosterBlob = async () => {
    if (!posterRef.current) throw new Error("Poster is not ready yet.");
    await document.fonts?.ready;
    await Promise.all(
      Array.from(posterRef.current.querySelectorAll("img")).map((posterImage) => {
        if (posterImage.complete) {
          return posterImage.naturalWidth > 0
            ? Promise.resolve()
            : Promise.reject(new Error("A poster image could not be loaded."));
        }
        return new Promise((resolve, reject) => {
          posterImage.addEventListener("load", resolve, { once: true });
          posterImage.addEventListener("error", () => reject(new Error("A poster image could not be loaded.")), { once: true });
        });
      }),
    );
    return toBlob(posterRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: activeTemplate === 0 ? "#f8f6e9" : "#f4f5f4",
    });
  };

  const downloadPoster = async () => {
    setIsExporting(true);
    try {
      const blob = await getPosterBlob();
      if (!blob) throw new Error("Could not create the poster image.");
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "campaign"}-share.png`;
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      toast.success("Poster downloaded. You can attach it to your post or message.", { style: toastStyle });
    } catch {
      toast.error("Poster export failed. Try another image or copy the campaign link.", { style: toastStyle });
    } finally {
      setIsExporting(false);
    }
  };

  const shareCampaignLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Please support ${title}`, url: shareUrl });
      } else {
        await copyLink("Campaign link copied. Share it to show the campaign preview.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Could not share the campaign link. Copy it and share it manually.", { style: toastStyle });
      }
    }
  };

  const services = [
    { id: "facebook", label: "Facebook", Icon: FaFacebookF, className: styles.facebook },
    { id: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, className: styles.whatsapp },
    { id: "instagram", label: "Instagram", Icon: null, className: styles.instagram },
    { id: "x", label: "X", Icon: FaXTwitter, className: styles.x },
    { id: "email", label: "Email", Icon: FaRegEnvelope, className: styles.email },
    { id: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, className: styles.linkedin },
  ];

  return (
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-share-title"
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2 id="campaign-share-title">Quick share</h2>
          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Close share dialog">×</button>
        </header>

        <div className={styles.linkRow}>
          <label className={styles.linkField}>
            <span>Your campaign link</span>
            <input aria-label="Campaign share link" readOnly value={shareUrl} onFocus={(event) => event.target.select()} />
          </label>
          <button type="button" className={styles.copyButton} onClick={() => copyLink()}>
            <span aria-hidden="true">▢</span> Copy link
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.shareColumn}>
            <h3>Reach more people by sharing</h3>
            <p className={styles.description}>Invite your community to read the story, share it, or contribute.</p>
            <div className={styles.serviceGrid}>
              {services.map(({ id, label, Icon, className }) => (
                <button type="button" className={styles.service} key={id} onClick={() => shareTo(id)}>
                  <span className={`${styles.serviceIcon} ${className}`} aria-hidden="true">
                    {Icon ? <Icon /> : <span className={styles.instagramGlyph}>◎</span>}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
              <button type="button" className={styles.service} onClick={() => {
                setShowQr((visible) => !visible);
                requestAnimationFrame(() => qrPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
              }} aria-expanded={showQr}>
                <span className={`${styles.serviceIcon} ${styles.qrIcon}`} aria-hidden="true">▦</span>
                <span>QR code</span>
              </button>
              <button type="button" className={styles.service} onClick={shareCampaignLink}>
                <span className={`${styles.serviceIcon} ${styles.nativeIcon}`} aria-hidden="true">↗</span>
                <span>Share campaign link</span>
              </button>
            </div>
            <div className={`${styles.qrPanel} ${showQr ? styles.qrVisible : ""}`} ref={qrPanelRef}>
              <div>
                <strong>Scan to open this campaign</strong>
                <span>Make it easy to share in person.</span>
              </div>
              <QRCodeSVG value={shareUrl} size={84} level="M" aria-label="QR code for campaign link" />
            </div>
          </div>

          <div className={styles.posterColumn}>
            <div className={styles.posterHeading}>
              <div><h3>Shareable graphics</h3><p>Share from a phone, or download the poster on a computer.</p></div>
              <span>{activeTemplate + 1} / 2</span>
            </div>
            <div className={styles.posterActions}>
              <button type="button" className={styles.downloadButton} onClick={downloadPoster} disabled={isExporting}>{isExporting ? "Preparing…" : "Download"}</button>
              <button type="button" className={styles.posterShareButton} onClick={shareCampaignLink}>Share campaign</button>
            </div>
            <div className={`${styles.poster} ${activeTemplate === 1 ? styles.posterAlternate : ""}`} ref={posterRef}>
              <div className={styles.posterTopline}><img src={blimpLogo} alt="BLIMP" /></div>
              <div className={styles.posterImageWrap}>
                {image ? <img src={image} alt="" crossOrigin="anonymous" /> : <div className={styles.imagePlaceholder}>A community<br />can make a difference</div>}
              </div>
              <p className={styles.posterEyebrow}>HELP THIS CAMPAIGN</p>
              <h4>{title}</h4>
              <div className={styles.posterProgress}>
                <div><span>{symbol}{formatAmount(raised)} raised</span><b>{Math.round(progress)}%</b></div>
                <div className={styles.posterTrack}><span style={{ width: `${progress}%` }} /></div>
                <small>Goal {symbol}{formatAmount(goal)}{!symbol && currency ? ` ${currency}` : ""}</small>
              </div>
              <strong className={styles.posterCta}>LEARN MORE & SUPPORT</strong>
              <small className={styles.posterUrl}>{shareHost} · Scan or visit the campaign</small>
            </div>
            <div className={styles.posterControls}>
              <button type="button" aria-label="Previous poster" onClick={() => setActiveTemplate((activeTemplate + 1) % 2)}>‹</button>
              <div className={styles.dots} aria-label={`Poster ${activeTemplate + 1} of 2`}>
                {[0, 1].map((index) => <button key={index} type="button" aria-label={`Show poster ${index + 1}`} className={index === activeTemplate ? styles.activeDot : ""} onClick={() => setActiveTemplate(index)} />)}
              </div>
              <button type="button" aria-label="Next poster" onClick={() => setActiveTemplate((activeTemplate + 1) % 2)}>›</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampaignShareModal;
