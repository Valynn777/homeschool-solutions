/**
 * Faithful Way Homeschool Solutions
 * Main JavaScript File
 *
 * This file contains site-wide JavaScript functionality.
 * Add custom scripts and interactive features as needed.
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Faithful Way Homeschool Solutions - Site initialized');

    // Form submission handling for contact forms
    initializeContactForms();

    // Mobile navigation toggle (if needed in the future)
    initializeMobileNav();

    // Smooth scrolling for anchor links
    initializeSmoothScroll();
});

/**
 * Initialize contact form submissions
 * Handles form status messages and validation
 */
function initializeContactForms() {
    const contactForm = document.getElementById('contactForm');
    const intakeForm = document.getElementById('intakeForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Form will submit to Formspree or configured endpoint
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Formspree will handle the redirect
            // If using custom endpoint, handle response here
        });
    }

    if (intakeForm) {
        intakeForm.addEventListener('submit', function(e) {
            // Add client email to cc field for dual email sending
            const clientEmail = document.getElementById('clientEmail');
            const ccField = this.querySelector('input[name="_cc"]');

            if (clientEmail && ccField) {
                ccField.value = clientEmail.value;
            }

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        });
    }
}

/**
 * Initialize mobile navigation toggle
 * Placeholder for future mobile menu functionality
 */
function initializeMobileNav() {
    // Add mobile menu toggle functionality here if needed
    // Currently, navigation uses CSS flexbox wrapping for mobile
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Only handle anchor links on the same page
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();

                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Utility function to show form status messages
 * @param {string} formId - The ID of the form status container
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showFormStatus(formId, message, type) {
    const statusDiv = document.getElementById(formId);

    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `form-status ${type}`;
        statusDiv.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Utility function to validate email addresses
 * @param {string} email - Email address to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Utility function to format phone numbers
 * @param {string} phone - Phone number to format
 * @returns {string}
 */
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }

    return phone;
}

// Export utilities for use in other scripts
window.FaithfulWay = {
    showFormStatus,
    isValidEmail,
    formatPhoneNumber
};
