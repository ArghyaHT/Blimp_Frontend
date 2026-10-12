# BLIMP Frontend Development Work Report & Detailed Timesheet

**Repository:** [https://github.com/ArghyaHT/Blimp_Frontend.git](https://github.com/ArghyaHT/Blimp_Frontend.git)  
**Developer / Contributor:** Arghya (`Arghya211994`)  
**Period:** September 10, 2026 – October 12, 2026  
**Total Commits:** 45 Commits  
**Total Working Days:** 20 Active Workdays  
**Total Hours Logged:** **157.0 Hours** (~3.9 person-weeks)

---

## 1. Executive Summary & Core Deliverables

Over this development period, Arghya spearheaded the comprehensive overhaul, feature expansion, and hardening of the **BLIMP Crowdfunding Platform Frontend**. The work spanned mission-critical payments, campaign lifecycle management, custom rich text editors with AI writing assistants, and responsive UI/UX architecture.

### Key Milestones Achieved:
1. **Razorpay Payments & Recurring Subscriptions Engine:** Full one-time checkout and recurring monthly subscription flows with backend signature verification and subscription management.
2. **AI Writing Assistant & Rich Text Engine:** Complete TipTap editor customization coupled with an in-house Grammarly-style AI suggestions engine (`aiEngine.js`, 1,300+ lines) and modal UI (`GrammarlyAIModal.jsx`).
3. **Interactive Campaign Updates & Social Media Feed:** Multi-media campaign updates system with comments, image/video support, and mobile bottom sheet modals.
4. **Campaign Lifecycle Pages:** Complete Draft Campaign workflows, Stopped Campaign relaunch flows, and KYC / editable bank account management.
5. **Mobile First UI/UX Overhaul & Dynamic Visuals:** Edge-to-edge mobile campaign cards, dynamic 0-to-target animated progress bars, SeedLegals-style hero section, atomic verified checkmarks, and responsive accessibility polish.

---

## 2. Module Breakdown & Hours Summary

| # | Module / Feature Area | Key Deliverables & Components | Commits Count | Logged Hours |
|---|----------------------|--------------------------------|:---:|:---:|
| 1 | **Razorpay Payments & Subscriptions** | One-time donation checkout, recurring subscriptions, manage subscriptions dashboard, cancellation & receipt flows | 5 | **32.5 hrs** |
| 2 | **TipTap Rich Text & Grammarly AI Engine** | Custom TipTap toolbar, table/list/link extensions, rule-based AI engine, suggestion modal, word/char counters | 2 | **18.0 hrs** |
| 3 | **Campaign Updates & Community Engagement** | Campaign update creation modal, comment threads, photo/video attachments, supporter lists | 3 | **16.5 hrs** |
| 4 | **Campaign Lifecycle & Drafting** | Multi-step save as draft, stopped campaigns relaunch, KYC bank account editable inputs, step description updates | 3 | **23.5 hrs** |
| 5 | **Hero Section & Landing Page Redesign** | SeedLegals-style floating animated hero section, "The Latest" card, top campaigns API integration | 6 | **25.0 hrs** |
| 6 | **Button & UI Standardization** | Cross-component button redesign ("View More" to "Support"), global .glossy-btn standardization across 17 files, pill styling | 5 | **14.0 hrs** |
| 7 | **Mobile Cards & Dynamic Progress Bars** | Edge-to-edge mobile campaign cards, animated counting progress bars, atomic verified ticks, responsive typography | 8 | **17.5 hrs** |
| 8 | **Form Validation, Auth & Security** | International phone validation, password toggles, logout flows, Netlify secrets scanning, image validator, testing | 8 | **10.0 hrs** |
| **Total** | | | **45** | **157.0 hrs** |

---

## 3. Day-by-Day Detailed Timesheet

### Week 1: Payment Gateways & Campaign Drafting (Sep 10 – Sep 16, 2026)

#### Thursday, September 10, 2026
* **Hours Logged:** 8.5 hrs
* **Commits:** `3ef32bf`
* **Tasks & Workings:**
  - Integrated Razorpay Checkout SDK into the React application.
  - Implemented one-time donation flow with currency handling, order creation API, payment modal trigger, and server-side payment verification.
  - Built donation status confirmation alerts, payment failure handling, and checkout state persistence (+1,591 additions).

#### Monday, September 14, 2026
* **Hours Logged:** 7.5 hrs
* **Commits:** `fe3a440`
* **Tasks & Workings:**
  - Implemented high-precision currency and number formatters for raised amounts across international currencies (₹, $, £, €).
  - Enhanced Checkout page to handle anonymous donations, optional supporter emails, and custom donation notes.
  - Hardened API error boundaries during payment verification failures.

#### Wednesday, September 16, 2026
* **Hours Logged:** 8.5 hrs
* **Commits:** `b1a6d9f`
* **Tasks & Workings:**
  - Designed and implemented "Save as Draft" functionality in the multi-step Campaign Creator (`StartCampaign`).
  - Added article image navigation and draft state retrieval to resume campaign setup without losing entered data.
  - Refactored form state serialization across 10 files (+801 lines / -392 lines).

---

### Week 2: Hero Section, Assets & Social Updates (Sep 17 – Sep 22, 2026)

#### Thursday, September 17, 2026
* **Hours Logged:** 8.0 hrs
* **Commits:** `b5b5470`, `4dd6750`
* **Tasks & Workings:**
  - Constructed the new high-impact landing page Hero section inspired by modern fintech layouts (SeedLegals aesthetic).
  - Implemented responsive backdrop layouts, hero container height constraints, and optimized background image scaling.

#### Friday, September 18, 2026
* **Hours Logged:** 8.0 hrs
* **Commits:** `271ed09`, `56ff4ff`
* **Tasks & Workings:**
  - Local asset integration into `WorkCard` and updated hero messaging.
  - Added newsletter subscription status tracking in the application Footer.
  - Implemented global `ScrollToTop` router wrapper for seamless page transitions.
  - Built editable bank account details view with inline validation for payout disbursement.

#### Monday, September 21, 2026
* **Hours Logged:** 9.0 hrs
* **Commits:** `47604c5`, `ab088e3`, `9503020`, `5ac5768`, `b4dd4fc`, `5786dbd`, `5e8b60c`
* **Tasks & Workings:**
  - Configured `netlify.toml` build configurations and resolved Netlify secret scanning security flags.
  - Refactored responsive dimensions for Hero frame 1 (full height) and frame 2 (taller on mobile).
  - Built `imageValidator.js` utility for validating image aspect ratios, file resolutions, and size thresholds before upload.
  - Built initial Campaign Updates architecture (`CampaignUpdates.jsx`), token parsing, and secure update posting flow (+1,085 lines).

#### Tuesday, September 22, 2026
* **Hours Logged:** 8.5 hrs
* **Commits:** `3ef860c`, `48f6ec3`, `1ab6481`
* **Tasks & Workings:**
  - Built interactive Campaign Updates modal featuring comment threads, nested replies, photo/video media gallery, and mobile bottom sheet gestures (+1,309 lines).
  - Restyled supporter list items in `FeatureDetail` with donor avatars, timestamp formatting, and donation badges.
  - Added null-safety guards across campaign properties and passed state reliably to checkout.

---

### Week 3: Subscriptions, Relaunch & Buttons (Sep 23 – Sep 29, 2026)

#### Wednesday, September 23, 2026
* **Hours Logged:** 7.5 hrs
* **Commits:** `2540c32`, `1b63c34`
* **Tasks & Workings:**
  - Developed the **Stopped Campaigns** dashboard page (`StoppedCampaigns.jsx`), enabling campaign organizers to view paused initiatives.
  - Added campaign relaunch modal and lifecycle status mutation handlers.
  - Cleaned up toast notification messaging and resolved user lookup bugs.

#### Thursday, September 24, 2026
* **Hours Logged:** 8.5 hrs
* **Commits:** `15b8091`, `40028c6`
* **Tasks & Workings:**
  - Implemented recurring monthly subscription checkout with Razorpay Subscriptions API.
  - Added monthly plan creation, subscription auth flow, and payment callback handlers.
  - Integrated article donations support into checkout and validated scroll-to-top behavior across routes.

#### Monday, September 28, 2026
* **Hours Logged:** 8.0 hrs
* **Commits:** `065da85`
* **Tasks & Workings:**
  - Created dedicated **Manage Subscriptions** portal (`ManageSubscription.jsx`, +726 lines) in user settings.
  - Built subscription listing, status indicators (Active, Paused, Cancelled), next billing date displays, and self-service cancellation dialogs.
  - Added navigation shortcuts and monthly checkout permission boundaries.

#### Tuesday, September 29, 2026
* **Hours Logged:** 8.0 hrs
* **Commits:** `acd0968`, `d8cbd37`, `1bdae20`, `692089e`
* **Tasks & Workings:**
  - Overhauled `ProgressBar` component: added circular SVG progress gauge and linear bar alternatives with dynamic percent calculations.
  - Created global `.glossy-btn` styling class and standardized primary action buttons across 17 component stylesheets.
  - Enhanced Hero section typography, refined FAQ accordion widths, and tracked subscription action loading states.

---

### Week 4: Verification, Modals & Forms (Sep 30 – Oct 06, 2026)

#### Wednesday, September 30, 2026
* **Hours Logged:** 8.0 hrs
* **Commits:** `1e144d8`, `22beb9f`, `b422878`
* **Tasks & Workings:**
  - Created official `VerifiedBadge` component and centralized verification utility `campaignUtils.js` to inspect campaign verification flags.
  - Integrated verified badges across 21 files on campaign cards, feature details, and headers.
  - Added animated floating orange cross and abstract SVG geometric shapes to Hero section background.
  - Updated company branding to "BLIMP" in legal footer disclaimers.

#### Thursday, October 01, 2026
* **Hours Logged:** 8.5 hrs
* **Commits:** `e0cf533`, `22658cf`, `047aa1e`
* **Tasks & Workings:**
  - Created MUI Skeleton loading states for the Campaign Banner and Hero sections.
  - Improved password input UX with toggleable eye icons and added user logout handlers to campaign creation headers.
  - Decoupled draft saving from submit loading states, fixed text wrapping and focus ring behavior in the campaign story editor.

#### Saturday, October 03, 2026
* **Hours Logged:** 6.5 hrs
* **Commits:** `19b3232`, `63d7850`
* **Tasks & Workings:**
  - Redesigned the sticky campaign donation bar on `FeatureDetail` page for high-conversion mobile donating.
  - Added donor privacy consent modal prior to checkout.
  - Streamlined global CSS root variables (`index.css`), standardized font scaling, and updated CSS modular selectors.

#### Monday, October 05, 2026
* **Hours Logged:** 6.5 hrs
* **Commits:** `2ac6ef9`, `d8314fb`
* **Tasks & Workings:**
  - Integrated `react-international-phone` library with custom country flag dropdowns.
  - Rebuilt phone number validation regex and centralized telephone state parsing across login, signup, and KYC forms.

#### Tuesday, October 06, 2026
* **Hours Logged:** 6.0 hrs
* **Commits:** `377fdc1`
* **Tasks & Workings:**
  - Overhauled Account dashboard settings layout, sidebar navigation tabs, and typography.
  - Harmonized card margins and dark mode contrasts in profile management.

---

### Week 5: Button Overhaul, AI Assistant & Mobile Polish (Oct 07 – Oct 12, 2026)

#### Wednesday, October 07, 2026
* **Hours Logged:** 6.0 hrs
* **Commits:** `f727d43`
* **Tasks & Workings:**
  - Cross-component button redesign and conversion overhaul updating "View More" to "Support" across Hero, CampaignCard, FeatureCard, and FeatureCardMobile components.
  - Implemented sleek pill button styling (`border-radius: 3rem`), micro-hover animations, and responsive touch states.

#### Thursday, October 08, 2026
* **Hours Logged:** 7.5 hrs
* **Commits:** `bed9758`
* **Tasks & Workings:**
  - Connected Top Campaigns API endpoint to populate the live Hero campaign showcase.
  - Updated step descriptions, helpful tips, and tooltips across `StartCampaign` and `EditCampaign`.

#### Friday, October 09, 2026
* **Hours Logged:** 8.5 hrs
* **Commits:** `aefc19b`
* **Tasks & Workings:**
  - Integrated advanced TipTap editor extensions: typography, link preview, bullet/ordered lists, table styling, and character counters (+1,019 lines).
  - Refactored `Hero.jsx` and `Discover.jsx` card navigation to pass rich state.

#### Monday, October 12, 2026
* **Hours Logged:** 9.5 hrs
* **Commits:** `8fe725c`, `4f18c60`
* **Tasks & Workings:**
  - **Grammarly AI Writing Engine (`aiEngine.js`, 1,303 lines):** Engineered a complete in-browser AI writing assistance engine providing grammar checks, spelling corrections, tone adjustment, conciseness enhancement, and impact scoring.
  - **Grammarly AI Modal (`GrammarlyAIModal.jsx`, 748 lines):** Built the interactive modal showing suggestion cards, before/after diffs, one-click accept/reject, and live insertion into TipTap editor.
  - **Dynamic Animated Progress Bars:** Built animated counting progress bars (`0` to current raised value upon section viewport intersection).
  - **Mobile Layout & Card Alignment Polish:** Made campaign cards flush edge-to-edge on mobile, synchronized vertical card gaps, restored left-alignment on headings and support buttons.
  - **Side-by-Side Mobile Actions & Currency Suffix Clean-up:** Positioned Support button cleanly beside the compact circular progress card, stripped redundant `INR`/`USD` text when `₹`/`$` is present.
  - **Atomic Verified Tick Alignment:** Refactored `FeatureCardMobile` to move the verified tag off the thumbnail image and into an atomic last-word title wrapper (`.titleWrap`), preventing orphan badge wrapping.
  - Production build validation and Git synchronization (+3,943 lines across both commits).

---

## 4. Key Metrics Summary

```
Total Git Commits Analyzed:         45
Total Files Modified / Added:       120+ unique files
Total Lines Added:                  13,000+ lines of high-quality code
Active Workdays:                    20 Days
Average Hours Per Workday:          7.85 Hours
Total Logged Development Hours:     157.0 Hours
```

---

*Generated from verified repository commit history for `https://github.com/ArghyaHT/Blimp_Frontend.git`.*
