// Header Component
// Node ID: 98:1432
// Description: Top header with search and user actions

// Hero Icons mapping for Phoenix LiveView implementation:
// imgPrimitiveImg (avatar) → Use: ~p"/images/avatar-placeholder.png"
// imgVector (menu bars) → Use: <.icon name="hero-bars-3" class="size-5" />
// imgIcon (search) → Use: <.icon name="hero-magnifying-glass" class="size-4" />
// imgIcon1 (help) → Use: <.icon name="hero-question-mark-circle" class="size-5" />
// imgIcon2 (notifications) → Use: <.icon name="hero-bell" class="size-5" />

const imgPrimitiveImg = "/images/avatar-placeholder.png";
const imgVector = "hero-bars-3";
const imgIcon = "hero-magnifying-glass";
const imgIcon1 = "hero-question-mark-circle";
const imgIcon2 = "hero-bell";

export default function Header() {
  return (
    <div className="bg-white border-[0px_0px_0.667px] border-black border-solid box-border content-stretch flex items-center justify-between pb-[0.667px] pt-0 px-[24px] relative size-full" data-name="Header" data-node-id="98:1432">
      <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="98:1433">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-full">
          {/* Menu Button */}
          <div className="absolute box-border content-stretch flex flex-col items-start left-0 pb-0 pt-[8px] px-[8px] rounded-[8px] size-[36px] top-0" data-name="Button" data-node-id="98:1434">
            <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon" data-node-id="98:1435">
              <div className="absolute inset-[20.83%_16.67%_79.17%_16.67%]" data-name="Vector" data-node-id="98:1436">
                <div className="absolute inset-[-0.83px_-6.25%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector} />
                </div>
              </div>
              <div className="absolute bottom-1/2 left-[16.67%] right-[16.67%] top-1/2" data-name="Vector" data-node-id="98:1437">
                <div className="absolute inset-[-0.83px_-6.25%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector} />
                </div>
              </div>
              <div className="absolute inset-[79.17%_16.67%_20.83%_16.67%]" data-name="Vector" data-node-id="98:1438">
                <div className="absolute inset-[-0.83px_-6.25%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector} />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="absolute h-[36px] left-[52px] top-0 w-[524px]" data-name="Container" data-node-id="98:1439">
            <div className="absolute bg-[#f8f8f8] border-[#f8f8f8] border-[0.667px] border-solid h-[36px] left-0 rounded-[4px] top-0 w-[524px]" data-name="Input" data-node-id="98:1440">
              <div className="box-border content-stretch flex h-[36px] items-center overflow-clip pl-[40px] pr-[12px] py-[4px] relative rounded-[inherit] w-[524px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900 whitespace-pre" data-node-id="98:1441">
                  Search forms, pages, analytics...
                </p>
              </div>
            </div>
            <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Icon" data-node-id="98:1442">
              <img alt="" className="block max-w-none size-full" src={imgIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="h-[36px] relative shrink-0 w-[124px]" data-name="Container" data-node-id="98:1445">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[124px]">
          {/* Help Button */}
          <div className="absolute content-stretch flex items-center justify-center left-0 rounded-[4px] size-[36px] top-0" data-name="Button" data-node-id="98:1446">
            <div className="relative shrink-0 size-[16px]" data-name="Icon" data-node-id="98:1447">
              <img alt="" className="block max-w-none size-full" src={imgIcon1} />
            </div>
          </div>

          {/* Notifications Button with Badge */}
          <div className="absolute left-[44px] rounded-[8px] size-[36px] top-0" data-name="Button" data-node-id="98:1449">
            <div className="absolute left-[8px] size-[20px] top-[8px]" data-name="Icon" data-node-id="98:1450">
              <img alt="" className="block max-w-none size-full" src={imgIcon2} />
            </div>
            <div className="absolute bg-[#f43098] left-[24px] rounded-[2.23696e+07px] size-[8px] top-[4px]" data-name="Text" data-node-id="98:1453" />
          </div>

          {/* User Avatar */}
          <div className="absolute bg-[rgba(255,255,255,0)] box-border content-stretch flex items-start left-[88px] overflow-clip rounded-[2.23696e+07px] shadow-[0px_0px_0px_2px_rgba(0,0,0,0)] size-[36px] top-0" data-name="Primitive.span" data-node-id="98:1454">
            <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Primitive.img" data-node-id="98:1455">
              <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid box-border inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPrimitiveImg} />
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
