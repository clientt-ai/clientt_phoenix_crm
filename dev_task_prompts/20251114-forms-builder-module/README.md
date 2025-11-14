# Forms Builder Module - Development Task Prompt

**Date Created**: 2025-11-14
**Status**: Planning Complete, Partial Execution, Awaiting Decisions
**Phase**: Specification & Planning
**Source**: figma_src/105_form_builder_module/

---

## Quick Links

- 📋 **[PLANNING.md](./PLANNING.md)** - Complete planning document with phases and considerations
- 📊 **[SPEC_FILES_MANIFEST.md](./SPEC_FILES_MANIFEST.md)** - Complete list of all 55 spec files to create
- ⚡ **[EXECUTION_SUMMARY.md](./EXECUTION_SUMMARY.md)** - What's been completed and remaining work
- ⚠️ **[ISSUES.md](./ISSUES.md)** - Open questions, concerns, and decisions needed (START HERE)

---

## Overview

This task converts the Forms Builder Module (imported from Figma) into comprehensive BDD/DDD specifications following the Clientt CRM project structure. The module includes:

- Form creation and management
- Calendar booking system (Calendly-like)
- Chatbot lead capture
- OAuth integrations (Google Calendar, Microsoft Outlook)
- Analytics dashboard

---

## Current Status

### ✅ Completed

**Planning & Documentation** (4 files):
- ✅ `PLANNING.md` - Comprehensive planning document
- ✅ `SPEC_FILES_MANIFEST.md` - Complete file manifest (55 files)
- ✅ `EXECUTION_SUMMARY.md` - Progress summary
- ✅ `ISSUES.md` - Open issues and questions

**Domain Specifications** (2 files):
- ✅ `specs/01-domains/forms/domain.md` - Forms domain
- ✅ `specs/01-domains/integrations/domain.md` - Integrations domain

**Resource Specifications** (2 files):
- ✅ `specs/01-domains/forms/resources/form.md` - Form resource
- ✅ `specs/01-domains/forms/resources/calendar_booking.md` - CalendarBooking resource

**Total Progress**: 8 files created, 51 remaining (13.5% complete)

---

### 🚧 In Progress

**Nothing currently in progress** - awaiting review and decisions.

---

### ⏸️ Blocked / Awaiting Decisions

**Critical Decisions Needed** (from ISSUES.md):

1. **OAuth Implementation Strategy** (Issue #3)
   - Which OAuth library to use?
   - Token storage and encryption approach?
   - Token refresh mechanism (Oban, Quantum, GenServer)?

2. **React to LiveView Mapping** (Issue #2)
   - Calendar widget implementation approach?
   - Drag-drop form builder strategy?
   - Chatbot state management in LiveView?

3. **AI vs Scripted Chatbot** (Issue #4)
   - Start with scripted responses or integrate AI API?
   - Which AI provider if external API?

4. **Team Calendar Features** (Question #4)
   - Single calendar or multi-member scheduling?
   - Round-robin assignment needed?

5. **Lead Deduplication** (Question #5)
   - Email-based merging strategy?
   - Deduplication window (current: 30 days)?

**See [ISSUES.md](./ISSUES.md) for complete list.**

---

### 📋 Remaining Work

**High Priority** (28 files):
- Forms domain: 14 files (resources, features, policies, docs)
- Integrations domain: 11 files (resources, features, policies, docs)
- Cross-domain integrations: 3 files

**Medium Priority** (19 files):
- UI components: 5 files
- UI patterns: 4 files
- UI screens: 9 files (7 new, 2 updates)
- Figma reference: 1 file

**Estimated Effort**: ~65 hours remaining

---

## Document Guide

### 📋 PLANNING.md
**Read this for**: Overall strategy and approach

**Contains**:
- Source analysis (Figma module structure)
- Specification changes required
- Implementation phases (5 phases)
- Key considerations (multi-tenancy, OAuth, real-time)
- Component mapping (React → Phoenix)
- Expected outcomes
- Open questions

**Best for**: Understanding the big picture and execution plan.

---

### 📊 SPEC_FILES_MANIFEST.md
**Read this for**: Complete file checklist

**Contains**:
- Legend (NEW, UPDATE, EXISTS)
- Complete list of 55 spec files organized by category
- Execution order recommendations
- Dependency tree
- Validation checklist
- Progress tracking template

**Best for**: Tracking what's been done and what's next.

---

### ⚡ EXECUTION_SUMMARY.md
**Read this for**: Current progress and quality assessment

**Contains**:
- Files created (detailed list)
- Patterns established
- Quality assessment (strengths and weaknesses)
- Key decisions made with rationale
- Remaining work breakdown
- Time estimates
- Next steps

**Best for**: Understanding where we are and what's been accomplished.

---

### ⚠️ ISSUES.md
**Read this for**: Problems, questions, and decisions needed

**Contains**:
- 5 critical issues (including incomplete specs)
- 5 domain modeling questions
- 3 integration questions
- 2 UI/UX questions
- 4 technical concerns (performance, privacy, security, analytics)
- 3 specification gaps
- Decision log

**Best for**: Identifying blockers and what needs team input.

**🎯 START HERE** if you're reviewing this work.

---

## Next Actions

### For Product/Team Lead

1. **Review** [ISSUES.md](./ISSUES.md) - Answer critical questions
2. **Decide** on:
   - OAuth implementation approach
   - AI vs scripted chatbot for MVP
   - Team calendar features scope
   - Lead deduplication strategy
3. **Prioritize** remaining spec work
4. **Schedule** spec review meeting

### For Developers

1. **Review** domain specifications:
   - [Forms Domain](../../specs/01-domains/forms/domain.md)
   - [Integrations Domain](../../specs/01-domains/integrations/domain.md)
2. **Review** resource specifications:
   - [Form Resource](../../specs/01-domains/forms/resources/form.md)
   - [CalendarBooking Resource](../../specs/01-domains/forms/resources/calendar_booking.md)
3. **Provide feedback** on technical feasibility
4. **Prototype** complex components (calendar, drag-drop, chatbot)

### For Spec Author (Claude)

1. **Wait** for decisions on critical issues
2. **Continue** spec generation following manifest
3. **Focus** on:
   - Remaining Forms resources (4 files)
   - BDD features (9 files)
   - Integration specs (3 files)
4. **Generate** database schemas after resources complete

---

## Success Criteria

Specifications are complete when:

- [ ] All 55 files from manifest are created
- [ ] All critical issues in ISSUES.md are resolved
- [ ] All Ash resources have complete definitions
- [ ] All BDD features have Gherkin scenarios
- [ ] All UI screens have component breakdowns
- [ ] All integration specs have data flow diagrams
- [ ] Database schemas are generated and reviewed
- [ ] Team has reviewed and approved specs

---

## Timeline Estimate

**Specification Phase**:
- Planning: ✅ Complete (8 hours)
- Execution: 🚧 7% complete (65 hours remaining)
- Review: ⏸️ Not started (8 hours estimated)
- **Total**: 81 hours (1 person, full-time: ~2 weeks)

**Implementation Phase** (after specs approved):
- Domain setup: ~40 hours
- Resource implementation: ~80 hours
- Feature implementation: ~120 hours
- UI implementation: ~160 hours
- Integration implementation: ~80 hours
- Testing: ~60 hours
- **Total**: ~540 hours (~3-4 months with 2-3 developers)

---

## Key Files Reference

### Figma Source
- Location: `figma_src/105_form_builder_module/`
- Key docs:
  - `src/START_HERE.md` - Module overview
  - `src/FEATURE_DOCUMENTATION.md` - Feature details
  - `src/MODULE_ARCHITECTURE.md` - Architecture guide
  - `src/INTEGRATION_HANDOFF.md` - Technical specs

### Project Guidelines
- `CLAUDE.md` - Project-wide guidelines
- `.claude/skills/project_specs-generation/` - Spec generation templates
- `.claude/skills/ash-guidelines/` - Ash Framework patterns
- `.claude/skills/liveview-guidelines/` - LiveView patterns

### Existing Specs
- `specs/01-domains/authorization/` - Reference for domain structure
- `specs/05-ui-design/` - UI design system foundation

---

## Questions?

**About Planning**: See [PLANNING.md](./PLANNING.md)
**About Progress**: See [EXECUTION_SUMMARY.md](./EXECUTION_SUMMARY.md)
**About Issues**: See [ISSUES.md](./ISSUES.md)
**About File List**: See [SPEC_FILES_MANIFEST.md](./SPEC_FILES_MANIFEST.md)

**Project Guidelines**: See `../../CLAUDE.md`
**Spec Templates**: See `.claude/skills/project_specs-generation/`

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-14 | Claude | Initial planning and partial execution |

---

**Status**: Ready for review and decision-making
**Next Review**: TBD
**Owner**: TBD
