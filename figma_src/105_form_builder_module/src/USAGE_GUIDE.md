# Clientt Form Builder - New Features Usage Guide

## Quick Start Guide

This guide shows you how to use the new Demo Calendar Builder and Sales Chatbot features.

---

## 📅 Using the Demo Calendar Builder

### Step 1: Access from Form Builder
1. Navigate to **Dashboard** → **Forms** → **Create New Form**
2. Build your form with desired fields
3. Scroll down to the **"Post-Submission Actions"** section
4. Click on the **"Book a Demo"** card (with calendar icon)

### Step 2: Select Date & Time
- **Left Panel - Calendar View**:
  - Click on any available date (dates in the past are disabled)
  - Available time slots appear below the calendar
  - Click on your preferred time slot
  - Selected slot will be highlighted in blue

### Step 3: Fill Booking Details
- **Right Panel - Booking Form**:
  - **Full Name**: Your contact name
  - **Email Address**: Confirmation will be sent here
  - **Timezone**: Select from dropdown (EST, CST, MST, PST, GMT, CET)

### Step 4: Additional Information
- **How did you hear about us?**: Select from dropdown
- **Company Name**: Enter your company
- **Your Role**: Your job title or position

### Step 5: Review & Confirm
- **Booking Summary** appears automatically showing:
  - Selected date
  - Time slot
  - Timezone
- Click **"Confirm Booking"** button
- Or click **"Cancel"** to go back

### Step 6: Calendar Integration
- Confirmation modal appears with success message
- Download options for:
  - 📅 Google Calendar
  - 📅 Outlook
  - 📅 iCal
- Click **"Done"** to finish

### Embed Feature
Toggle **"Embed on Landing Page"** at the top to make the calendar available directly on your landing pages.

---

## 💬 Using the Sales Chatbot

### Accessing the Chatbot

#### Method 1: Manual Open
1. Look for the blue bubble icon in the **bottom-right corner** of the screen
2. The icon will have a subtle pulse animation
3. Click to open the chat window

#### Method 2: Auto-Open (After Form Submission)
- The chatbot automatically opens after certain actions
- Greets you with: "Hi there 👋 Ready to book your free demo?"

### Using Quick Actions
The chatbot provides three quick action buttons:
- **📅 Book a demo**: Instantly ask about demo scheduling
- **💰 Pricing**: Get pricing information
- **✨ Features**: Learn about product features

### Sending Custom Messages
1. Click in the input field at the bottom
2. Type your question (e.g., "What features do you offer?")
3. Press **Enter** or click the **Send** button
4. AI responds within 1 second

### Managing the Chat
- **Minimize**: Click the **X** button in the header
- **Reopen**: Click the bubble icon again
- **Scroll**: Use mouse wheel or touch gestures to view message history

### Chat Features
- **Message History**: All messages stay in the chat
- **Timestamps**: Each message shows send time
- **Visual Distinction**:
  - AI messages: Gray background, left-aligned, bot icon
  - Your messages: Blue background, right-aligned, user icon

---

## 🔄 Complete User Journey Example

### Scenario: Lead wants to schedule a product demo

1. **Visitor fills out "Contact Us" form**
   - Enters name, email, phone
   - Clicks "Submit"

2. **Form builder shows Post-Submission Actions**
   - Three options appear
   - Visitor clicks **"Book a Demo"**

3. **Calendar Builder opens**
   - Breadcrumb shows: Forms → Demo Calendar Builder
   - Visitor selects: Wednesday, Jan 15, 2025
   - Chooses time: 2:00 PM
   - Fills in booking details
   - Reviews summary

4. **Confirmation received**
   - Success modal appears
   - Booking details confirmed
   - Calendar links available
   - Visitor downloads Google Calendar invite

5. **Chatbot opens (optional)**
   - If visitor has questions
   - Can ask about features, pricing, etc.
   - Gets instant responses

---

## 💡 Best Practices

### For Calendar Bookings

**DO:**
✅ Select timezone carefully to avoid confusion
✅ Use a valid email address for confirmation
✅ Fill in all required fields before confirming
✅ Download calendar invite immediately
✅ Check your email for confirmation

**DON'T:**
❌ Select dates in the past (they're disabled anyway)
❌ Use fake email addresses
❌ Skip the booking summary review
❌ Close without downloading calendar invite

### For Chatbot Interactions

**DO:**
✅ Use quick action buttons for common questions
✅ Be specific in your questions
✅ Review AI responses carefully
✅ Ask follow-up questions if needed

**DON'T:**
❌ Expect real-time human responses (this is AI simulation)
❌ Share sensitive personal information
❌ Expect the AI to remember conversation after page refresh

---

## 🎨 Visual Design Guide

### Calendar Builder Colors
- **Primary Blue** (#2278C0): Selected dates, confirm button
- **Accent Teal** (#00D3BB): Success states, confirmation modal
- **Muted Gray** (#F8F8F8): Background cards
- **Border Gray** (#EEEEEE): Card borders, separators

### Chatbot Colors
- **Primary Blue** (#2278C0): Header, user messages
- **Muted Gray** (#F8F8F8): AI messages background
- **White** (#FFFFFF): Cards, input fields
- **Secondary Pink** (#F43098): Accents (when applicable)

### Dark Mode
Both features automatically adapt to dark mode:
- Background: #18181B
- Foreground text: #FFFFFF
- Adjusted borders and shadows
- Maintained contrast ratios

---

## ⌨️ Keyboard Shortcuts

### Calendar Builder
- **Tab**: Navigate between form fields
- **Enter**: Confirm booking (when on button)
- **Esc**: Close confirmation modal

### Chatbot
- **Enter**: Send message
- **Shift + Enter**: New line in message (if multiline enabled)
- **Esc**: Close chatbot window

---

## 📱 Mobile Experience

### Calendar (Mobile)
- Single column layout
- Date picker shown first
- Time slots grid adjusts to 2 columns
- Booking form appears below
- Touch-optimized tap targets

### Chatbot (Mobile)
- Full-width chat window at bottom
- Swipe up to expand fully
- Quick actions remain scrollable horizontally
- Keyboard-aware positioning

---

## 🐛 Troubleshooting

### Calendar Builder Issues

**Problem**: Time slots not appearing
- **Solution**: Make sure you've selected a date first

**Problem**: Can't confirm booking
- **Solution**: Check that all required fields (name, email) are filled

**Problem**: Calendar integrations not working
- **Solution**: Calendar downloads are simulated; in production, these would trigger actual calendar invites

### Chatbot Issues

**Problem**: Chatbot not responding
- **Solution**: Check internet connection; responses have 1-second delay

**Problem**: Can't see previous messages
- **Solution**: Scroll up in the message area

**Problem**: Send button disabled
- **Solution**: Type a message first; empty messages can't be sent

---

## 🚀 Next Steps

After using these features:
1. **Customize** time slots and availability in Calendar Builder
2. **Train** the AI chatbot with your specific knowledge base
3. **Integrate** with your CRM for lead tracking
4. **Set up** email notifications for bookings
5. **Monitor** conversion rates and user engagement

---

## 📞 Support

For questions or issues:
- Check the [Technical Documentation](./FEATURE_DOCUMENTATION.md)
- Review component code in `/components/`
- Contact the development team

---

## 🎯 Success Metrics

Track these KPIs after implementing:
- **Booking conversion rate**: % of form submitters who book demos
- **Chatbot engagement**: Number of messages per session
- **Response satisfaction**: Feedback on AI responses
- **Calendar completion rate**: % of started bookings that complete
- **Time to first booking**: How quickly leads book after form submission

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Components**: CalendarBuilderPage, ChatbotWidget
