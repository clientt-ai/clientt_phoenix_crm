// AI Insights & Recommendations Component
// Node ID: 98:1321
// Description: AI-powered insights and recommendations section

// Hero Icons mapping for Phoenix LiveView implementation:
// imgIcon (light bulb - header) → Use: <.icon name="hero-light-bulb" class="size-5 text-white" />
// imgIcon1 (chart bar square) → Use: <.icon name="hero-chart-bar-square" class="size-6 text-blue-600" />
// imgIcon2 (light bulb) → Use: <.icon name="hero-light-bulb" class="size-6 text-pink-600" />
// imgIcon3 (trending up) → Use: <.icon name="hero-arrow-trending-up" class="size-6 text-teal-600" />

const imgIcon = "hero-light-bulb";
const imgIcon1 = "hero-chart-bar-square";
const imgIcon2 = "hero-light-bulb";
const imgIcon3 = "hero-arrow-trending-up";

export default function AIInsights() {
  // Sample insights data
  const insights = [
    {
      id: 1,
      type: "Top Performing Form",
      icon: imgIcon1,
      iconBg: "#dbeafe", // blue-100
      badge: { value: 847, change: "+4.3%" },
      message: "Product Inquiry Form is your highest converter with 847 submissions this month"
    },
    {
      id: 2,
      type: "Optimization Suggestion",
      icon: imgIcon2,
      iconBg: "#fce7f3", // pink-100
      badge: null,
      message: "Consider adding a progress indicator to your Contact Form - multi-step forms show 31% higher completion rates"
    },
    {
      id: 3,
      type: "Engagement Trend",
      icon: imgIcon3,
      iconBg: "#cbfbf1", // teal-100
      badge: null,
      message: "Mobile submissions increased by 42% this week. Your forms are mobile-optimized and performing well"
    }
  ];

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative size-full" data-name="AIInsightsCards" data-node-id="98:1321">
      {/* Section Header */}
      <div className="content-stretch flex gap-[8px] h-[32px] items-center relative shrink-0 w-full" data-name="Container" data-node-id="98:1322">
        <div className="bg-[#2278c0] relative rounded-[8px] shrink-0 size-[32px]" data-name="Container" data-node-id="98:1323">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[32px]">
            <div className="relative shrink-0 size-[20px]" data-name="Icon" data-node-id="98:1324">
              <img alt="" className="block max-w-none size-full" src={imgIcon} />
            </div>
          </div>
        </div>
        <div className="h-[24px] relative shrink-0 w-[238.031px]" data-name="Heading 3" data-node-id="98:1329">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[238.031px]">
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1330">{`AI Insights & Recommendations`}</p>
          </div>
        </div>
      </div>

      {/* Insights Cards Container */}
      <div className="h-[324px] relative shrink-0 w-full" data-name="Container" data-node-id="98:1331">
        {/* Insight Card 1: Top Performing Form */}
        <div className="absolute bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col h-[97.333px] items-start left-0 pb-[0.667px] pl-[24.667px] pr-[0.667px] pt-[24.667px] rounded-[16px] top-0 w-[1572px]" data-name="Card" data-node-id="98:1332">
          <div className="h-[48px] relative shrink-0 w-[1522.67px]" data-name="InsightCard" data-node-id="98:1333">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[48px] items-start relative w-[1522.67px]">
              {/* Icon */}
              <div className="bg-blue-100 relative rounded-[2.23696e+07px] shrink-0 size-[48px]" data-name="AIInsightsCards" data-node-id="98:1334">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[48px]">
                  <div className="relative shrink-0 size-[24px]" data-name="Icon" data-node-id="98:1335">
                    <img alt="" className="block max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="basis-0 grow h-[48px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="98:1338">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[48px] items-start relative w-full">
                  <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container" data-node-id="98:1339">
                    <div className="h-[20px] relative shrink-0 w-[139.188px]" data-name="Paragraph" data-node-id="98:1340">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[139.188px]">
                        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1341">
                          Top Performing Form
                        </p>
                      </div>
                    </div>
                    <div className="h-[20px] relative shrink-0 w-[71.125px]" data-name="Container" data-node-id="98:1342">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20px] items-center relative w-[71.125px]">
                        <div className="h-[20px] relative shrink-0 w-[25.615px]" data-name="Text" data-node-id="98:1343">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[25.615px]">
                            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1344">
                              847
                            </p>
                          </div>
                        </div>
                        <div className="h-[20px] relative shrink-0 w-[41.51px]" data-name="Text" data-node-id="98:1345">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[41.51px]">
                            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#00c950] text-[14px] top-[0.33px] w-[42px]" data-node-id="98:1346">
                              +4.3%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1347">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1348">
                      Product Inquiry Form is your highest converter with 847 submissions this month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Card 2: Optimization Suggestion */}
        <div className="absolute bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col h-[97.333px] items-start left-0 pb-[0.667px] pl-[24.667px] pr-[0.667px] pt-[24.667px] rounded-[16px] top-[113.33px] w-[1572px]" data-name="Card" data-node-id="98:1349">
          <div className="h-[48px] relative shrink-0 w-[1522.67px]" data-name="InsightCard" data-node-id="98:1350">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[48px] items-start relative w-[1522.67px]">
              <div className="bg-pink-100 relative rounded-[2.23696e+07px] shrink-0 size-[48px]" data-name="AIInsightsCards" data-node-id="98:1351">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[48px]">
                  <div className="relative shrink-0 size-[24px]" data-name="Icon" data-node-id="98:1352">
                    <img alt="" className="block max-w-none size-full" src={imgIcon2} />
                  </div>
                </div>
              </div>
              <div className="basis-0 grow h-[48px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="98:1356">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[48px] relative w-full">
                  <div className="absolute h-[20px] left-0 top-0 w-[162.021px]" data-name="Paragraph" data-node-id="98:1357">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1358">
                      Optimization Suggestion
                    </p>
                  </div>
                  <div className="absolute h-[20px] left-0 top-[28px] w-[1458.67px]" data-name="Paragraph" data-node-id="98:1359">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1360">
                      Consider adding a progress indicator to your Contact Form - multi-step forms show 31% higher completion rates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Card 3: Engagement Trend */}
        <div className="absolute bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col h-[97.333px] items-start left-0 pb-[0.667px] pl-[24.667px] pr-[0.667px] pt-[24.667px] rounded-[16px] top-[226.67px] w-[1572px]" data-name="Card" data-node-id="98:1361">
          <div className="h-[48px] relative shrink-0 w-[1522.67px]" data-name="InsightCard" data-node-id="98:1362">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[48px] items-start relative w-[1522.67px]">
              <div className="bg-[#cbfbf1] relative rounded-[2.23696e+07px] shrink-0 size-[48px]" data-name="AIInsightsCards" data-node-id="98:1363">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[48px]">
                  <div className="relative shrink-0 size-[24px]" data-name="Icon" data-node-id="98:1364">
                    <img alt="" className="block max-w-none size-full" src={imgIcon3} />
                  </div>
                </div>
              </div>
              <div className="basis-0 grow h-[48px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="98:1369">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[48px] relative w-full">
                  <div className="absolute h-[20px] left-0 top-0 w-[125.427px]" data-name="Paragraph" data-node-id="98:1370">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1371">
                      Engagement Trend
                    </p>
                  </div>
                  <div className="absolute h-[20px] left-0 top-[28px] w-[1458.67px]" data-name="Paragraph" data-node-id="98:1372">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1373">
                      Mobile submissions increased by 42% this week. Your forms are mobile-optimized and performing well
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export sample insights data for Phoenix LiveView
export const sampleInsightsData = [
  {
    id: 1,
    type: "Top Performing Form",
    icon_class: "trending-up",
    icon_bg: "#dbeafe",
    badge_value: 847,
    badge_change: "+4.3%",
    message: "Product Inquiry Form is your highest converter with 847 submissions this month"
  },
  {
    id: 2,
    type: "Optimization Suggestion",
    icon_class: "lightbulb",
    icon_bg: "#fce7f3",
    badge_value: null,
    badge_change: null,
    message: "Consider adding a progress indicator to your Contact Form - multi-step forms show 31% higher completion rates"
  },
  {
    id: 3,
    type: "Engagement Trend",
    icon_class: "trending-up",
    icon_bg: "#cbfbf1",
    badge_value: null,
    badge_change: null,
    message: "Mobile submissions increased by 42% this week. Your forms are mobile-optimized and performing well"
  }
];
