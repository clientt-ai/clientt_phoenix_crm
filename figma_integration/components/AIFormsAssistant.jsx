// AI Forms Assistant Component
// Node ID: 98:1218
// Description: AI-powered form generation assistant card

// Hero Icons mapping for Phoenix LiveView implementation:
// imgIcon (sparkles outline) → Use: <.icon name="hero-sparkles" class="size-5 text-white" />
// imgIcon1 (sparkles solid) → Use: <.icon name="hero-sparkles-solid" class="size-4 text-white" />

const imgIcon = "hero-sparkles";
const imgIcon1 = "hero-sparkles-solid";

export default function AIFormsAssistant() {
  return (
    <div className="border-[0.667px] border-[rgba(34,120,192,0.2)] border-solid box-border content-stretch flex flex-col gap-[40px] items-start pl-[20.667px] pr-[0.667px] py-[20.667px] relative rounded-[16px] size-full" data-name="Card" data-node-id="98:1218">
      {/* Header */}
      <div className="h-[48px] relative shrink-0 w-[466.667px]" data-name="AIAssistant" data-node-id="98:1219">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[48px] items-start relative w-[466.667px]">
          {/* Icon with Gradient */}
          <div className="bg-gradient-to-b from-[#2278c0] relative rounded-[8px] shrink-0 size-[40px] to-[#ec4899]" data-name="Container" data-node-id="98:1220">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[40px]">
              <div className="relative shrink-0 size-[20px]" data-name="Icon" data-node-id="98:1221">
                <img alt="" className="block max-w-none size-full" src={imgIcon} />
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="h-[48px] relative shrink-0 w-[195.604px]" data-name="Container" data-node-id="98:1226">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[48px] items-start relative w-[195.604px]">
              <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3" data-node-id="98:1227">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1228">
                  AI Forms Assistant
                </p>
              </div>
              <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1229">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1230">
                  Generate a new form using AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input and Button */}
      <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[466.667px]" data-name="AIAssistant" data-node-id="98:1231">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[12px] h-full items-start relative w-[466.667px]">
          {/* Input Field */}
          <div className="bg-[#f8f8f8] border-[#f8f8f8] border-[0.667px] border-solid h-[36px] relative rounded-[4px] shrink-0 w-full" data-name="Input" data-node-id="98:1232">
            <div className="box-border content-stretch flex h-[36px] items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900 whitespace-pre" data-node-id="98:1233">
                e.g., Create a customer feedback form...
              </p>
            </div>
          </div>

          {/* Create Button with Gradient */}
          <div className="bg-gradient-to-b from-[#2278c0] h-[36px] relative rounded-[4px] shrink-0 to-[#ec4899] w-full" data-name="Button" data-node-id="98:1234">
            <div className="absolute left-[169.95px] size-[16px] top-[10px]" data-name="Icon" data-node-id="98:1235">
              <img alt="" className="block max-w-none size-full" src={imgIcon1} />
            </div>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[201.95px] not-italic text-[14px] text-nowrap text-white top-[8.33px] whitespace-pre" data-node-id="98:1240">
              Create with AI
            </p>
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="border-[#eeeeee] border-[0.667px_0px_0px] border-solid h-[120.667px] relative shrink-0 w-[466.667px]" data-name="AIAssistant" data-node-id="98:1241">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[120.667px] items-start pb-0 pt-[16.667px] px-0 relative w-[466.667px]">
          <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1242">
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[12px] text-nowrap text-zinc-900 top-[0.67px] whitespace-pre" data-node-id="98:1243">
              Smart Suggestions:
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[8px] h-[80px] items-start relative shrink-0 w-full" data-name="Container" data-node-id="98:1244">
            {/* Suggestion 1 */}
            <div className="bg-white h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Button" data-node-id="98:1245">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[14px] text-nowrap text-zinc-900 top-[8.33px] whitespace-pre" data-node-id="98:1246">
                📋 Event Registration Form
              </p>
            </div>
            {/* Suggestion 2 */}
            <div className="bg-white h-[36px] relative rounded-[8px] shrink-0 w-full" data-name="Button" data-node-id="98:1247">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[14px] text-nowrap text-zinc-900 top-[8.33px] whitespace-pre" data-node-id="98:1248">
                💼 Job Application Form
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
