import svgPaths from "./svg-hptl9jy7z2";
import { imgGroup } from "./svg-w3lek";

export default function Outro() {
  return (
    <div className="bg-[#f7f7f7] relative size-full" data-name="Outro">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[96px] items-center justify-center left-[calc(50%+0.5px)] top-1/2 w-[823px]" data-name="Content Container">
        <div className="h-[48px] overflow-clip relative shrink-0 w-[252px]" data-name="Logo / Ohtuleht">
          <div className="absolute contents inset-0" data-name="Clip path group">
            <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[336px_64px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 252 48.0001">
                <g id="Group">
                  <path d={svgPaths.p2f0a4d00} fill="var(--fill-0, #F20312)" id="Vector" />
                  <path d={svgPaths.p6b12800} fill="var(--fill-0, #F20312)" id="Vector_2" />
                  <path d={svgPaths.p20025b80} fill="var(--fill-0, #F20312)" id="Vector_3" />
                  <path d={svgPaths.p9059200} fill="var(--fill-0, #F20312)" id="Vector_4" />
                  <path d={svgPaths.p12833700} fill="var(--fill-0, #F20312)" id="Vector_5" />
                  <path d={svgPaths.pbe80200} fill="var(--fill-0, #F20312)" id="Vector_6" />
                  <path d={svgPaths.p24778c00} fill="var(--fill-0, #F20312)" id="Vector_7" />
                  <path d={svgPaths.p815f9f0} fill="var(--fill-0, #F20312)" id="Vector_8" />
                  <path d={svgPaths.pad98080} fill="var(--fill-0, #F20312)" id="Vector_9" />
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-center justify-center not-italic relative shrink-0 text-center w-full" data-name="Description Container">
          <div className="content-stretch flex gap-[24px] items-center justify-center leading-[1.25] relative shrink-0 text-[72px] tracking-[-0.9px] w-full whitespace-nowrap">
            <p className="font-['Fira_Sans:Regular',sans-serif] relative shrink-0 text-[#292932]">Your score:</p>
            <p className="font-['Fira_Sans:SemiBold',sans-serif] relative shrink-0 text-[#f20312]">100</p>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.375] relative shrink-0 text-[#46464e] text-[48px] tracking-[-0.6px] w-full">Suurepärane tulemus! Oota reedeni, et teada saada, kas sa võitsid seekord</p>
        </div>
        <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-[512px]" data-name="Form Container">
          <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Email and Button Container">
            <div className="bg-[#f20312] content-stretch flex h-[64px] items-center justify-center overflow-clip relative rounded-[12px] shadow-[0px_32px_16px_0px_rgba(199,0,13,0.02),0px_16px_16px_0px_rgba(199,0,13,0.04),0px_12px_12px_0px_rgba(199,0,13,0.12),0px_4px_8px_0px_rgba(199,0,13,0.16)] shrink-0 w-full" data-name="Button Container">
              <p className="font-['Fira_Sans:SemiBold',sans-serif] leading-[1.375] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[-0.3px] whitespace-nowrap">LOE ÕHTULEHTE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}