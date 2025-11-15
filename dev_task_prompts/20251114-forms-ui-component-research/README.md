# Forms Builder - UI Component Research & Prototyping

**Type**: Investigation & Research Task
**Priority**: 🟠 High
**Status**: Needs Investigation
**Created**: 2025-11-14

## Overview

This dev_prompt focuses on researching and prototyping UI component implementations for the Forms Builder module, specifically addressing the challenge of mapping React/shadcn components from Figma to Phoenix LiveView/DaisyUI.

## Parent Task

Source: `dev_task_prompts/20251114-forms-builder-module/ISSUES.md`
- Issue #2: React vs Phoenix LiveView Component Mapping
- Issue #5: Form Builder Drag-Drop UX
- Question #9: Mobile Form Builder Support

## Problem Statement

The Figma source uses React + TypeScript + shadcn/ui, but the target implementation is Phoenix LiveView + Elixir + DaisyUI. Several complex components require research to determine the best implementation approach.

## Research Questions

### 1. Calendar Widget Component

**Current State**: Figma uses shadcn/ui Calendar (React component)
**Target Need**: Date/time picker for calendar bookings

**Questions**:
- Should we use a JavaScript library (Flatpickr, Tempus Dominus)?
- Build a custom LiveView calendar component?
- Use native HTML `<input type="datetime-local">`?
- What about timezone handling?

**Research Tasks**:
- [ ] Evaluate Flatpickr with LiveView hooks
- [ ] Evaluate Tempus Dominus integration
- [ ] Research LiveView-native calendar implementations
- [ ] Test timezone conversion UX patterns
- [ ] Prototype at least 2 approaches
- [ ] Document pros/cons of each

**Success Criteria**:
- Works on desktop and mobile
- Handles timezones correctly
- Integrates cleanly with LiveView
- Accessible (keyboard navigation, screen readers)
- Performance acceptable (< 100ms to render)

---

### 2. Drag-Drop Form Builder

**Current State**: Figma shows drag-drop field reordering
**Target Need**: LiveView-based drag-drop for form building

**Questions**:
- Use SortableJS with Phoenix LiveView hooks?
- Use LiveView JS commands for drag/drop?
- Use LiveView Streams for optimistic updates?
- How to handle touch devices?
- Undo/redo support?

**Research Tasks**:
- [ ] Prototype SortableJS + LiveView hooks approach
- [ ] Research pure LiveView drag-drop patterns
- [ ] Test mobile touch drag-drop UX
- [ ] Evaluate LiveView Streams for field list updates
- [ ] Test undo/redo implementation complexity
- [ ] Measure performance with 50+ fields

**Success Criteria**:
- Smooth drag experience (60fps)
- Works on desktop and tablet
- Auto-saves field order changes
- Visual feedback during drag
- Handles long field lists (100+ fields)

---

### 3. Chatbot Widget State Management

**Current State**: Figma shows interactive chatbot widget
**Target Need**: Real-time chat interface in LiveView

**Questions**:
- How to manage conversation state?
- Use LiveView assigns or external state (GenServer)?
- Real-time message delivery via PubSub?
- How to handle typing indicators?
- Message persistence strategy?

**Research Tasks**:
- [ ] Prototype LiveView chatbot with PubSub
- [ ] Test conversation state in LiveView assigns
- [ ] Research typing indicator patterns
- [ ] Test message scrolling UX (auto-scroll to bottom)
- [ ] Evaluate WebSocket connection overhead
- [ ] Test with 100+ concurrent chats

**Success Criteria**:
- Messages appear in < 100ms
- Smooth auto-scroll behavior
- Typing indicators work
- Handles disconnection gracefully
- Scales to 1000+ concurrent users

---

### 4. Live Preview in Form Builder

**Current State**: Figma shows side-by-side editor and preview
**Target Need**: Real-time form preview as user edits

**Questions**:
- Update preview on every keystroke?
- Debounce updates (how long)?
- Use LiveView Streams for field updates?
- Render preview server-side or client-side?

**Research Tasks**:
- [ ] Test debounce delays (300ms, 500ms, 1000ms)
- [ ] Prototype LiveView Streams for field updates
- [ ] Research client-side preview rendering (Alpine.js?)
- [ ] Test performance with complex forms (50+ fields)
- [ ] Evaluate auto-save frequency

**Success Criteria**:
- Preview updates feel instant (< 300ms perceived delay)
- No flickering or layout shifts
- Works with conditional field logic
- Auto-save doesn't interfere with editing

---

### 5. Component Mapping Matrix

Research and document complete mapping from Figma/React to LiveView/DaisyUI:

| Figma/React Component | Current Status | Target Component | Research Needed |
|-----------------------|----------------|------------------|-----------------|
| shadcn/ui Button | ✅ Clear | DaisyUI btn | None |
| shadcn/ui Card | ✅ Clear | DaisyUI card | None |
| shadcn/ui Dialog | ✅ Clear | DaisyUI modal | None |
| shadcn/ui Select | ✅ Clear | DaisyUI select | None |
| shadcn/ui Input | ✅ Clear | DaisyUI input | None |
| shadcn/ui Textarea | ✅ Clear | DaisyUI textarea | None |
| shadcn/ui Checkbox | ✅ Clear | DaisyUI checkbox | None |
| shadcn/ui Radio | ✅ Clear | DaisyUI radio | None |
| shadcn/ui Calendar | ⚠️ Unclear | **RESEARCH** | High priority |
| React DnD/SortableJS | ⚠️ Unclear | **RESEARCH** | High priority |
| Chatbot Widget | ⚠️ Unclear | **RESEARCH** | Medium priority |
| Form Preview | ⚠️ Unclear | **RESEARCH** | Medium priority |
| Toast Notifications | ⚠️ Unclear | LiveView Flash? | Low priority |
| Loading Spinners | ⚠️ Unclear | DaisyUI loading | Low priority |

**Research Tasks**:
- [ ] Complete the mapping matrix with decisions
- [ ] Document implementation patterns for each
- [ ] Create LiveView component templates

---

### 6. Mobile Form Builder Support

**Current State**: Figma designs appear desktop-focused
**Target Need**: Decide on mobile support level

**Research Questions**:
- What percentage of users will build forms on mobile?
- Is viewing/editing submissions on mobile sufficient?
- Should drag-drop work on mobile?

**Research Tasks**:
- [ ] Analyze user analytics (if available) for mobile usage
- [ ] Prototype mobile-optimized form builder UI
- [ ] Test touch-based drag-drop on tablets
- [ ] Research mobile-first form builder tools
- [ ] Document mobile UX recommendations

**Options to Evaluate**:

**Option A: Desktop Only**
- Require desktop/tablet (landscape) for form building
- Mobile shows "Use desktop to build forms" message
- Mobile can view submissions only
- Effort: Low

**Option B: Simplified Mobile**
- Basic field editing on mobile (no drag-drop)
- Use up/down buttons for reordering
- Add/remove fields works
- Effort: Medium

**Option C: Full Mobile**
- Touch-optimized drag-drop
- Mobile-specific form builder UI
- Full feature parity with desktop
- Effort: High

**Success Criteria**:
- Decision documented with rationale
- Prototype created (if not desktop-only)
- UX testing completed (if mobile support)
- Implementation effort estimated

---

## Prototyping Plan

### Phase 1: Quick Wins (Week 1)
- [ ] Prototype calendar widget with Flatpickr
- [ ] Prototype simple component mappings (buttons, inputs)
- [ ] Test DaisyUI integration with LiveView

### Phase 2: Complex Components (Week 2-3)
- [ ] Prototype drag-drop with SortableJS
- [ ] Prototype chatbot widget with PubSub
- [ ] Prototype live preview with debouncing

### Phase 3: Mobile Research (Week 4)
- [ ] Test prototypes on mobile devices
- [ ] Make mobile support decision
- [ ] Document mobile UX patterns

### Phase 4: Documentation (Week 5)
- [ ] Complete component mapping matrix
- [ ] Write implementation guides
- [ ] Create LiveView component templates
- [ ] Document best practices

## Deliverables

This investigation should produce:

1. **Component Mapping Guide** (`COMPONENT_MAPPING.md`)
   - Complete React → LiveView component matrix
   - Implementation notes for each component
   - Code examples for complex components

2. **Prototype Code** (`prototypes/`)
   - Working calendar widget prototype
   - Working drag-drop prototype
   - Working chatbot widget prototype
   - Working live preview prototype

3. **Decision Document** (`DECISIONS.md`)
   - Calendar widget choice (with rationale)
   - Drag-drop approach choice (with rationale)
   - Mobile support level (with rationale)
   - Any other key decisions

4. **Implementation Templates** (`templates/`)
   - LiveView component templates
   - JavaScript hook templates
   - CSS/Tailwind patterns

5. **UX Testing Results** (`UX_TESTING.md`)
   - User testing notes (if conducted)
   - Performance benchmarks
   - Accessibility audit results

## Technical Constraints

- **Phoenix LiveView Version**: 1.1+
- **DaisyUI Version**: Latest (4.x)
- **Tailwind CSS**: v4.1+
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Support**: TBD (outcome of research)

## Resources

### LiveView Resources
- [Phoenix LiveView Docs](https://hexdocs.pm/phoenix_live_view)
- [LiveView JS Interop Guide](https://hexdocs.pm/phoenix_live_view/js-interop.html)
- [LiveView Streams](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html#stream/4)

### Component Libraries
- [DaisyUI Components](https://daisyui.com/components/)
- [Flatpickr](https://flatpickr.js.org/)
- [SortableJS](https://sortablejs.github.io/Sortable/)

### Example Implementations
- [PetalComponents](https://github.com/petalframework/petal_components)
- [LiveView Form Builder Example](https://github.com/search?q=liveview+form+builder)

## Success Metrics

This research is successful when:
- [ ] All unclear component mappings are resolved
- [ ] At least 2 prototypes are working
- [ ] Mobile support decision is made
- [ ] Component mapping guide is complete
- [ ] Implementation templates are created
- [ ] Team review and approval obtained

## Timeline

**Estimated**: 4-5 weeks
- Week 1: Quick wins and basic prototypes
- Week 2-3: Complex component prototyping
- Week 4: Mobile research and testing
- Week 5: Documentation and review

## Next Steps

1. Review this README with team
2. Set up prototyping environment
3. Start with calendar widget research
4. Schedule weekly sync to review progress
5. Document decisions as you go

---

**Status**: Awaiting Start
**Owner**: TBD
**Start Date**: TBD
**Review Date**: TBD
