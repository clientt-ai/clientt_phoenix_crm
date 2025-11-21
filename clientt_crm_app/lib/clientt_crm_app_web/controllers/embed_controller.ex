defmodule ClienttCrmAppWeb.EmbedController do
  @moduledoc """
  Controller for serving the embeddable form widget JavaScript.
  """

  use ClienttCrmAppWeb, :controller

  @doc """
  Serves the clientt-forms.js embed widget script.
  Injects the base URL from configuration.
  """
  def script(conn, _params) do
    base_url = Application.get_env(:clientt_crm_app, :embed_base_url, "https://app.clientt.com")

    script_content = embed_script(base_url)

    conn
    |> put_resp_content_type("application/javascript")
    |> put_resp_header("cache-control", "public, max-age=3600")
    |> send_resp(200, script_content)
  end

  defp embed_script(base_url) do
    """
    /**
     * Clientt Forms - Embeddable Form Widget
     * https://app.clientt.com
     *
     * Usage:
     * <script src="#{base_url}/embed/clientt-forms.js"></script>
     * <clientt-form form-id="your-form-uuid"></clientt-form>
     */
    (function() {
      'use strict';

      const BASE_URL = '#{base_url}';

      // CSS Variables for customization
      const DEFAULT_STYLES = `
        clientt-form {
          display: block;
          font-family: var(--clientt-font-family, inherit);
          font-size: var(--clientt-font-size, 16px);
        }

        .clientt-form-container {
          display: flex;
          flex-direction: column;
          gap: var(--clientt-spacing, 1rem);
        }

        .clientt-form-title {
          font-size: 1.5em;
          font-weight: 600;
          color: var(--clientt-text-color, inherit);
          margin-bottom: 0.5rem;
        }

        .clientt-form-description {
          color: var(--clientt-text-color, inherit);
          opacity: 0.8;
          margin-bottom: 1rem;
        }

        .clientt-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .clientt-label {
          font-weight: 500;
          color: var(--clientt-text-color, inherit);
        }

        .clientt-required {
          color: var(--clientt-error-color, #EF4444);
          margin-left: 0.25rem;
        }

        .clientt-input,
        .clientt-select,
        .clientt-textarea {
          padding: var(--clientt-input-padding, 0.5rem 0.75rem);
          border: var(--clientt-input-border, 1px solid var(--clientt-border-color, #D1D5DB));
          border-radius: var(--clientt-input-border-radius, 0.375rem);
          font-family: inherit;
          font-size: inherit;
          background: var(--clientt-background-color, transparent);
          color: var(--clientt-text-color, inherit);
        }

        .clientt-input:focus,
        .clientt-select:focus,
        .clientt-textarea:focus {
          outline: 2px solid var(--clientt-primary-color, #3B82F6);
          outline-offset: 1px;
        }

        .clientt-input.error,
        .clientt-select.error,
        .clientt-textarea.error {
          border-color: var(--clientt-error-color, #EF4444);
        }

        .clientt-help-text {
          font-size: 0.875em;
          color: var(--clientt-text-color, inherit);
          opacity: 0.7;
        }

        .clientt-error {
          font-size: 0.875em;
          color: var(--clientt-error-color, #EF4444);
        }

        .clientt-error-summary {
          background: var(--clientt-error-color, #EF4444);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: var(--clientt-input-border-radius, 0.375rem);
          margin-bottom: 1rem;
        }

        .clientt-checkbox-group,
        .clientt-radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .clientt-checkbox-option,
        .clientt-radio-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .clientt-button {
          padding: var(--clientt-button-padding, 0.625rem 1.25rem);
          border-radius: var(--clientt-button-border-radius, 0.375rem);
          background: var(--clientt-primary-color, #3B82F6);
          color: white;
          border: none;
          font-family: inherit;
          font-size: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .clientt-button:hover {
          opacity: 0.9;
        }

        .clientt-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clientt-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .clientt-spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid var(--clientt-border-color, #D1D5DB);
          border-top-color: var(--clientt-primary-color, #3B82F6);
          border-radius: 50%;
          animation: clientt-spin 0.8s linear infinite;
        }

        @keyframes clientt-spin {
          to { transform: rotate(360deg); }
        }

        .clientt-success {
          background: var(--clientt-success-color, #10B981);
          color: white;
          padding: 1rem;
          border-radius: var(--clientt-input-border-radius, 0.375rem);
          text-align: center;
        }

        .clientt-step-indicator {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .clientt-step-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          background: var(--clientt-border-color, #D1D5DB);
        }

        .clientt-step-dot.active {
          background: var(--clientt-primary-color, #3B82F6);
        }

        .clientt-step-dot.completed {
          background: var(--clientt-success-color, #10B981);
        }

        .clientt-step-buttons {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 1rem;
        }

        .clientt-button-secondary {
          background: transparent;
          color: var(--clientt-text-color, inherit);
          border: 1px solid var(--clientt-border-color, #D1D5DB);
        }

        .clientt-heading {
          font-size: var(--clientt-heading-size, 1.25em);
          font-weight: 600;
          color: var(--clientt-text-color, inherit);
          margin: 0.5rem 0;
        }

        .clientt-separator {
          border: none;
          border-top: 1px solid var(--clientt-border-color, #D1D5DB);
          margin: 1rem 0;
        }

        .clientt-spacer {
          height: var(--clientt-spacer-height, 1.5rem);
        }
      `;

      class ClienttForm extends HTMLElement {
        constructor() {
          super();
          this.formData = {};
          this.formMetadata = null;
          this.currentStep = 1;
          this.isSubmitting = false;
          this.errors = {};
        }

        connectedCallback() {
          const formId = this.getAttribute('form-id');
          const lazy = this.hasAttribute('lazy');

          if (!formId) {
            this.renderError('Form ID is required');
            return;
          }

          // Inject styles if not already present
          if (!document.getElementById('clientt-form-styles')) {
            const style = document.createElement('style');
            style.id = 'clientt-form-styles';
            style.textContent = DEFAULT_STYLES;
            document.head.appendChild(style);
          }

          if (lazy) {
            this.setupLazyLoad(formId);
          } else {
            this.loadForm(formId);
          }
        }

        setupLazyLoad(formId) {
          this.innerHTML = '<div class="clientt-loading"><div class="clientt-spinner"></div></div>';

          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                observer.disconnect();
                this.loadForm(formId);
              }
            });
          }, { threshold: 0.1 });

          observer.observe(this);
        }

        async loadForm(formId) {
          this.innerHTML = '<div class="clientt-loading"><div class="clientt-spinner"></div></div>';

          try {
            const response = await fetch(`${BASE_URL}/api/public/forms/${formId}`);

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to load form');
            }

            this.formMetadata = await response.json();
            this.render();
          } catch (error) {
            this.renderError(error.message);
          }
        }

        render() {
          const { name, description, settings, fields } = this.formMetadata;
          const isMultiStep = settings.multi_step_enabled && settings.steps?.length > 0;

          let html = '<div class="clientt-form-container">';

          // Title and description
          if (name) {
            html += `<h2 class="clientt-form-title">${this.escapeHtml(name)}</h2>`;
          }
          if (description) {
            html += `<p class="clientt-form-description">${this.escapeHtml(description)}</p>`;
          }

          // Error summary
          html += '<div class="clientt-error-summary" style="display: none;"></div>';

          // Form
          html += '<form class="clientt-form" novalidate>';

          if (isMultiStep) {
            html += this.renderMultiStepForm(fields, settings);
          } else {
            html += this.renderSinglePageForm(fields);
          }

          html += '</form></div>';

          this.innerHTML = html;
          this.attachEventListeners();
        }

        renderSinglePageForm(fields) {
          let html = '';

          // Sort fields by order_position
          const sortedFields = [...fields].sort((a, b) => a.order_position - b.order_position);

          sortedFields.forEach(field => {
            html += this.renderField(field);
          });

          html += `
            <div class="clientt-submit-container">
              <button type="submit" class="clientt-button">Submit</button>
            </div>
          `;

          return html;
        }

        renderMultiStepForm(fields, settings) {
          const steps = settings.steps || [];
          const totalSteps = steps.length;

          let html = '';

          // Step indicator
          html += '<div class="clientt-step-indicator">';
          for (let i = 1; i <= totalSteps; i++) {
            const status = i < this.currentStep ? 'completed' : (i === this.currentStep ? 'active' : '');
            html += `<div class="clientt-step-dot ${status}" data-step="${i}"></div>`;
          }
          html += '</div>';

          // Render fields for current step
          steps.forEach((step, index) => {
            const stepNum = index + 1;
            const isVisible = stepNum === this.currentStep;
            const stepFields = fields.filter(f =>
              step.field_ids?.includes(f.id) || f.step === stepNum
            );

            html += `<div class="clientt-step" data-step="${stepNum}" style="display: ${isVisible ? 'block' : 'none'}">`;
            html += `<h3 class="clientt-step-title">${this.escapeHtml(step.name || `Step ${stepNum}`)}</h3>`;

            stepFields.forEach(field => {
              html += this.renderField(field);
            });

            html += '</div>';
          });

          // Navigation buttons
          html += '<div class="clientt-step-buttons">';
          if (this.currentStep > 1) {
            html += '<button type="button" class="clientt-button clientt-button-secondary" data-action="prev">Previous</button>';
          } else {
            html += '<div></div>';
          }

          if (this.currentStep < totalSteps) {
            html += '<button type="button" class="clientt-button" data-action="next">Next</button>';
          } else {
            html += '<button type="submit" class="clientt-button">Submit</button>';
          }
          html += '</div>';

          return html;
        }

        renderField(field) {
          const { id, field_type, label, placeholder, help_text, required, options, validation_rules } = field;
          const value = this.formData[id] || '';
          const error = this.errors[id];
          const errorClass = error ? 'error' : '';

          let html = `<div class="clientt-field" data-field-id="${id}">`;
          html += `<label class="clientt-label" for="field-${id}">${this.escapeHtml(label)}`;
          if (required) {
            html += '<span class="clientt-required">*</span>';
          }
          html += '</label>';

          switch (field_type) {
            case 'text':
            case 'email':
            case 'phone':
            case 'url':
              const inputType = field_type === 'phone' ? 'tel' : field_type;
              html += `<input type="${inputType}" id="field-${id}" name="${id}" class="clientt-input ${errorClass}"
                placeholder="${this.escapeHtml(placeholder || '')}" value="${this.escapeHtml(value)}"
                ${required ? 'required' : ''}>`;
              break;

            case 'number':
              const min = validation_rules?.min_value;
              const max = validation_rules?.max_value;
              html += `<input type="number" id="field-${id}" name="${id}" class="clientt-input ${errorClass}"
                placeholder="${this.escapeHtml(placeholder || '')}" value="${this.escapeHtml(value)}"
                ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''}
                ${required ? 'required' : ''}>`;
              break;

            case 'date':
              html += `<input type="date" id="field-${id}" name="${id}" class="clientt-input ${errorClass}"
                value="${this.escapeHtml(value)}" ${required ? 'required' : ''}>`;
              break;

            case 'textarea':
              html += `<textarea id="field-${id}" name="${id}" class="clientt-textarea ${errorClass}"
                placeholder="${this.escapeHtml(placeholder || '')}" rows="4"
                ${required ? 'required' : ''}>${this.escapeHtml(value)}</textarea>`;
              break;

            case 'select':
              html += `<select id="field-${id}" name="${id}" class="clientt-select ${errorClass}" ${required ? 'required' : ''}>`;
              html += '<option value="">Select an option</option>';
              (options || []).forEach(opt => {
                const selected = value === opt.value ? 'selected' : '';
                html += `<option value="${this.escapeHtml(opt.value)}" ${selected}>${this.escapeHtml(opt.label)}</option>`;
              });
              html += '</select>';
              break;

            case 'checkbox':
              html += '<div class="clientt-checkbox-group">';
              if (options && options.length > 0) {
                options.forEach((opt, i) => {
                  const checked = Array.isArray(value) && value.includes(opt.value) ? 'checked' : '';
                  html += `<label class="clientt-checkbox-option">
                    <input type="checkbox" name="${id}" value="${this.escapeHtml(opt.value)}" ${checked}>
                    ${this.escapeHtml(opt.label)}
                  </label>`;
                });
              } else {
                const checked = value === 'true' || value === true ? 'checked' : '';
                html += `<label class="clientt-checkbox-option">
                  <input type="checkbox" id="field-${id}" name="${id}" ${checked}>
                  ${this.escapeHtml(label)}
                </label>`;
              }
              html += '</div>';
              break;

            case 'radio':
              html += '<div class="clientt-radio-group">';
              (options || []).forEach((opt, i) => {
                const checked = value === opt.value ? 'checked' : '';
                html += `<label class="clientt-radio-option">
                  <input type="radio" name="${id}" value="${this.escapeHtml(opt.value)}" ${checked} ${required ? 'required' : ''}>
                  ${this.escapeHtml(opt.label)}
                </label>`;
              });
              html += '</div>';
              break;

            case 'heading':
              // Heading is a layout element - render differently
              return `<h3 class="clientt-heading">${this.escapeHtml(label)}</h3>`;

            case 'separator':
              // Separator is a horizontal rule
              return '<hr class="clientt-separator">';

            case 'spacer':
              // Spacer adds vertical space
              return '<div class="clientt-spacer"></div>';

            default:
              // Skip unsupported field types
              break;
          }

          if (help_text) {
            html += `<span class="clientt-help-text">${this.escapeHtml(help_text)}</span>`;
          }

          if (error) {
            html += `<span class="clientt-error">${this.escapeHtml(Array.isArray(error) ? error[0] : error)}</span>`;
          }

          html += '</div>';
          return html;
        }

        attachEventListeners() {
          const form = this.querySelector('form');
          if (!form) return;

          // Form submission
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
          });

          // Input changes
          form.addEventListener('input', (e) => {
            const input = e.target;
            const name = input.name;
            if (name) {
              if (input.type === 'checkbox') {
                if (input.closest('.clientt-checkbox-group')?.querySelectorAll('input').length > 1) {
                  // Multiple checkboxes
                  const checked = Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
                    .map(cb => cb.value);
                  this.formData[name] = checked;
                } else {
                  // Single checkbox
                  this.formData[name] = input.checked;
                }
              } else {
                this.formData[name] = input.value;
              }

              // Clear error for this field
              if (this.errors[name]) {
                delete this.errors[name];
                const fieldContainer = this.querySelector(`[data-field-id="${name}"]`);
                if (fieldContainer) {
                  const errorEl = fieldContainer.querySelector('.clientt-error');
                  if (errorEl) errorEl.remove();
                  const inputEl = fieldContainer.querySelector('.clientt-input, .clientt-select, .clientt-textarea');
                  if (inputEl) inputEl.classList.remove('error');
                }
              }
            }
          });

          // Multi-step navigation
          const prevBtn = this.querySelector('[data-action="prev"]');
          const nextBtn = this.querySelector('[data-action="next"]');

          if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToStep(this.currentStep - 1));
          }

          if (nextBtn) {
            nextBtn.addEventListener('click', () => {
              if (this.validateCurrentStep()) {
                this.goToStep(this.currentStep + 1);
              }
            });
          }
        }

        goToStep(step) {
          const steps = this.querySelectorAll('.clientt-step');
          steps.forEach(s => s.style.display = 'none');

          const targetStep = this.querySelector(`.clientt-step[data-step="${step}"]`);
          if (targetStep) {
            targetStep.style.display = 'block';
            this.currentStep = step;
          }

          // Update step indicators
          const dots = this.querySelectorAll('.clientt-step-dot');
          dots.forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i + 1 < this.currentStep) {
              dot.classList.add('completed');
            } else if (i + 1 === this.currentStep) {
              dot.classList.add('active');
            }
          });

          // Update buttons
          this.render();
        }

        validateCurrentStep() {
          // Validate fields in current step
          const currentStepEl = this.querySelector(`.clientt-step[data-step="${this.currentStep}"]`);
          if (!currentStepEl) return true;

          const fields = currentStepEl.querySelectorAll('[data-field-id]');
          let valid = true;

          fields.forEach(fieldEl => {
            const fieldId = fieldEl.dataset.fieldId;
            const input = fieldEl.querySelector('input, select, textarea');
            if (input && input.required && !this.formData[fieldId]) {
              this.errors[fieldId] = ['This field is required'];
              valid = false;
            }
          });

          if (!valid) {
            this.render();
          }

          return valid;
        }

        async handleSubmit() {
          if (this.isSubmitting) return;

          // Client-side validation
          if (!this.validateForm()) {
            return;
          }

          this.isSubmitting = true;
          const submitBtn = this.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
          }

          try {
            const response = await fetch(`${BASE_URL}/api/public/forms/${this.formMetadata.id}/submissions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: this.formData,
                metadata: {
                  url: window.location.href,
                  referrer: document.referrer,
                  userAgent: navigator.userAgent
                }
              })
            });

            const result = await response.json();

            if (result.success) {
              this.handleSuccess(result);
            } else {
              this.handleValidationErrors(result.errors);
            }
          } catch (error) {
            this.showErrorSummary('Network error. Please try again.');
          } finally {
            this.isSubmitting = false;
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Submit';
            }
          }
        }

        validateForm() {
          this.errors = {};
          const { fields } = this.formMetadata;

          fields.forEach(field => {
            const value = this.formData[field.id];
            const fieldErrors = [];

            // Required validation
            if (field.required && !value) {
              fieldErrors.push('This field is required');
            }

            // Type-specific validation
            if (value) {
              const rules = field.validation_rules || {};

              if (rules.min_length && value.length < rules.min_length) {
                fieldErrors.push(`Must be at least ${rules.min_length} characters`);
              }

              if (rules.max_length && value.length > rules.max_length) {
                fieldErrors.push(`Must be no more than ${rules.max_length} characters`);
              }

              if (field.field_type === 'email' && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
                fieldErrors.push('Please enter a valid email address');
              }

              if (field.field_type === 'url' && !/^https?:\\/\\/.+/.test(value)) {
                fieldErrors.push('Please enter a valid URL');
              }
            }

            if (fieldErrors.length > 0) {
              this.errors[field.id] = fieldErrors;
            }
          });

          if (Object.keys(this.errors).length > 0) {
            this.errors._summary = ['Please correct the errors below'];
            this.render();
            this.showErrorSummary(this.errors._summary[0]);
            return false;
          }

          return true;
        }

        handleValidationErrors(errors) {
          this.errors = errors || {};
          this.render();

          if (errors._summary) {
            this.showErrorSummary(errors._summary[0]);
          }
        }

        showErrorSummary(message) {
          const summary = this.querySelector('.clientt-error-summary');
          if (summary) {
            summary.textContent = message;
            summary.style.display = 'block';
          }
        }

        handleSuccess(result) {
          const { settings } = result;

          // Show success message
          if (settings.show_success_message) {
            this.innerHTML = `
              <div class="clientt-form-container">
                <div class="clientt-success">
                  ${this.escapeHtml(settings.success_message || 'Thank you for your submission!')}
                </div>
              </div>
            `;
          }

          // Call callback function
          if (settings.callback_function && typeof window[settings.callback_function] === 'function') {
            window[settings.callback_function](result);
          }

          // Redirect
          if (settings.redirect_url) {
            setTimeout(() => {
              window.location.href = settings.redirect_url;
            }, 1500);
          }
        }

        renderError(message) {
          this.innerHTML = `
            <div class="clientt-form-container">
              <div class="clientt-error-summary" style="display: block;">
                ${this.escapeHtml(message)}
              </div>
            </div>
          `;
        }

        escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }
      }

      // Register the custom element
      if (!customElements.get('clientt-form')) {
        customElements.define('clientt-form', ClienttForm);
      }
    })();
    """
  end
end
