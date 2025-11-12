// KPI Cards Component
// Node ID: 98:982
// Description: 4-column grid of KPI metric cards

// Hero Icons mapping for Phoenix LiveView implementation:
// imgIcon (trend indicator) → Use: <.icon name="hero-arrow-trending-up-mini" class="size-4 text-green-500" />
// imgIcon1 (total forms) → Use: <.icon name="hero-document-text" class="size-8 text-white" />
// imgIcon2 (total submissions) → Use: <.icon name="hero-paper-airplane" class="size-8 text-white" />
// imgIcon3 (active users) → Use: <.icon name="hero-user-group" class="size-8 text-white" />
// imgIcon4 (conversion rate) → Use: <.icon name="hero-arrow-trending-up" class="size-8 text-white" />

const imgIcon = "hero-arrow-trending-up-mini";
const imgIcon1 = "hero-document-text";
const imgIcon2 = "hero-paper-airplane";
const imgIcon3 = "hero-user-group";
const imgIcon4 = "hero-arrow-trending-up";

export default function KPICards() {
  return (
    <div className="gap-[24px] grid grid-cols-[repeat(4,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] relative size-full" data-name="Container" data-node-id="98:982">
      {/* Card 1: Total Forms */}
      <div className="[grid-area:1_/_1] bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col h-[129.333px] items-start pl-[24.667px] pr-[0.667px] py-[24.667px] relative rounded-[16px] shrink-0" data-name="Card" data-node-id="98:983">
        <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[325.667px]" data-name="KPICard" data-node-id="98:984">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-start justify-between relative w-[325.667px]">
            <div className="basis-0 grow h-[80px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="98:985">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[80px] items-start relative w-full">
                <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:986">
                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:987">
                    Total Forms
                  </p>
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:988">
                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:989">
                    156
                  </p>
                </div>
                <div className="content-stretch flex gap-[4px] h-[20px] items-center relative shrink-0 w-full" data-name="Container" data-node-id="98:990">
                  <div className="relative shrink-0 size-[16px]" data-name="Icon" data-node-id="98:991">
                    <img alt="" className="block max-w-none size-full" src={imgIcon} />
                  </div>
                  <div className="h-[20px] relative shrink-0 w-[35.583px]" data-name="Text" data-node-id="98:994">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[35.583px]">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#00c950] text-[14px] top-[0.33px] w-[36px]" data-node-id="98:995">
                        +12%
                      </p>
                    </div>
                  </div>
                  <div className="h-[16px] relative shrink-0 w-[76.167px]" data-name="Text" data-node-id="98:996">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[76.167px]">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-900 top-[0.67px] whitespace-pre" data-node-id="98:997">
                        vs last month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#2278c0] relative rounded-[16px] shrink-0 size-[64px]" data-name="Container" data-node-id="98:998">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[64px]">
                <div className="relative shrink-0 size-[32px]" data-name="Icon" data-node-id="98:999">
                  <img alt="" className="block max-w-none size-full" src={imgIcon1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Total Submissions */}
      <div className="[grid-area:1_/_2] bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col h-[129.333px] items-start pl-[24.667px] pr-[0.667px] py-[24.667px] relative rounded-[16px] shrink-0" data-name="Card" data-node-id="98:1005">
        <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[325.667px]" data-name="KPICard" data-node-id="98:1006">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-start justify-between relative w-[325.667px]">
            <div className="basis-0 grow h-[80px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="98:1007">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[80px] items-start relative w-full">
                <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1008">
                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1009">
                    Total Submissions
                  </p>
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1010">
                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1011">
                    3,428
                  </p>
                </div>
                <div className="content-stretch flex gap-[4px] h-[20px] items-center relative shrink-0 w-full" data-name="Container" data-node-id="98:1012">
                  <div className="relative shrink-0 size-[16px]" data-name="Icon" data-node-id="98:1013">
                    <img alt="" className="block max-w-none size-full" src={imgIcon} />
                  </div>
                  <div className="h-[20px] relative shrink-0 w-[47.594px]" data-name="Text" data-node-id="98:1016">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[47.594px]">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#00c950] text-[14px] top-[0.33px] w-[48px]" data-node-id="98:1017">
                        +18.5%
                      </p>
                    </div>
                  </div>
                  <div className="h-[16px] relative shrink-0 w-[76.167px]" data-name="Text" data-node-id="98:1018">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[76.167px]">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-900 top-[0.67px] whitespace-pre" data-node-id="98:1019">
                        vs last month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#f43098] relative rounded-[16px] shrink-0 size-[64px]" data-name="Container" data-node-id="98:1020">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[64px]">
                <div className="relative shrink-0 size-[32px]" data-name="Icon" data-node-id="98:1021">
                  <img alt="" className="block max-w-none size-full" src={imgIcon2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Active Users */}
      <div className="[grid-area:1_/_3] bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col h-[129.333px] items-start pl-[24.667px] pr-[0.667px] py-[24.667px] relative rounded-[16px] shrink-0" data-name="Card" data-node-id="98:1024">
        <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[325.667px]" data-name="KPICard" data-node-id="98:1025">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[325.667px]">
            <div className="absolute content-stretch flex flex-col gap-[8px] h-[80px] items-start left-0 top-0 w-[261.667px]" data-name="Container" data-node-id="98:1026">
              <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1027">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1028">
                  Active Users
                </p>
              </div>
              <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1029">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1030">
                  1,892
                </p>
              </div>
              <div className="content-stretch flex gap-[4px] h-[20px] items-center relative shrink-0 w-full" data-name="Container" data-node-id="98:1031">
                <div className="relative shrink-0 size-[16px]" data-name="Icon" data-node-id="98:1032">
                  <img alt="" className="block max-w-none size-full" src={imgIcon} />
                </div>
                <div className="h-[20px] relative shrink-0 w-[41.25px]" data-name="Text" data-node-id="98:1035">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[41.25px]">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#00c950] text-[14px] top-[0.33px] w-[42px]" data-node-id="98:1036">
                      +8.2%
                    </p>
                  </div>
                </div>
                <div className="h-[16px] relative shrink-0 w-[76.167px]" data-name="Text" data-node-id="98:1037">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[76.167px]">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-900 top-[0.67px] whitespace-pre" data-node-id="98:1038">
                      vs last month
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bg-[#00d3bb] content-stretch flex items-center justify-center left-[261.67px] rounded-[16px] size-[64px] top-0" data-name="Container" data-node-id="98:1039">
              <div className="relative shrink-0 size-[32px]" data-name="Icon" data-node-id="98:1040">
                <img alt="" className="block max-w-none size-full" src={imgIcon3} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Conversion Rate */}
      <div className="[grid-area:1_/_4] bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col h-[129.333px] items-start pl-[24.667px] pr-[0.667px] py-[24.667px] relative rounded-[16px] shrink-0" data-name="Card" data-node-id="98:1045">
        <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[325.667px]" data-name="KPICard" data-node-id="98:1046">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[325.667px]">
            <div className="absolute content-stretch flex flex-col gap-[8px] h-[80px] items-start left-0 top-0 w-[261.667px]" data-name="Container" data-node-id="98:1047">
              <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1048">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1049">
                  Conversion Rate
                </p>
              </div>
              <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1050">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1051">
                  68.4%
                </p>
              </div>
              <div className="content-stretch flex gap-[4px] h-[20px] items-center relative shrink-0 w-full" data-name="Container" data-node-id="98:1052">
                <div className="relative shrink-0 size-[16px]" data-name="Icon" data-node-id="98:1053">
                  <img alt="" className="block max-w-none size-full" src={imgIcon} />
                </div>
                <div className="h-[20px] relative shrink-0 w-[41.135px]" data-name="Text" data-node-id="98:1056">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[41.135px]">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#00c950] text-[14px] top-[0.33px] w-[42px]" data-node-id="98:1057">
                      +5.3%
                    </p>
                  </div>
                </div>
                <div className="h-[16px] relative shrink-0 w-[76.167px]" data-name="Text" data-node-id="98:1058">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[76.167px]">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-900 top-[0.67px] whitespace-pre" data-node-id="98:1059">
                      vs last month
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bg-violet-600 content-stretch flex items-center justify-center left-[261.67px] rounded-[16px] size-[64px] top-0" data-name="Container" data-node-id="98:1060">
              <div className="relative shrink-0 size-[32px]" data-name="Icon" data-node-id="98:1061">
                <img alt="" className="block max-w-none size-full" src={imgIcon4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
