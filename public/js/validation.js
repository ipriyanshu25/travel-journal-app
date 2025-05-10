// public/js/validation.js

document.addEventListener('DOMContentLoaded', function() {
  // Enable all Bootstrap validations
  const forms = document.querySelectorAll('.needs-validation');
  
  Array.prototype.slice.call(forms).forEach(function(form) {
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
  
  // Validate date ranges
  const arrivalDateInput = document.getElementById('arrivalDate');
  const departureDateInput = document.getElementById('departureDate');
  
  if (arrivalDateInput && departureDateInput) {
    // Set min date for arrival (today)
    const today = new Date().toISOString().split('T')[0];
    
    // Validate departure date is after arrival date
    arrivalDateInput.addEventListener('change', function() {
      departureDateInput.min = arrivalDateInput.value;
      
      // If departure date is before arrival date, clear it
      if (departureDateInput.value && departureDateInput.value < arrivalDateInput.value) {
        departureDateInput.value = '';
      }
    });
  }
  
  // Validate password length on registration form
  const passwordInput = document.getElementById('password');
  
  if (passwordInput && window.location.pathname.includes('register')) {
    passwordInput.addEventListener('input', function() {
      if (this.value.length < 6) {
        this.setCustomValidity('Password must be at least 6 characters');
      } else {
        this.setCustomValidity('');
      }
    });
  }
  
  // Validate experience length
  const experienceTextarea = document.getElementById('experience');
  
  if (experienceTextarea) {
    experienceTextarea.addEventListener('input', function() {
      if (this.value.length < 10) {
        this.setCustomValidity('Experience must be at least 10 characters');
      } else {
        this.setCustomValidity('');
      }
    });
  }
});