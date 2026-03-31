import { useState, useCallback } from "react";
import svgPaths from "../../imports/svg-9sl8t3xpyu";
import { imgGroup } from "../../imports/svg-354k6";
import APP_CONTENT from "../config/content";

const t = APP_CONTENT.introScreen;
const sub = t.submission;

interface IntroScreenProps {
  email: string;
  emailEntered: boolean;
  consentChecked: boolean;
  onEmailChange: (email: string) => void;
  onConsentChange: (checked: boolean) => void;
  onStart: () => void;
}

export function IntroScreen({ email, emailEntered, consentChecked, onEmailChange, onConsentChange, onStart }: IntroScreenProps) {
  const canStart = emailEntered;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const handleStart = useCallback(async () => {
    if (!canStart || isSubmitting) return;
    setIsSubmitting(true);
    setErrorVisible(false);
    try {
      const payload = {
        Email: email,
        Agrees: consentChecked ? [1, 54] : [0, 54],
        CampaignId: sub.campaignId,
        Status: 1,
      };
      const response = await fetch(sub.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        onStart();
      } else {
        showError();
      }
    } catch (err) {
      // Offline / file:// / CORS — bypass API and start the game anyway
      console.warn("Running offline: API bypassed", err);
      onStart();
    } finally {
      setIsSubmitting(false);
    }
  }, [canStart, isSubmitting, email, consentChecked, onStart]);

  function showError() {
    setErrorVisible(true);
    setTimeout(() => setErrorVisible(false), 3000);
  }

  return (
    <div className="bg-[#f7f7f7] relative size-full flex items-center justify-center overflow-y-auto" data-name="Game Intro">
      <div className="content-stretch flex flex-col gap-8 sm:gap-12 md:gap-16 lg:gap-[96px] items-center justify-center w-full max-w-[823px] px-5 md:px-8 lg:px-0 py-8 md:py-0">
        <div className="h-[24px] md:h-[48px] overflow-clip relative shrink-0 w-[126px] md:w-[252px]" data-name="Logo / Ohtuleht">
          <div className="absolute contents inset-0" data-name="Clip path group">
            <div
              className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[336px_64px]"
              style={{ maskImage: `url('${imgGroup}')` }}
            >
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 252 48.0001">
                <g id="Group">
                  <path d={svgPaths.p2f0a4d00} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.p6b12800} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.p20025b80} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.p9059200} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.p12833700} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.pbe80200} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.p24778c00} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.p815f9f0} fill="var(--fill-0, #F20312)" />
                  <path d={svgPaths.pad98080} fill="var(--fill-0, #F20312)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-3 md:gap-[24px] items-center justify-center not-italic relative shrink-0 text-center w-full">
          <p className="font-['Fira_Sans',sans-serif] leading-[1.25] relative shrink-0 text-[#f20312] text-[28px] sm:text-[40px] md:text-[56px] lg:text-[72px] tracking-[-0.9px] w-full" style={{ fontWeight: 600 }}>
            {t.mainHeader}
          </p>
          <p className="font-['Inter',sans-serif] leading-[1.375] relative shrink-0 text-[#46464e] text-[16px] sm:text-[22px] md:text-[24px] lg:text-[36px] tracking-[-0.6px] w-full">
            {t.subHeader}
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0 w-full max-w-[512px]">
          <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0 w-full">
            <div className="bg-white h-[48px] md:h-[56px] lg:h-[64px] relative rounded-[12px] shrink-0 w-full">
              <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  className="font-['Fira_Sans',sans-serif] leading-[1.375] text-[#292932] text-[16px] md:text-[20px] lg:text-[24px] tracking-[-0.3px] w-full h-full px-[16px] md:px-[24px] bg-transparent outline-none placeholder:text-[#98989f]"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute border border-[#efeff0] border-solid inset-0 pointer-events-none rounded-[12px]"
              />
            </div>
            <label className="flex items-start gap-[10px] w-full cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => onConsentChange(e.target.checked)}
                className="mt-[3px] h-[16px] w-[16px] shrink-0 accent-[#f20312] cursor-pointer"
              />
              <span className="font-['Inter',sans-serif] leading-[1.5] text-[#686873] text-[12px] tracking-[-0.15px]">
                {t.consentLabel}
              </span>
            </label>
            <button
              onClick={handleStart}
              disabled={!canStart || isSubmitting}
              className="bg-[#f20312] content-stretch flex h-[48px] md:h-[56px] lg:h-[64px] items-center justify-center overflow-clip relative rounded-[12px] shadow-[0px_32px_16px_0px_rgba(199,0,13,0.02),0px_16px_16px_0px_rgba(199,0,13,0.04),0px_12px_12px_0px_rgba(199,0,13,0.12),0px_4px_8px_0px_rgba(199,0,13,0.16)] shrink-0 w-full cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="size-[24px] animate-spin" viewBox="0 0 50 50" fill="none">
                  <circle cx="25" cy="25" r="20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 200" strokeDashoffset="-35" />
                </svg>
              ) : (
                <p className="font-['Fira_Sans',sans-serif] leading-[1.375] not-italic relative shrink-0 text-[16px] md:text-[20px] lg:text-[24px] text-center text-white tracking-[-0.3px] whitespace-nowrap" style={{ fontWeight: 600 }}>
                  {t.startButton}
                </p>
              )}
            </button>
          </div>

          {/* Error Toast */}
          {errorVisible && (
            <div className="w-full rounded-[12px] bg-[#292932] px-4 py-3 text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
              <p className="font-['Fira_Sans',sans-serif] text-[14px] text-white tracking-[-0.15px]" style={{ fontWeight: 500 }}>
                {sub.errorText}
              </p>
            </div>
          )}
          <p className="font-['Inter',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#686873] text-[12px] text-center tracking-[-0.15px] w-full">
            {t.footerOne.text}{" "}
            <a href={t.footerOne.termsUrl} target="_blank" rel="noopener noreferrer" className="brand-link">{t.footerOne.termsLabel}</a>
            {" ja "}
            <a href={t.footerOne.privacyUrl} target="_blank" rel="noopener noreferrer" className="brand-link">{t.footerOne.privacyLabel}</a>.
          </p>
          <p className="font-['Inter',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#686873] text-[12px] text-center tracking-[-0.15px] w-full">
            {t.footerTwo.text}{" "}
            <a href={t.footerTwo.linkUrl} target="_blank" rel="noopener noreferrer" className="brand-link">
              {t.footerTwo.linkLabel}
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
