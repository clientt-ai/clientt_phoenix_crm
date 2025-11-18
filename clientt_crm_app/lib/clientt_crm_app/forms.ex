defmodule ClienttCrmApp.Forms do
  @moduledoc """
  Forms domain for custom form building and lead management.

  Manages form creation, field configuration, submission handling, and lead
  workflow through the sales funnel.

  ## Key Concepts

  - **Form**: A customizable data collection template (aggregate root)
  - **FormField**: Individual input field within a form (10 types supported)
  - **Submission**: Completed form submission with lead data (immutable)
  - **Lead Status**: Workflow state (new → contacted → qualified → converted)
  - **Multi-Tenancy**: All resources filtered by tenant_id

  ## Resources

  - `Form` - Form definitions and configuration (aggregate root)
  - `FormField` - Individual form fields (text, email, textarea, select, etc.)
  - `Submission` - Form submissions / lead data (immutable once created)
  - `Notification` - In-app notifications (TODO: move to shared domain)

  ## Field Types (MVP)

  **Basic (6)**: text, email, textarea, select, checkbox, radio
  **Advanced (4)**: number, date, phone, url
  **Excluded**: file upload (Phase 3+)

  ## Business Rules

  1. **Multi-Tenancy**: All resources filtered by tenant_id
  2. **Submission Immutability**: Once created, form_data cannot be modified
  3. **Field Type Constraints**: MVP supports exactly 10 types
  4. **Single-Page Forms**: No multi-page or conditional logic in MVP
  5. **Lead Status Workflow**: Valid transitions enforced (new → contacted → qualified → converted)
  6. **Form Publication**: Forms must have at least 1 field to publish
  7. **Published Forms Immutable**: Cannot modify published form fields
  """

  use Ash.Domain,
    otp_app: :clientt_crm_app

  resources do
    resource ClienttCrmApp.Forms.Form
    resource ClienttCrmApp.Forms.FormField
    resource ClienttCrmApp.Forms.Submission
    resource ClienttCrmApp.Forms.Notification
  end
end
