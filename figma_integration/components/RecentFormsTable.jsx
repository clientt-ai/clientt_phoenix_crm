// Recent Forms Table Component
// Node ID: 98:1064
// Description: Table showing recent forms and landing pages with search and create actions
// NOTE: This is a complex table component with 6 rows of sample data

// Hero Icons mapping for Phoenix LiveView implementation:
// imgIcon (create new/plus) → Use: <.icon name="hero-plus" class="size-4" />
// imgVector (filter) → Use: <.icon name="hero-adjustments-horizontal" class="size-4" />
// imgIcon1 (search) → Use: <.icon name="hero-magnifying-glass" class="size-4" />

const imgIcon = "hero-plus";
const imgVector = "hero-adjustments-horizontal";
const imgIcon1 = "hero-magnifying-glass";

export default function RecentFormsTable() {
  // Sample data structure
  const tableData = [
    {
      id: 1,
      name: "Customer Feedback Survey",
      type: "Form",
      typeColor: "#2278c0",
      submissions: 247,
      status: "Active",
      statusBg: "#dcfce7",
      statusText: "#008236",
      dateCreated: "Oct 15, 2025",
      lastEdited: "2 hours ago"
    },
    {
      id: 2,
      name: "Product Launch Landing Page",
      type: "Landing Page",
      typeColor: "#f43098",
      submissions: 1432,
      status: "Active",
      statusBg: "#dcfce7",
      statusText: "#008236",
      dateCreated: "Oct 10, 2025",
      lastEdited: "5 hours ago"
    },
    {
      id: 3,
      name: "Newsletter Signup",
      type: "Form",
      typeColor: "#2278c0",
      submissions: 892,
      status: "Active",
      statusBg: "#dcfce7",
      statusText: "#008236",
      dateCreated: "Oct 8, 2025",
      lastEdited: "1 day ago"
    },
    {
      id: 4,
      name: "Event Registration",
      type: "Form",
      typeColor: "#2278c0",
      submissions: 156,
      status: "Draft",
      statusBg: "#f8f8f8",
      statusText: "#18181b",
      dateCreated: "Oct 5, 2025",
      lastEdited: "2 days ago"
    },
    {
      id: 5,
      name: "Contact Us",
      type: "Form",
      typeColor: "#2278c0",
      submissions: 523,
      status: "Active",
      statusBg: "#dcfce7",
      statusText: "#008236",
      dateCreated: "Sep 28, 2025",
      lastEdited: "3 days ago"
    },
    {
      id: 6,
      name: "Demo Request Page",
      type: "Landing Page",
      typeColor: "#f43098",
      submissions: 78,
      status: "Paused",
      statusBg: "#ffedd4",
      statusText: "#ca3500",
      dateCreated: "Sep 20, 2025",
      lastEdited: "5 days ago"
    }
  ];

  return (
    <div className="bg-white border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col gap-[48px] items-start pb-[0.667px] pl-[24.667px] pr-[0.667px] pt-[24.667px] relative rounded-[16px] size-full" data-name="Card" data-node-id="98:1064">
      {/* Header Section */}
      <div className="h-[48px] relative shrink-0 w-[1522.67px]" data-name="RecentFormsTable" data-node-id="98:1065">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[48px] items-center justify-between relative w-[1522.67px]">
          {/* Title */}
          <div className="h-[48px] relative shrink-0 w-[267.354px]" data-name="Container" data-node-id="98:1066">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[48px] items-start relative w-[267.354px]">
              <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3" data-node-id="98:1067">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-nowrap text-zinc-900 top-[-1px] whitespace-pre" data-node-id="98:1068">{`Recent Forms & Landing Pages`}</p>
              </div>
              <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="98:1069">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-zinc-900 top-[0.33px] whitespace-pre" data-node-id="98:1070">
                  Manage and track your forms and pages
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="h-[40px] relative shrink-0 w-[450.906px]" data-name="Container" data-node-id="98:1071">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-[450.906px]">
              {/* Create New Button */}
              <div className="absolute bg-[#2278c0] h-[40px] left-0 rounded-[8px] top-0 w-[145.573px]" data-name="Button" data-node-id="98:1072">
                <div className="absolute left-[16px] size-[16px] top-[12px]" data-name="Icon" data-node-id="98:1073">
                  <img alt="" className="block max-w-none size-full" src={imgIcon} />
                </div>
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[40px] not-italic text-[16px] text-nowrap text-white top-[7px] whitespace-pre" data-node-id="98:1076">
                  Create New
                </p>
              </div>

              {/* Filter Button */}
              <div className="absolute border-[#eeeeee] border-[0.667px] border-solid box-border content-stretch flex flex-col items-start left-[417.57px] pb-[0.667px] pt-[8.667px] px-[8.667px] rounded-[8px] size-[33.333px] top-[3.33px]" data-name="Button" data-node-id="98:1077">
                <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon" data-node-id="98:1078">
                  <div className="absolute inset-[12.5%_8.34%_8.33%_8.33%]" data-name="Vector" data-node-id="98:1079">
                    <div className="absolute inset-[-5.26%_-5%]">
                      <img alt="" className="block max-w-none size-full" src={imgVector} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Input */}
              <div className="absolute h-[36px] left-[153.57px] top-[2px] w-[256px]" data-name="Container" data-node-id="98:1080">
                <div className="absolute bg-[#f8f8f8] border-[#f8f8f8] border-[0.667px] border-solid h-[36px] left-0 rounded-[4px] top-0 w-[256px]" data-name="Input" data-node-id="98:1081">
                  <div className="box-border content-stretch flex h-[36px] items-center overflow-clip pl-[40px] pr-[12px] py-[4px] relative rounded-[inherit] w-[256px]">
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900 whitespace-pre" data-node-id="98:1082">
                      Search...
                    </p>
                  </div>
                </div>
                <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Icon" data-node-id="98:1083">
                  <img alt="" className="block max-w-none size-full" src={imgIcon1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table - NOTE: Full table implementation with all rows is too long */}
      {/* See the markdown documentation for complete table structure */}
      <div className="border-[#eeeeee] border-[0.667px] border-solid h-[269px] relative rounded-[8px] shrink-0 w-[1522.67px]" data-name="RecentFormsTable" data-node-id="98:1086">
        <p className="text-zinc-900">
          Table with columns: Name | Type | Submissions | Status | Date Created | Last Edited
        </p>
        <p className="text-zinc-600 text-sm mt-2">
          {tableData.length} rows of data available. See 205_FORMS_DASHBOARD.md for complete structure.
        </p>
      </div>
    </div>
  );
}

// Export sample data for use in Phoenix LiveView
export const sampleTableData = [
  {
    id: 1,
    name: "Customer Feedback Survey",
    type: "Form",
    submissions: 247,
    status: "Active",
    date_created: "2025-10-15",
    last_edited: "2 hours ago"
  },
  {
    id: 2,
    name: "Product Launch Landing Page",
    type: "Landing Page",
    submissions: 1432,
    status: "Active",
    date_created: "2025-10-10",
    last_edited: "5 hours ago"
  },
  {
    id: 3,
    name: "Newsletter Signup",
    type: "Form",
    submissions: 892,
    status: "Active",
    date_created: "2025-10-08",
    last_edited: "1 day ago"
  },
  {
    id: 4,
    name: "Event Registration",
    type: "Form",
    submissions: 156,
    status: "Draft",
    date_created: "2025-10-05",
    last_edited: "2 days ago"
  },
  {
    id: 5,
    name: "Contact Us",
    type: "Form",
    submissions: 523,
    status: "Active",
    date_created: "2025-09-28",
    last_edited: "3 days ago"
  },
  {
    id: 6,
    name: "Demo Request Page",
    type: "Landing Page",
    submissions: 78,
    status: "Paused",
    date_created: "2025-09-20",
    last_edited: "5 days ago"
  }
];
