// AI Service - Simulates AI functionality with predefined templates and smart responses

export type FormFieldTemplate = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
};

export type FormTemplate = {
  title: string;
  description: string;
  fields: FormFieldTemplate[];
};

export type LandingPageSectionTemplate = {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  features?: string[];
  testimonials?: any[];
  logos?: string[];
};

// Form Templates Database
const formTemplates: { [key: string]: FormTemplate } = {
  'customer-feedback': {
    title: 'Customer Feedback Survey',
    description: 'Collect valuable feedback from your customers',
    fields: [
      {
        id: '1',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your name',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: '3',
        type: 'dropdown',
        label: 'How satisfied are you with our product?',
        required: true,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      },
      {
        id: '4',
        type: 'radio',
        label: 'Would you recommend us to others?',
        required: true,
        options: ['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not'],
      },
      {
        id: '5',
        type: 'textarea',
        label: 'What can we improve?',
        placeholder: 'Share your thoughts...',
        required: false,
      },
    ],
  },
  'event-registration': {
    title: 'Event Registration Form',
    description: 'Register attendees for your upcoming event',
    fields: [
      {
        id: '1',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: '3',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 000-0000',
        required: true,
      },
      {
        id: '4',
        type: 'dropdown',
        label: 'Ticket Type',
        required: true,
        options: ['General Admission', 'VIP', 'Student', 'Early Bird'],
      },
      {
        id: '5',
        type: 'checkbox',
        label: 'Dietary Restrictions',
        placeholder: 'I have dietary restrictions',
        required: false,
      },
      {
        id: '6',
        type: 'textarea',
        label: 'Special Requests',
        placeholder: 'Any special accommodations needed?',
        required: false,
      },
    ],
  },
  'job-application': {
    title: 'Job Application Form',
    description: 'Streamline your hiring process',
    fields: [
      {
        id: '1',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: '3',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 000-0000',
        required: true,
      },
      {
        id: '4',
        type: 'dropdown',
        label: 'Position Applied For',
        required: true,
        options: ['Software Engineer', 'Product Manager', 'Designer', 'Marketing Manager', 'Sales Representative'],
      },
      {
        id: '5',
        type: 'number',
        label: 'Years of Experience',
        placeholder: '0',
        required: true,
      },
      {
        id: '6',
        type: 'file',
        label: 'Upload Resume',
        required: true,
      },
      {
        id: '7',
        type: 'textarea',
        label: 'Cover Letter',
        placeholder: 'Tell us why you\'re a great fit...',
        required: false,
      },
    ],
  },
  'contact-form': {
    title: 'Contact Us Form',
    description: 'Let customers get in touch easily',
    fields: [
      {
        id: '1',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your name',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: '3',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 000-0000',
        required: false,
      },
      {
        id: '4',
        type: 'dropdown',
        label: 'Inquiry Type',
        required: true,
        options: ['General Question', 'Support Request', 'Sales Inquiry', 'Partnership', 'Other'],
      },
      {
        id: '5',
        type: 'textarea',
        label: 'Message',
        placeholder: 'How can we help you?',
        required: true,
      },
    ],
  },
  'newsletter-signup': {
    title: 'Newsletter Signup',
    description: 'Grow your email list',
    fields: [
      {
        id: '1',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
      },
      {
        id: '2',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: false,
      },
      {
        id: '3',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: '4',
        type: 'checkbox',
        label: 'Email Preferences',
        placeholder: 'I agree to receive promotional emails',
        required: true,
      },
    ],
  },
  'product-inquiry': {
    title: 'Product Inquiry Form',
    description: 'Capture product interest and leads',
    fields: [
      {
        id: '1',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your name',
        required: true,
      },
      {
        id: '2',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true,
      },
      {
        id: '3',
        type: 'text',
        label: 'Company Name',
        placeholder: 'Your company',
        required: false,
      },
      {
        id: '4',
        type: 'dropdown',
        label: 'Product Interest',
        required: true,
        options: ['Basic Plan', 'Pro Plan', 'Enterprise Plan', 'Custom Solution'],
      },
      {
        id: '5',
        type: 'number',
        label: 'Expected Team Size',
        placeholder: '0',
        required: false,
      },
      {
        id: '6',
        type: 'textarea',
        label: 'Additional Information',
        placeholder: 'Tell us about your needs...',
        required: false,
      },
    ],
  },
};

// AI Suggestions for Forms based on current fields
export function generateFormSuggestions(currentFields: FormFieldTemplate[]): string[] {
  const suggestions: string[] = [];
  const fieldTypes = currentFields.map(f => f.type);
  
  // Check what's missing and suggest additions
  if (!fieldTypes.includes('phone')) {
    suggestions.push('Add a phone number field for better contact options');
  }
  
  if (!fieldTypes.includes('textarea') && !fieldTypes.includes('text')) {
    suggestions.push('Consider adding a message field for detailed inquiries');
  }
  
  if (!fieldTypes.includes('dropdown') && currentFields.length > 2) {
    suggestions.push('Include a dropdown for inquiry type to organize submissions');
  }
  
  if (!fieldTypes.includes('checkbox')) {
    suggestions.push('Add a consent checkbox for GDPR compliance');
  }
  
  if (currentFields.length < 3) {
    suggestions.push('Add more fields to collect comprehensive information');
  }
  
  if (currentFields.length > 8) {
    suggestions.push('Consider reducing fields to improve completion rate (forms with 5-7 fields perform best)');
  }
  
  // Always include some optimization tips
  suggestions.push('Add field descriptions to help users understand what information is needed');
  suggestions.push('Consider making non-essential fields optional to reduce friction');
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

// AI Suggestions for Landing Pages based on current sections
export function generateLandingPageSuggestions(currentSections: LandingPageSectionTemplate[]): string[] {
  const suggestions: string[] = [];
  const sectionTypes = currentSections.map(s => s.type);
  
  // Check what's missing and suggest additions
  if (!sectionTypes.includes('testimonials')) {
    suggestions.push('Add testimonials section to build trust with social proof');
  }
  
  if (!sectionTypes.includes('cta')) {
    suggestions.push('Include a CTA section to improve conversion rates');
  }
  
  if (!sectionTypes.includes('logos')) {
    suggestions.push('Add customer logos section to showcase credibility');
  }
  
  if (!sectionTypes.includes('features')) {
    suggestions.push('Add a features section to highlight key benefits');
  }
  
  if (!sectionTypes.includes('pricing')) {
    suggestions.push('Include pricing section for transparency and conversions');
  }
  
  // Optimization suggestions
  if (currentSections.length < 3) {
    suggestions.push('Add more sections to create a complete narrative');
  }
  
  suggestions.push('Ensure your hero section has a clear, compelling headline');
  suggestions.push('Add urgency with limited-time offers or scarcity messaging');
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

// Apply a specific suggestion to the form
export function applySuggestionToForm(
  suggestion: string,
  currentFields: FormFieldTemplate[]
): FormFieldTemplate | null {
  const nextId = (Math.max(0, ...currentFields.map(f => parseInt(f.id))) + 1).toString();
  
  if (suggestion.includes('phone number')) {
    return {
      id: nextId,
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      required: false,
    };
  }
  
  if (suggestion.includes('message field')) {
    return {
      id: nextId,
      type: 'textarea',
      label: 'Message',
      placeholder: 'Enter your message...',
      required: false,
    };
  }
  
  if (suggestion.includes('dropdown for inquiry type')) {
    return {
      id: nextId,
      type: 'dropdown',
      label: 'Inquiry Type',
      required: true,
      options: ['General Question', 'Support', 'Sales', 'Other'],
    };
  }
  
  if (suggestion.includes('consent checkbox') || suggestion.includes('GDPR')) {
    return {
      id: nextId,
      type: 'checkbox',
      label: 'Privacy Consent',
      placeholder: 'I agree to the privacy policy and terms of service',
      required: true,
    };
  }
  
  return null;
}

// Apply a specific suggestion to the landing page
export function applySuggestionToLandingPage(
  suggestion: string
): LandingPageSectionTemplate | null {
  const sectionId = Date.now().toString();
  
  if (suggestion.includes('testimonials')) {
    return {
      id: sectionId,
      type: 'testimonials',
      title: 'What Our Customers Say',
      testimonials: [
        { name: 'Sarah Johnson', role: 'CEO, TechCorp', text: 'This product transformed our business!', rating: 5 },
        { name: 'Mike Chen', role: 'Founder, StartupXYZ', text: 'Incredible value and easy to use.', rating: 5 },
        { name: 'Emily Davis', role: 'Director, Innovation Inc', text: 'Best investment we\'ve made this year.', rating: 5 },
      ],
    };
  }
  
  if (suggestion.includes('CTA section')) {
    return {
      id: sectionId,
      type: 'cta',
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of satisfied customers today',
      buttonText: 'Start Free Trial',
      buttonLink: '#signup',
    };
  }
  
  if (suggestion.includes('customer logos') || suggestion.includes('logos section')) {
    return {
      id: sectionId,
      type: 'logos',
      title: 'Trusted by Leading Companies',
      logos: ['Company A', 'Company B', 'Company C', 'Company D', 'Company E'],
    };
  }
  
  if (suggestion.includes('features section')) {
    return {
      id: sectionId,
      type: 'features',
      title: 'Powerful Features',
      subtitle: 'Everything you need to succeed',
      features: [
        'Easy to use interface',
        'Real-time analytics',
        '24/7 customer support',
        'Secure and reliable',
      ],
    };
  }
  
  if (suggestion.includes('pricing section')) {
    return {
      id: sectionId,
      type: 'pricing',
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that works for you',
    };
  }
  
  return null;
}

// Generate form from AI prompt
export function generateFormFromPrompt(prompt: string): FormTemplate {
  const lowerPrompt = prompt.toLowerCase();
  
  // Match keywords to templates
  if (lowerPrompt.includes('feedback') || lowerPrompt.includes('survey')) {
    return formTemplates['customer-feedback'];
  }
  
  if (lowerPrompt.includes('event') || lowerPrompt.includes('registration') || lowerPrompt.includes('register')) {
    return formTemplates['event-registration'];
  }
  
  if (lowerPrompt.includes('job') || lowerPrompt.includes('application') || lowerPrompt.includes('career') || lowerPrompt.includes('hiring')) {
    return formTemplates['job-application'];
  }
  
  if (lowerPrompt.includes('contact') || lowerPrompt.includes('get in touch')) {
    return formTemplates['contact-form'];
  }
  
  if (lowerPrompt.includes('newsletter') || lowerPrompt.includes('subscribe') || lowerPrompt.includes('email list')) {
    return formTemplates['newsletter-signup'];
  }
  
  if (lowerPrompt.includes('product') || lowerPrompt.includes('inquiry') || lowerPrompt.includes('demo')) {
    return formTemplates['product-inquiry'];
  }
  
  // Default to contact form if no match
  return formTemplates['contact-form'];
}

// Get form template by key
export function getFormTemplate(key: string): FormTemplate | null {
  return formTemplates[key] || null;
}

// Get AI response to custom question
export function getAIResponse(question: string, context: 'form' | 'landing-page'): string[] {
  const lowerQuestion = question.toLowerCase();
  const responses: string[] = [];
  
  if (context === 'form') {
    // Check if user is asking to create a specific type of form
    if (lowerQuestion.includes('create') || lowerQuestion.includes('build') || lowerQuestion.includes('make') || lowerQuestion.includes('generate')) {
      responses.push(`✨ AI will create a complete form for you based on your request`);
      responses.push('All relevant fields will be added automatically');
      responses.push('You can customize any field after creation');
      return responses;
    }
    
    if (lowerQuestion.includes('improve') || lowerQuestion.includes('better')) {
      responses.push('Add a progress indicator for multi-step forms to show completion status');
      responses.push('Use conditional logic to show/hide fields based on previous answers');
      responses.push('Implement auto-save to prevent data loss if users navigate away');
    }
    
    if (lowerQuestion.includes('conversion') || lowerQuestion.includes('complete')) {
      responses.push('Reduce the number of required fields - only ask for essential information');
      responses.push('Add trust signals like security badges or privacy statements');
      responses.push('Use inline validation to help users correct errors immediately');
    }
    
    if (lowerQuestion.includes('mobile')) {
      responses.push('Use larger input fields and buttons for easier mobile interaction');
      responses.push('Optimize field types for mobile keyboards (number, email, tel)');
      responses.push('Reduce the overall length of the form for mobile users');
    }
  } else {
    if (lowerQuestion.includes('improve') || lowerQuestion.includes('better')) {
      responses.push('Add social proof with customer testimonials and success metrics');
      responses.push('Create a clear visual hierarchy to guide visitors through the page');
      responses.push('Use compelling CTAs with action-oriented language');
    }
    
    if (lowerQuestion.includes('conversion') || lowerQuestion.includes('convert')) {
      responses.push('Place your primary CTA above the fold for immediate visibility');
      responses.push('Add urgency with limited-time offers or countdown timers');
      responses.push('Reduce friction by minimizing required form fields');
    }
    
    if (lowerQuestion.includes('trust') || lowerQuestion.includes('credible')) {
      responses.push('Add customer logos from well-known brands you work with');
      responses.push('Include specific metrics and case study results');
      responses.push('Display security badges and certifications');
    }
  }
  
  // Default suggestions if no specific match
  if (responses.length === 0) {
    if (context === 'form') {
      responses.push('Consider adding helpful placeholder text to guide users');
      responses.push('Group related fields together with clear section headings');
      responses.push('Test different form layouts to optimize for conversions');
    } else {
      responses.push('Ensure your value proposition is clear and compelling');
      responses.push('Use high-quality images that support your message');
      responses.push('Add customer testimonials to build trust and credibility');
    }
  }
  
  return responses;
}

// Generate complete form fields from user query
export function generateFormFieldsFromQuery(query: string): FormFieldTemplate[] | null {
  const lowerQuery = query.toLowerCase();
  
  // Check if it's a creation request
  if (!lowerQuery.includes('create') && !lowerQuery.includes('build') && !lowerQuery.includes('make') && !lowerQuery.includes('generate')) {
    return null;
  }
  
  // Restaurant/dining related
  if (lowerQuery.includes('restaurant') || lowerQuery.includes('reservation') || lowerQuery.includes('dining') || lowerQuery.includes('table')) {
    return [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your.email@example.com', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: true },
      { id: '4', type: 'date', label: 'Reservation Date', required: true },
      { id: '5', type: 'dropdown', label: 'Party Size', required: true, options: ['1-2 people', '3-4 people', '5-6 people', '7+ people'] },
      { id: '6', type: 'dropdown', label: 'Time Preference', required: true, options: ['Lunch (11AM-2PM)', 'Afternoon (2PM-5PM)', 'Dinner (5PM-9PM)', 'Late Night (9PM+)'] },
      { id: '7', type: 'textarea', label: 'Special Requests', placeholder: 'Dietary restrictions, celebrations, etc.', required: false },
    ];
  }
  
  // Real estate related
  if (lowerQuery.includes('real estate') || lowerQuery.includes('property') || lowerQuery.includes('home') || lowerQuery.includes('apartment')) {
    return [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your.email@example.com', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: true },
      { id: '4', type: 'dropdown', label: 'Property Type', required: true, options: ['House', 'Apartment', 'Condo', 'Townhouse', 'Land'] },
      { id: '5', type: 'dropdown', label: 'Budget Range', required: true, options: ['Under $300k', '$300k-$500k', '$500k-$750k', '$750k-$1M', 'Over $1M'] },
      { id: '6', type: 'number', label: 'Bedrooms', placeholder: '0', required: false },
      { id: '7', type: 'number', label: 'Bathrooms', placeholder: '0', required: false },
      { id: '8', type: 'text', label: 'Preferred Location', placeholder: 'City or neighborhood', required: false },
      { id: '9', type: 'textarea', label: 'Additional Requirements', placeholder: 'Tell us what you\'re looking for...', required: false },
    ];
  }
  
  // Education/course enrollment
  if (lowerQuery.includes('course') || lowerQuery.includes('class') || lowerQuery.includes('training') || lowerQuery.includes('education') || lowerQuery.includes('enrollment')) {
    return [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your.email@example.com', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: false },
      { id: '4', type: 'dropdown', label: 'Course Interest', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] },
      { id: '5', type: 'dropdown', label: 'Preferred Schedule', required: true, options: ['Weekday Mornings', 'Weekday Evenings', 'Weekends', 'Self-Paced Online'] },
      { id: '6', type: 'radio', label: 'Previous Experience', required: true, options: ['Complete Beginner', 'Some Experience', 'Experienced', 'Professional'] },
      { id: '7', type: 'textarea', label: 'Learning Goals', placeholder: 'What do you hope to achieve?', required: false },
    ];
  }
  
  // Medical/healthcare
  if (lowerQuery.includes('doctor') || lowerQuery.includes('medical') || lowerQuery.includes('healthcare') || lowerQuery.includes('appointment') || lowerQuery.includes('clinic')) {
    return [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your.email@example.com', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: true },
      { id: '4', type: 'date', label: 'Preferred Appointment Date', required: true },
      { id: '5', type: 'dropdown', label: 'Appointment Type', required: true, options: ['General Checkup', 'Follow-up', 'New Patient', 'Urgent Care', 'Consultation'] },
      { id: '6', type: 'dropdown', label: 'Insurance Provider', required: false, options: ['Blue Cross', 'Aetna', 'United Healthcare', 'Medicare', 'Self-Pay', 'Other'] },
      { id: '7', type: 'textarea', label: 'Reason for Visit', placeholder: 'Brief description of your concern...', required: false },
    ];
  }
  
  // Gym/fitness
  if (lowerQuery.includes('gym') || lowerQuery.includes('fitness') || lowerQuery.includes('workout') || lowerQuery.includes('training')) {
    return [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your.email@example.com', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: true },
      { id: '4', type: 'dropdown', label: 'Membership Type', required: true, options: ['Monthly', '3 Months', '6 Months', 'Annual'] },
      { id: '5', type: 'radio', label: 'Fitness Level', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
      { id: '6', type: 'checkbox', label: 'Personal Training', placeholder: 'I\'m interested in personal training sessions', required: false },
      { id: '7', type: 'textarea', label: 'Fitness Goals', placeholder: 'What are you looking to achieve?', required: false },
    ];
  }
  
  // Consulting/services
  if (lowerQuery.includes('consult') || lowerQuery.includes('service') || lowerQuery.includes('quote') || lowerQuery.includes('estimate')) {
    return [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your.email@example.com', required: true },
      { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: true },
      { id: '4', type: 'text', label: 'Company Name', placeholder: 'Your company', required: false },
      { id: '5', type: 'dropdown', label: 'Service Interest', required: true, options: ['Strategy Consulting', 'Implementation', 'Training', 'Ongoing Support', 'Custom Project'] },
      { id: '6', type: 'dropdown', label: 'Budget Range', required: false, options: ['Under $5k', '$5k-$15k', '$15k-$50k', 'Over $50k'] },
      { id: '7', type: 'dropdown', label: 'Timeline', required: false, options: ['Urgent (ASAP)', '1-2 weeks', '1 month', '2-3 months', 'Flexible'] },
      { id: '8', type: 'textarea', label: 'Project Details', placeholder: 'Tell us about your needs...', required: true },
    ];
  }
  
  // Webinar/workshop
  if (lowerQuery.includes('webinar') || lowerQuery.includes('workshop') || lowerQuery.includes('seminar') || lowerQuery.includes('conference')) {
    return [
      { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email Address', placeholder: 'your.email@example.com', required: true },
      { id: '3', type: 'text', label: 'Company/Organization', placeholder: 'Your company', required: false },
      { id: '4', type: 'text', label: 'Job Title', placeholder: 'Your role', required: false },
      { id: '5', type: 'dropdown', label: 'Session Interest', required: false, options: ['Morning Session', 'Afternoon Session', 'All Sessions'] },
      { id: '6', type: 'checkbox', label: 'Networking', placeholder: 'I\'m interested in networking opportunities', required: false },
      { id: '7', type: 'textarea', label: 'Questions or Topics', placeholder: 'What would you like to learn about?', required: false },
    ];
  }
  
  // Return the template-based form if keyword matches existing templates
  const template = generateFormFromPrompt(query);
  return template.fields;
}