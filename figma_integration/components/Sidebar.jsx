// Sidebar Navigation Component
// Node ID: 98:1374
// Description: Left sidebar with logo, navigation menu, and user profile

// Hero Icons mapping for Phoenix LiveView implementation:
// imgImageClientt (logo) → Use: ~p"/images/clientt-logo.png"
// imgIcon (dashboard - active) → Use: <.icon name="hero-home-solid" class="size-5" />
// imgIcon1 (forms) → Use: <.icon name="hero-document" class="size-5" />
// imgIcon2 (landing pages) → Use: <.icon name="hero-document-duplicate" class="size-5" />
// imgIcon3 (analytics) → Use: <.icon name="hero-chart-bar" class="size-5" />
// imgIcon4 (settings) → Use: <.icon name="hero-cog-6-tooth" class="size-5" />

const imgImageClientt = "/images/clientt-logo.png";
const imgIcon = "hero-home-solid";
const imgIcon1 = "hero-document";
const imgIcon2 = "hero-document-duplicate";
const imgIcon3 = "hero-chart-bar";
const imgIcon4 = "hero-cog-6-tooth";

export default function Sidebar() {
  return (
    <div className="bg-white border-[#eeeeee] border-[0px_0.667px_0px_0px] border-solid relative size-full" data-name="Sidebar" data-node-id="98:1374">
      {/* Logo Section */}
      <div className="absolute border-[#eeeeee] border-[0px_0px_0.667px] border-solid box-border content-stretch flex flex-col h-[80.667px] items-start left-0 pb-[0.667px] pl-[24px] pr-[148.135px] pt-[24px] top-0 w-[255.333px]" data-name="Container" data-node-id="98:1375">
        <div className="h-[32px] relative shrink-0 w-full" data-name="Image (Clientt)" data-node-id="98:1376">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImageClientt} />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="absolute h-[272px] left-[16px] top-[96.67px] w-[223.333px]" data-name="List" data-node-id="98:1377">
        {/* Dashboard (Active) */}
        <div className="absolute h-[48px] left-0 top-0 w-[223.333px]" data-name="List Item" data-node-id="98:1378">
          <div className="absolute bg-[#2278c0] box-border content-stretch flex gap-[12px] h-[48px] items-center left-0 pl-[16px] pr-0 py-0 rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(34,120,192,0.3),0px_4px_6px_-4px_rgba(34,120,192,0.3)] top-0 w-[223.333px]" data-name="Button" data-node-id="98:1379">
            <div className="relative shrink-0 size-[20px]" data-name="Icon" data-node-id="98:1380">
              <img alt="" className="block max-w-none size-full" src={imgIcon} />
            </div>
            <div className="h-[24px] relative shrink-0 w-[82.458px]" data-name="Text" data-node-id="98:1385">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[82.458px]">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-white top-[-1px] whitespace-pre" data-node-id="98:1386">
                  Dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="absolute h-[48px] left-0 top-[56px] w-[223.333px]" data-name="List Item" data-node-id="98:1387">
          <div className="absolute box-border content-stretch flex gap-[12px] h-[48px] items-center left-0 pl-[16px] pr-0 py-0 rounded-[8px] top-0 w-[223.333px]" data-name="Button" data-node-id="98:1388">
            <div className="relative shrink-0 size-[20px]" data-name="Icon" data-node-id="98:1389">
              <img alt="" className="block max-w-none size-full" src={imgIcon1} />
            </div>
            <div className="h-[24px] relative shrink-0 w-[46.531px]" data-name="Text" data-node-id="98:1395">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[46.531px]">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1396">
                  Forms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Landing Pages */}
        <div className="absolute h-[48px] left-0 top-[112px] w-[223.333px]" data-name="List Item" data-node-id="98:1397">
          <div className="absolute box-border content-stretch flex gap-[12px] h-[48px] items-center left-0 pl-[16px] pr-0 py-0 rounded-[8px] top-0 w-[223.333px]" data-name="Button" data-node-id="98:1398">
            <div className="relative shrink-0 size-[20px]" data-name="Icon" data-node-id="98:1399">
              <img alt="" className="block max-w-none size-full" src={imgIcon2} />
            </div>
            <div className="h-[24px] relative shrink-0 w-[111.344px]" data-name="Text" data-node-id="98:1403">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[111.344px]">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1404">
                  Landing Pages
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="absolute h-[48px] left-0 top-[168px] w-[223.333px]" data-name="List Item" data-node-id="98:1405">
          <div className="absolute box-border content-stretch flex gap-[12px] h-[48px] items-center left-0 pl-[16px] pr-0 py-0 rounded-[8px] top-0 w-[223.333px]" data-name="Button" data-node-id="98:1406">
            <div className="relative shrink-0 size-[20px]" data-name="Icon" data-node-id="98:1407">
              <img alt="" className="block max-w-none size-full" src={imgIcon3} />
            </div>
            <div className="h-[24px] relative shrink-0 w-[68.823px]" data-name="Text" data-node-id="98:1412">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[68.823px]">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1413">
                  Analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="absolute h-[48px] left-0 top-[224px] w-[223.333px]" data-name="List Item" data-node-id="98:1414">
          <div className="absolute box-border content-stretch flex gap-[12px] h-[48px] items-center left-0 pl-[16px] pr-0 py-0 rounded-[8px] top-0 w-[223.333px]" data-name="Button" data-node-id="98:1415">
            <div className="relative shrink-0 size-[20px]" data-name="Icon" data-node-id="98:1416">
              <img alt="" className="block max-w-none size-full" src={imgIcon4} />
            </div>
            <div className="h-[24px] relative shrink-0 w-[62.438px]" data-name="Text" data-node-id="98:1419">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[62.438px]">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1420">
                  Settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="absolute border-[#eeeeee] border-[0.667px_0px_0px] border-solid box-border content-stretch flex flex-col h-[96.667px] items-start left-0 pb-0 pt-[16.667px] px-[16px] top-[770px] w-[255.333px]" data-name="Container" data-node-id="98:1421">
        <div className="bg-[#f8f8f8] box-border content-stretch flex gap-[12px] h-[64px] items-center px-[16px] py-0 relative rounded-[8px] shrink-0 w-full" data-name="Container" data-node-id="98:1422">
          <div className="bg-gradient-to-b from-[#2278c0] relative rounded-[2.23696e+07px] shrink-0 size-[40px] to-[#f43098]" data-name="Container" data-node-id="98:1423">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[40px]">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" data-node-id="98:1424">
                JD
              </p>
            </div>
          </div>
          <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="98:1425">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
              <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1426">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1427">
                  John Doe
                </p>
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1428">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-900 top-[0.67px] whitespace-pre" data-node-id="98:1429">
                  Pro Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
