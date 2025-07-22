// Netlify Forms Configuration
// This file helps Netlify understand the form structure

// Form configuration for the contact form
window.addEventListener('DOMContentLoaded', function() {
  // Ensure the form has the correct attributes
  const form = document.querySelector('form[name="contact"]');
  if (form) {
    // Set the redirect URL
    form.setAttribute('data-netlify-redirect', '/form-success.html');
    
    // Add any additional form handling if needed
    form.addEventListener('submit', function(e) {
      console.log('Form submitted, redirecting to success page...');
      // Netlify will handle the redirect automatically
    });
  }
}); 