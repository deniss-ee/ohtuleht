import { useMemo } from "react";
import svgPaths from "../../imports/svg-hptl9jy7z2";
import { imgGroup } from "../../imports/svg-w3lek";
import APP_CONTENT, { getOutroTier } from "../config/content";

const t = APP_CONTENT.outroScreen;

interface ResultScreenProps {
  score: number;
  onPlayAgain: () => void;
}

export function ResultScreen({ score, onPlayAgain }: ResultScreenProps) {
  const tier = useMemo(() => getOutroTier(score), [score]);

  return (
    <div className="outro-screen-shell bg-[#f7f7f7] relative size-full select-none flex items-center justify-center" data-name="Outro">
      <div className="outro-screen-content content-stretch flex flex-col gap-8 sm:gap-12 md:gap-16 lg:gap-[96px] items-center justify-center w-full max-w-[823px] px-5 md:px-8 lg:px-0 py-8 md:py-0">
        <div className="intro-outro-logo h-[24px] md:h-[48px] overflow-clip relative shrink-0 w-[126px] md:w-[252px]" data-name="Logo / Ohtuleht">
          <div className="absolute contents inset-0">
            <div
              className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[336px_64px]"
              style={{ maskImage: `url('${imgGroup}')` }}
            >
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 252 48.0001">
                <g>
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
        
        {/* Text content container with relative positioning for invisible blocker */}
        <div className="intro-outro-text-stack content-stretch flex flex-col gap-3 md:gap-[24px] items-center justify-center not-italic relative shrink-0 text-center w-full">
          <div className="intro-outro-main-header content-stretch flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-[24px] items-center justify-center leading-[1.25] relative shrink-0 text-[32px] sm:text-[40px] md:text-[56px] lg:text-[72px] tracking-[-0.9px] w-full">
            <p className="font-['Fira_Sans',sans-serif] relative shrink-0 text-[#292932]">{t.scoreLabel}</p>
            <p className="font-['Fira_Sans',sans-serif] relative shrink-0 text-[#f20312]" style={{ fontWeight: 600 }}>
              {score}
            </p>
          </div>
          <p className="intro-outro-sub-header font-['Inter',sans-serif] leading-[1.375] relative shrink-0 text-[#46464e] text-[16px] sm:text-[22px] md:text-[32px] lg:text-[48px] tracking-[-0.6px] w-full">
            {tier.header}
          </p>
          <p className="intro-outro-sub-header-small font-['Inter',sans-serif] leading-[1.375] relative shrink-0 text-[#46464e] text-[14px] sm:text-[16px] md:text-[20px] lg:text-[28px] tracking-[-0.4px] w-full">
            {tier.subHeader}
          </p>
          
          {/* INVISIBLE TEXT SELECTION BLOCKER - positioned above text, below button */}
          <div className="absolute inset-0 z-[1] pointer-events-none" />
        </div>
        
        <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0 w-full max-w-[512px] z-[2]">
          <a
            href={t.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#f20312] content-stretch flex h-[48px] md:h-[56px] lg:h-[64px] items-center justify-center overflow-clip relative rounded-[12px] shadow-[0px_32px_16px_0px_rgba(199,0,13,0.02),0px_16px_16px_0px_rgba(199,0,13,0.04),0px_12px_12px_0px_rgba(199,0,13,0.12),0px_4px_8px_0px_rgba(199,0,13,0.16)] shrink-0 w-full no-underline"
          >
            <p className="font-['Fira_Sans',sans-serif] leading-[1.375] not-italic relative shrink-0 text-[16px] md:text-[20px] lg:text-[24px] text-center text-white tracking-[-0.3px] whitespace-nowrap" style={{ fontWeight: 600 }}>
              {t.ctaButton}
            </p>
          </a>
        </div>

        <div className="content-stretch flex flex-col items-center justify-center text-center w-full -mt-4 sm:-mt-8 md:-mt-12 lg:-mt-[72px]">
          <p className="font-['Fira_Sans',sans-serif] leading-[1.25] relative shrink-0 text-[#f20312] text-[16px] sm:text-[22px] md:text-[32px] lg:text-[48px] tracking-[-0.6px] w-full" style={{ fontWeight: 700 }}>
            {t.bottomHeader}
          </p>
        </div>
      </div>
    </div>
  );
}