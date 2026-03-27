import svgPaths from "./svg-9sl8t3xpyu";
import { imgGroup } from "./svg-354k6";

export default function GameIntro() {
  return (
    <div className="bg-[#f7f7f7] relative size-full" data-name="Game Intro">
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
          <p className="font-['Fira_Sans:SemiBold',sans-serif] leading-[1.25] relative shrink-0 text-[#f20312] text-[72px] tracking-[-0.9px] w-full">Mängi ja võida auhindu!</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.375] relative shrink-0 text-[#46464e] text-[48px] tracking-[-0.6px] w-full">Igal nädalal loositab Õhtuleht kõigi osalejate vahel välja auhindu! Mängi, korja ajalehti ja proovi õnne.</p>
        </div>
        <div className="content-stretch flex flex-col gap-[16px] items-center justify-center relative shrink-0 w-[512px]" data-name="Form Container">
          <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0 w-full" data-name="Email and Button Container">
            <div className="bg-white h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="Email Input Container">
              <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center px-[24px] relative size-full">
                  <p className="font-['Fira_Sans:Regular',sans-serif] leading-[1.375] not-italic relative shrink-0 text-[#98989f] text-[24px] text-center tracking-[-0.3px] whitespace-nowrap">E-mail</p>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#efeff0] border-solid inset-0 pointer-events-none rounded-[12px]" />
            </div>
            <div className="bg-[#f20312] content-stretch flex h-[64px] items-center justify-center overflow-clip relative rounded-[12px] shadow-[0px_32px_16px_0px_rgba(199,0,13,0.02),0px_16px_16px_0px_rgba(199,0,13,0.04),0px_12px_12px_0px_rgba(199,0,13,0.12),0px_4px_8px_0px_rgba(199,0,13,0.16)] shrink-0 w-full" data-name="Button Container">
              <p className="font-['Fira_Sans:SemiBold',sans-serif] leading-[1.375] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[-0.3px] whitespace-nowrap">ALUSTAN</p>
            </div>
          </div>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] not-italic relative shrink-0 text-[#686873] text-[12px] text-center tracking-[-0.15px] w-full">Alustamiseks palun sisestage oma e-posti aadress, et saaksime teiega võidu korral ühendust võtta. Mängu alustades nõustute automaatselt meie kirjastuse kõigi reeglite ja tingimustega.</p>
        </div>
      </div>
    </div>
  );
}