type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  gridSpan?: number;
  gridRow?: number;
  gridColumn?: number;
};

// Apply AI suggestion to form
export function applySuggestionToForm(suggestion: string, currentFields: FieldType[]): FieldType | null {
  const lowerSuggestion = suggestion.toLowerCase();
  
  // Parse the suggestion and create appropriate field
  if (lowerSuggestion.includes('phone') || lowerSuggestion.includes('contact number')) {
    return {
      id: Date.now().toString(),
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: false,
      gridSpan: 6,
    };
  }
  
  if (lowerSuggestion.includes('address')) {
    return {
      id: Date.now().toString(),
      type: 'text',
      label: 'Address',
      placeholder: 'Enter your address',
      required: false,
      gridSpan: 12,
    };
  }
  
  if (lowerSuggestion.includes('company') || lowerSuggestion.includes('organization')) {
    return {
      id: Date.now().toString(),
      type: 'text',
      label: 'Company Name',
      placeholder: 'Enter company name',
      required: false,
      gridSpan: 6,
    };
  }
  
  if (lowerSuggestion.includes('message') || lowerSuggestion.includes('comment') || lowerSuggestion.includes('feedback')) {
    return {
      id: Date.now().toString(),
      type: 'textarea',
      label: 'Message',
      placeholder: 'Enter your message here...',
      required: false,
      gridSpan: 12,
    };
  }
  
  if (lowerSuggestion.includes('date') || lowerSuggestion.includes('birthday')) {
    return {
      id: Date.now().toString(),
      type: 'date',
      label: 'Date',
      placeholder: '',
      required: false,
      gridSpan: 6,
    };
  }
  
  if (lowerSuggestion.includes('file') || lowerSuggestion.includes('upload') || lowerSuggestion.includes('attachment') || lowerSuggestion.includes('document')) {
    return {
      id: Date.now().toString(),
      type: 'file',
      label: 'Upload File',
      placeholder: '',
      required: false,
      gridSpan: 12,
    };
  }
  
  if (lowerSuggestion.includes('dropdown') || lowerSuggestion.includes('select') || lowerSuggestion.includes('choice')) {
    return {
      id: Date.now().toString(),
      type: 'dropdown',
      label: 'Select Option',
      placeholder: 'Choose an option',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      gridSpan: 6,
    };
  }
  
  if (lowerSuggestion.includes('section') || lowerSuggestion.includes('header') || lowerSuggestion.includes('organize')) {
    return {
      id: Date.now().toString(),
      type: 'section-header',
      label: 'Section Title',
      placeholder: '',
      required: false,
      gridSpan: 12,
    };
  }
  
  if (lowerSuggestion.includes('divider') || lowerSuggestion.includes('separator')) {
    return {
      id: Date.now().toString(),
      type: 'divider',
      label: 'Divider',
      placeholder: '',
      required: false,
      gridSpan: 12,
    };
  }
  
  if (lowerSuggestion.includes('number') || lowerSuggestion.includes('quantity') || lowerSuggestion.includes('amount')) {
    return {
      id: Date.now().toString(),
      type: 'number',
      label: 'Number',
      placeholder: '0',
      required: false,
      gridSpan: 6,
    };
  }
  
  if (lowerSuggestion.includes('checkbox') || lowerSuggestion.includes('terms') || lowerSuggestion.includes('agree')) {
    return {
      id: Date.now().toString(),
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      placeholder: '',
      required: false,
      gridSpan: 12,
    };
  }
  
  if (lowerSuggestion.includes('url') || lowerSuggestion.includes('website') || lowerSuggestion.includes('link')) {
    return {
      id: Date.now().toString(),
      type: 'url',
      label: 'Website URL',
      placeholder: 'https://example.com',
      required: false,
      gridSpan: 6,
    };
  }
  
  if (lowerSuggestion.includes('rating') || lowerSuggestion.includes('satisfaction')) {
    return {
      id: Date.now().toString(),
      type: 'dropdown',
      label: 'How satisfied are you?',
      placeholder: 'Select rating',
      required: false,
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      gridSpan: 12,
    };
  }
  
  if (lowerSuggestion.includes('time') || lowerSuggestion.includes('appointment time')) {
    return {
      id: Date.now().toString(),
      type: 'dropdown',
      label: 'Preferred Time',
      placeholder: 'Select time',
      required: false,
      options: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
      gridSpan: 6,
    };
  }
  
  // Default: return null if can't parse suggestion
  return null;
}

// Generate smart form suggestions based on current fields
export function generateFormSuggestions(currentFields: FieldType[]): string[] {
  const suggestions: string[] = [];
  const fieldTypes = currentFields.map(f => f.type);
  const fieldLabels = currentFields.map(f => f.label.toLowerCase());
  
  // If form is empty, suggest starting fields
  if (currentFields.length === 0) {
    suggestions.push('Add name field to collect visitor information');
    suggestions.push('Add email field for follow-up communication');
    suggestions.push('Add message field for inquiries');
    return suggestions;
  }
  
  // Check for basic contact information
  const hasEmail = fieldTypes.includes('email') || fieldLabels.some(l => l.includes('email'));
  const hasPhone = fieldTypes.includes('phone') || fieldLabels.some(l => l.includes('phone'));
  const hasName = fieldLabels.some(l => l.includes('name'));
  
  if (!hasEmail && currentFields.length < 10) {
    suggestions.push('Add email field for better contact options');
  }
  
  if (!hasPhone && hasEmail && currentFields.length < 10) {
    suggestions.push('Add phone number field for direct contact');
  }
  
  if (!hasName && currentFields.length < 10) {
    suggestions.push('Add name field to personalize submissions');
  }
  
  // Contextual suggestions based on form structure
  const hasDate = fieldTypes.includes('date') || fieldLabels.some(l => l.includes('date'));
  const hasDropdown = fieldTypes.includes('dropdown');
  const hasTextarea = fieldTypes.includes('textarea');
  
  // If there's a date field but no time selection
  if (hasDate && !fieldLabels.some(l => l.includes('time'))) {
    suggestions.push('Add time dropdown for scheduling');
  }
  
  // If form has contact info but no message area
  if ((hasEmail || hasPhone) && !hasTextarea && currentFields.length < 8) {
    suggestions.push('Add message field for detailed feedback');
  }
  
  // Check for file uploads
  if (!fieldTypes.includes('file') && currentFields.length >= 4 && currentFields.length < 12) {
    suggestions.push('Add file upload for documents or attachments');
  }
  
  // Organization suggestions for longer forms
  if (currentFields.length > 6 && !fieldTypes.includes('section-header')) {
    suggestions.push('Add section headers to organize form');
  }
  
  if (currentFields.length > 8 && !fieldTypes.includes('divider')) {
    suggestions.push('Add dividers to separate sections visually');
  }
  
  // Form quality suggestions
  const requiredCount = currentFields.filter(f => f.required).length;
  if (currentFields.length >= 3 && requiredCount === 0) {
    suggestions.push('Mark important fields as required for data quality');
  }
  
  // Add contextual field suggestions based on existing fields
  if (!hasDropdown && currentFields.length >= 3 && currentFields.length < 10) {
    suggestions.push('Add dropdown for multiple choice options');
  }
  
  // Check for address fields
  if (!fieldLabels.some(l => l.includes('address')) && (hasEmail || hasPhone) && currentFields.length < 10) {
    suggestions.push('Add address field for location data');
  }
  
  // Check for company/organization (B2B context)
  if (!fieldLabels.some(l => l.includes('company') || l.includes('organization')) && hasEmail && currentFields.length < 10) {
    suggestions.push('Add company field for B2B forms');
  }
  
  // Checkbox for agreements/consent
  if (!fieldTypes.includes('checkbox') && currentFields.length >= 4) {
    suggestions.push('Add checkbox for terms and consent');
  }
  
  // URL field for portfolio/website
  if (!fieldTypes.includes('url') && !fieldLabels.some(l => l.includes('website') || l.includes('url')) && currentFields.length >= 5) {
    suggestions.push('Add URL field for website or portfolio');
  }
  
  // Return top 3 most relevant suggestions
  return suggestions.slice(0, 3);
}

// Generate form fields from natural language query
export function generateFormFieldsFromQuery(query: string): FieldType[] {
  const lowerQuery = query.toLowerCase();
  const fields: FieldType[] = [];
  
  // Restaurant reservation form
  if (lowerQuery.includes('restaurant') || lowerQuery.includes('reservation') || lowerQuery.includes('dining') || lowerQuery.includes('table')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'date',
      label: 'Reservation Date',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'dropdown',
      label: 'Time Slot',
      placeholder: 'Select time',
      required: true,
      options: ['12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'number',
      label: 'Number of Guests',
      placeholder: '2',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'dropdown',
      label: 'Seating Preference',
      placeholder: 'Select preference',
      required: false,
      options: ['Indoor', 'Outdoor', 'Bar Area', 'Private Room', 'No Preference'],
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'textarea',
      label: 'Special Requests',
      placeholder: 'Dietary restrictions, allergies, celebrations, etc.',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Dentist/Dental office appointment form
  else if (lowerQuery.includes('dentist') || lowerQuery.includes('dental') || lowerQuery.includes('orthodontist')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'date',
      label: 'Date of Birth',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'dropdown',
      label: 'Appointment Type',
      placeholder: 'Select type',
      required: true,
      options: ['Regular Checkup', 'Cleaning', 'Filling', 'Root Canal', 'Emergency', 'Consultation'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'date',
      label: 'Preferred Appointment Date',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'dropdown',
      label: 'Preferred Time',
      placeholder: 'Select time',
      required: true,
      options: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-9`,
      type: 'text',
      label: 'Insurance Provider',
      placeholder: 'Enter your insurance provider',
      required: false,
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-10`,
      type: 'textarea',
      label: 'Reason for Visit / Special Notes',
      placeholder: 'Describe any pain, concerns, or special accommodations needed',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Doctor/Medical appointment form
  else if (lowerQuery.includes('doctor') || lowerQuery.includes('medical') || lowerQuery.includes('physician') || lowerQuery.includes('clinic')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'date',
      label: 'Date of Birth',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'dropdown',
      label: 'Appointment Type',
      placeholder: 'Select type',
      required: true,
      options: ['General Checkup', 'Follow-up', 'New Patient', 'Urgent Care', 'Specialist Consultation'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'date',
      label: 'Preferred Date',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'text',
      label: 'Insurance Provider',
      placeholder: 'Enter insurance company name',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-9`,
      type: 'text',
      label: 'Insurance ID Number',
      placeholder: 'Enter your insurance ID',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-10`,
      type: 'textarea',
      label: 'Reason for Visit',
      placeholder: 'Describe your symptoms or reason for appointment',
      required: true,
      gridSpan: 12,
    });
  }
  
  // Gym/Fitness membership form
  else if (lowerQuery.includes('gym') || lowerQuery.includes('fitness') || lowerQuery.includes('membership') || lowerQuery.includes('workout')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'date',
      label: 'Date of Birth',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'dropdown',
      label: 'Membership Type',
      placeholder: 'Select membership',
      required: true,
      options: ['Basic - $29/month', 'Premium - $49/month', 'Elite - $79/month', 'Annual - $499/year'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'dropdown',
      label: 'Fitness Goals',
      placeholder: 'Select your goal',
      required: false,
      options: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Athletic Performance', 'Rehabilitation'],
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'radio',
      label: 'Have you worked out before?',
      placeholder: '',
      required: true,
      options: ['Yes, regularly', 'Yes, occasionally', 'No, complete beginner'],
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-9`,
      type: 'textarea',
      label: 'Medical Conditions or Injuries',
      placeholder: 'List any conditions we should be aware of',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Real Estate/Property inquiry form
  else if (lowerQuery.includes('real estate') || lowerQuery.includes('property') || lowerQuery.includes('house') || lowerQuery.includes('apartment')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'dropdown',
      label: 'Property Type',
      placeholder: 'Select type',
      required: true,
      options: ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'dropdown',
      label: 'Looking to:',
      placeholder: 'Select option',
      required: true,
      options: ['Buy', 'Rent', 'Sell', 'Invest'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'text',
      label: 'Preferred Location',
      placeholder: 'City, neighborhood, or area',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'number',
      label: 'Budget Range (min)',
      placeholder: '100000',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'number',
      label: 'Budget Range (max)',
      placeholder: '500000',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-9`,
      type: 'dropdown',
      label: 'Bedrooms',
      placeholder: 'Select number',
      required: false,
      options: ['Studio', '1', '2', '3', '4', '5+'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-10`,
      type: 'dropdown',
      label: 'Bathrooms',
      placeholder: 'Select number',
      required: false,
      options: ['1', '1.5', '2', '2.5', '3', '3+'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-11`,
      type: 'textarea',
      label: 'Additional Requirements',
      placeholder: 'Parking, pet-friendly, amenities, etc.',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Course/Class enrollment form
  else if (lowerQuery.includes('course') || lowerQuery.includes('class') || lowerQuery.includes('training') || lowerQuery.includes('workshop') || lowerQuery.includes('enrollment')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'dropdown',
      label: 'Course Selection',
      placeholder: 'Select course',
      required: true,
      options: ['Web Development Bootcamp', 'Digital Marketing', 'Data Science', 'UX Design', 'Business Analytics'],
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'dropdown',
      label: 'Experience Level',
      placeholder: 'Select level',
      required: true,
      options: ['Beginner', 'Intermediate', 'Advanced'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'dropdown',
      label: 'Preferred Schedule',
      placeholder: 'Select schedule',
      required: true,
      options: ['Weekdays Morning', 'Weekdays Evening', 'Weekends', 'Self-Paced Online'],
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'text',
      label: 'Company Name (if applicable)',
      placeholder: 'Enter company name',
      required: false,
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-9`,
      type: 'textarea',
      label: 'Why are you interested in this course?',
      placeholder: 'Tell us about your goals and expectations',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Hotel/Accommodation booking form
  else if (lowerQuery.includes('hotel') || lowerQuery.includes('booking') || lowerQuery.includes('accommodation') || lowerQuery.includes('stay')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'date',
      label: 'Check-in Date',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'date',
      label: 'Check-out Date',
      placeholder: '',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'number',
      label: 'Number of Guests',
      placeholder: '2',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'dropdown',
      label: 'Room Type',
      placeholder: 'Select room',
      required: true,
      options: ['Standard', 'Deluxe', 'Suite', 'Family Room', 'Executive Suite'],
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'textarea',
      label: 'Special Requests',
      placeholder: 'Early check-in, accessible room, etc.',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Event registration form
  else if (lowerQuery.includes('event') || lowerQuery.includes('webinar') || lowerQuery.includes('conference') || lowerQuery.includes('seminar')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'text',
      label: 'Company/Organization',
      placeholder: 'Enter company name',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'text',
      label: 'Job Title',
      placeholder: 'Enter your position',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-7`,
      type: 'dropdown',
      label: 'Ticket Type',
      placeholder: 'Select ticket',
      required: true,
      options: ['General Admission', 'VIP Pass', 'Student', 'Group (5+)', 'Virtual Attendance'],
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-8`,
      type: 'textarea',
      label: 'Dietary Restrictions',
      placeholder: 'Any allergies or dietary preferences?',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Contact form (default fallback)
  else if (lowerQuery.includes('contact') || lowerQuery.includes('inquiry') || lowerQuery.includes('get in touch')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'textarea',
      label: 'Message',
      placeholder: 'Enter your message here...',
      required: true,
      gridSpan: 12,
    });
  }
  
  // Registration form
  else if (lowerQuery.includes('register') || lowerQuery.includes('signup') || lowerQuery.includes('sign up')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: false,
      gridSpan: 6,
    });
  }
  
  // Survey/Feedback form
  else if (lowerQuery.includes('survey') || lowerQuery.includes('feedback')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your name',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: false,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'dropdown',
      label: 'How satisfied are you?',
      placeholder: 'Select rating',
      required: true,
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'textarea',
      label: 'Additional Comments',
      placeholder: 'Share your thoughts...',
      required: false,
      gridSpan: 12,
    });
  }
  
  // Application form
  else if (lowerQuery.includes('application') || lowerQuery.includes('apply') || lowerQuery.includes('job')) {
    fields.push({
      id: `${Date.now()}-1`,
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-2`,
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-3`,
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-4`,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 6,
    });
    fields.push({
      id: `${Date.now()}-5`,
      type: 'file',
      label: 'Upload Resume',
      placeholder: '',
      required: true,
      gridSpan: 12,
    });
    fields.push({
      id: `${Date.now()}-6`,
      type: 'textarea',
      label: 'Cover Letter',
      placeholder: 'Tell us about yourself...',
      required: false,
      gridSpan: 12,
    });
  }
  
  return fields;
}

// Get AI response for user queries
export async function getAIResponse(query: string, currentFields: FieldType[]): Promise<string> {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const lowerQuery = query.toLowerCase();
  
  // Form analysis
  if (lowerQuery.includes('analyze') || lowerQuery.includes('review') || lowerQuery.includes('how')) {
    const fieldCount = currentFields.length;
    const requiredCount = currentFields.filter(f => f.required).length;
    const hasContact = currentFields.some(f => f.type === 'email' || f.type === 'phone');
    
    return `Your form currently has ${fieldCount} fields with ${requiredCount} required. ${
      hasContact 
        ? 'Good! You have contact information fields.' 
        : 'Consider adding email or phone fields for contact.'
    } ${
      fieldCount < 3 
        ? 'The form might be too short - consider adding more fields for better data collection.' 
        : fieldCount > 10 
        ? 'The form might be too long - consider breaking it into sections or multiple pages.'
        : 'The form length looks good!'
    }`;
  }
  
  // Field suggestions
  if (lowerQuery.includes('add') || lowerQuery.includes('include') || lowerQuery.includes('need')) {
    if (lowerQuery.includes('phone')) {
      return 'I recommend adding a phone number field with format validation. This helps with direct contact and reduces spam submissions.';
    }
    if (lowerQuery.includes('address')) {
      return 'For address fields, consider using a full-width text field or breaking it into: Street Address, City, State, and ZIP code for better data quality.';
    }
    if (lowerQuery.includes('file') || lowerQuery.includes('upload')) {
      return 'File upload fields are great for collecting documents. Make sure to specify accepted file types and size limits in the description.';
    }
    return 'Based on your form type, I suggest adding: email for contact, phone for follow-ups, and a message field for detailed information.';
  }
  
  // Improvement suggestions
  if (lowerQuery.includes('improve') || lowerQuery.includes('better') || lowerQuery.includes('optimize')) {
    return 'To improve your form: 1) Add clear labels and helpful placeholders, 2) Use section headers to organize fields, 3) Mark essential fields as required, 4) Keep it concise - only ask for necessary information, 5) Add a progress indicator for long forms.';
  }
  
  // Default helpful response
  return 'I can help you build better forms! Ask me to analyze your form, suggest fields to add, or provide tips for improving user experience. What would you like to know?';
}