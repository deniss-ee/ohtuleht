import svgPaths from "./svg-1qqx5qmr7m";
import imgIllustration1 from "figma:asset/6f9ec8d8d3d39e65d251276be590171d5eede992.png";
import imgInboxTray11 from "figma:asset/20dff83bbc3fe6830a38fb2c747714b38ec88609.png";
import imgRolledUpNewspaper11 from "figma:asset/90c25fd743cfd4f4a7e309e7c2ac05d9be13fc07.png";
import imgNewspaperEmoji11 from "figma:asset/eb77a48e53eac5f6a6736eb4a4ff47cb98de0842.png";

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}

function Image() {
  return (
    <Wrapper>
      <g id="image 3">
        <path d={svgPaths.p3e52c880} fill="var(--fill-0, #FFB8BC)" id="Vector" />
      </g>
    </Wrapper>
  );
}

export default function Frame() {
  return (
    <div className="bg-white border border-[#dfdfe2] border-solid overflow-clip relative rounded-[16px] size-full">
      <div className="absolute content-stretch flex gap-[8px] items-center leading-[1.5] left-[31px] not-italic text-[24px] top-[31px] whitespace-nowrap" data-name="Container">
        <p className="font-['Fira_Sans:Regular',sans-serif] relative shrink-0 text-[#53535a] tracking-[-0.3px]">Punktid:</p>
        <p className="font-['Fira_Sans:Bold',sans-serif] relative shrink-0 text-[#f20312]">0</p>
      </div>
      <div className="absolute content-stretch flex gap-[8px] items-center justify-end right-[31px] top-[31px]" data-name="Label and Icons Container">
        <p className="font-['Fira_Sans:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#53535a] text-[24px] tracking-[-0.3px] whitespace-nowrap">Elud:</p>
        <div className="content-stretch flex items-center relative shrink-0" data-name="Icons Container">
          <Wrapper>
            <g id="image 2">
              <path d={svgPaths.p3e52c880} fill="var(--fill-0, #F20312)" id="Vector" />
            </g>
          </Wrapper>
          <Image />
          <Image />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bottom-[-1px] h-[725px] left-1/2 w-[600px]" data-name="Illustration 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIllustration1} />
      </div>
      <div className="-translate-x-1/2 absolute bottom-[-1px] left-1/2 size-[192px]" data-name="inbox-tray 1 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgInboxTray11} />
      </div>
      <div className="absolute left-[155px] size-[96px] top-[288px]" data-name="rolled-up-newspaper 1 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRolledUpNewspaper11} />
      </div>
      <div className="absolute left-[347px] size-[96px] top-[351px]" data-name="newspaper-emoji 1 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgNewspaperEmoji11} />
      </div>
    </div>
  );
}