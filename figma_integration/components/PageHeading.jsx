// Page Heading Component
// Node ID: 98:977
// Description: Dashboard title and subtitle

export default function PageHeading() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative size-full" data-name="Container" data-node-id="98:977">
      <div className="h-[57px] relative shrink-0 w-full" data-name="Heading 1" data-node-id="98:978">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[57px] left-0 not-italic text-[38px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:979">
          Dashboard Overview
        </p>
      </div>
      <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:980">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:981">{`Welcome back! Here's what's happening with your forms and landing pages.`}</p>
      </div>
    </div>
  );
}
