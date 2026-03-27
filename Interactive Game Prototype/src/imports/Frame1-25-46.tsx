import svgPaths from "./svg-e1lcuzjlyy";
import imgBg1 from "figma:asset/bbaf13cd8c71b44f152d6c1e5d2665bb3bef2f61.png";
import imgEye1 from "figma:asset/fdb3780b83284206df830d8179cedfba4b63215a.png";
import imgNewspaper1 from "figma:asset/5c0d3e5dc22b81c08c1e3b563f56c73e9f38b973.png";

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
      <div className="-translate-x-1/2 absolute bottom-[-1px] h-[484px] left-1/2 w-[600px]" data-name="bg 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBg1} />
      </div>
      <div className="absolute left-[299px] size-[135px] top-[94px]" data-name="eye 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgEye1} />
      </div>
      <div className="-translate-x-1/2 absolute bottom-[-1px] left-1/2 size-[180px]" data-name="newspaper 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgNewspaper1} />
      </div>
    </div>
  );
}