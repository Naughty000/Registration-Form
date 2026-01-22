// DOM Elements
const form = document.getElementById('registrationForm');
const successModal = document.getElementById('successModal');
const closeModal = document.getElementById('closeModal');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const charCount = document.getElementById('charCount');
const bioTextarea = document.getElementById('bio');
const passwordInput = document.getElementById('password');
const passwordToggle = document.querySelector('.password-toggle');
const fileInput = document.getElementById('profilePicture');
const filePreview = document.getElementById('filePreview');
const strengthBar = document.querySelector('.strength-bar');

// Form validation rules
const validationRules = {
    firstName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[A-Za-z\s]+$/,
        errorMessage: "Please enter a valid first name (letters and spaces only)"
    },
    lastName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[A-Za-z\s]+$/,
        errorMessage: "Please enter a valid last name (letters and spaces only)"
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: "Please enter a valid email address"
    },
    password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        errorMessage: "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
    },
    age: {
        required: true,
        min: 13,
        max: 125,
        errorMessage: "Age must be between 13 and 125"
    },
    terms: {
        required: true,
        errorMessage: "You must accept the terms and conditions"
    }
};

// Initialize form
function initForm() {
    calculateFormProgress();
    setupEventListeners();
    validateField('firstName');
    validateField('lastName');
    validateField('email');
    validateField('password');
    validateField('age');
}

// Setup event listeners
function setupEventListeners() {
    // Real-time validation on input
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('input', (e) => {
            validateField(e.target.id);
            calculateFormProgress();
        });
        
        element.addEventListener('blur', (e) => {
            validateField(e.target.id);
        });
    });
    
    // Form submission
    form.addEventListener('submit', handleSubmit);
    
    // Modal close
    closeModal.addEventListener('click', () => {
        successModal.classList.remove('active');
        form.reset();
        resetFilePreview();
        calculateFormProgress();
    });
    
    // Password toggle visibility
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    
    // File upload preview
    fileInput.addEventListener('change', handleFileUpload);
    
    // Password strength indicator
    passwordInput.addEventListener('input', updatePasswordStrength);
    
    // Character counter for bio
    bioTextarea.addEventListener('input', updateCharCount);
    
    // Reset form
    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.validation-icon').forEach(el => el.style.background = 'rgba(255, 255, 255, 0.1)');
            resetFilePreview();
            updatePasswordStrength();
            updateCharCount();
            calculateFormProgress();
        }, 0);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl + Enter to submit
        if (e.ctrlKey && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && successModal.classList.contains('active')) {
            successModal.classList.remove('active');
        }
    });
}

// Validate individual field
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    const validationIcon = field?.parentElement?.querySelector('.validation-icon');
    const rules = validationRules[fieldId];
    
    if (!field || !rules) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Check required
    if (rules.required && !field.value.trim()) {
        isValid = false;
        errorMessage = "This field is required";
    }
    
    // Check min length
    if (isValid && rules.minLength && field.value.length < rules.minLength) {
        isValid = false;
        errorMessage = `Minimum ${rules.minLength} characters required`;
    }
    
    // Check max length
    if (isValid && rules.maxLength && field.value.length > rules.maxLength) {
        isValid = false;
        errorMessage = `Maximum ${rules.maxLength} characters allowed`;
    }
    
    // Check pattern
    if (isValid && rules.pattern && !rules.pattern.test(field.value)) {
        isValid = false;
        errorMessage = rules.errorMessage;
    }
    
    // Check min value for numbers
    if (isValid && rules.min !== undefined && parseInt(field.value) < rules.min) {
        isValid = false;
        errorMessage = `Minimum value is ${rules.min}`;
    }
    
    // Check max value for numbers
    if (isValid && rules.max !== undefined && parseInt(field.value) > rules.max) {
        isValid = false;
        errorMessage = `Maximum value is ${rules.max}`;
    }
    
    // For checkboxes
    if (field.type === 'checkbox') {
        isValid = field.checked;
        errorMessage = isValid ? '' : rules.errorMessage;
    }
    
    // Update UI
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    if (validationIcon) {
        if (field.type === 'checkbox') {
            validationIcon.style.background = isValid ? 'var(--success-color)' : 'var(--error-color)';
        } else if (field.value.trim()) {
            validationIcon.style.background = isValid ? 'var(--success-color)' : 'var(--error-color)';
        } else {
            validationIcon.style.background = 'rgba(255, 255, 255, 0.1)';
        }
    }
    
    // Update field border
    if (field.type !== 'checkbox' && field.type !== 'radio') {
        field.style.borderColor = isValid ? 
            (field.value.trim() ? 'var(--success-color)' : 'rgba(255, 255, 255, 0.1)') : 
            'var(--error-color)';
    }
    
    return isValid;
}

// Validate entire form
function validateForm() {
    let isValid = true;
    
    Object.keys(validationRules).forEach(fieldId => {
        if (!validateField(fieldId)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    if (validateForm()) {
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Add timestamp
        data.timestamp = new Date().toISOString();
        
        // Simulate API call
        simulateSubmission(data)
            .then(response => {
                console.log('Form submitted successfully:', response);
                showSuccessModal();
            })
            .catch(error => {
                console.error('Submission error:', error);
                alert('There was an error submitting the form. Please try again.');
            });
    } else {
        // Scroll to first error
        const firstError = document.querySelector('.error-message:not(:empty)');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.parentElement.querySelector('input, select, textarea')?.focus();
        }
        
        // Add shake animation to invalid fields
        document.querySelectorAll('input:invalid, select:invalid, textarea:invalid').forEach(field => {
            field.classList.add('shake');
            setTimeout(() => field.classList.remove('shake'), 500);
        });
    }
}

// Simulate form submission
function simulateSubmission(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    message: 'Registration successful',
                    data: data
                });
            } else {
                reject(new Error('Network error'));
            }
        }, 1500);
    });
}

// Show success modal
function showSuccessModal() {
    // Update modal with user's name
    const firstName = document.getElementById('firstName').value;
    const modalMessage = document.querySelector('.modal-content p');
    modalMessage.textContent = `Thank you ${firstName} for registering! We've sent a confirmation email to your address.`;
    
    successModal.classList.add('active');
}

// Calculate form completion progress
function calculateFormProgress() {
    const fields = ['firstName', 'lastName', 'email', 'password', 'age', 'terms'];
    let completed = 0;
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        if (field.type === 'checkbox') {
            if (field.checked) completed++;
        } else if (field.value.trim()) {
            completed++;
        }
    });
    
    const progress = Math.round((completed / fields.length) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    
    // Update progress bar color
    if (progress < 30) {
        progressBar.style.background = 'var(--error-color)';
    } else if (progress < 70) {
        progressBar.style.background = 'var(--warning-color)';
    } else {
        progressBar.style.background = 'var(--success-color)';
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    passwordToggle.classList.toggle('fa-eye');
    passwordToggle.classList.toggle('fa-eye-slash');
}

// Update password strength indicator
function updatePasswordStrength() {
    const password = passwordInput.value;
    let strength = 0;
    const strengthText = document.querySelector('.strength-text');
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Special character check
    if (/[@$!%*?&]/.test(password)) strength += 25;
    
    // Update strength bar
    strengthBar.style.width = `${strength}%`;
    
    // Update strength text and color
    let text = 'Very Weak';
    let color = 'var(--error-color)';
    
    if (strength >= 50) {
        text = 'Medium';
        color = 'var(--warning-color)';
    }
    if (strength >= 75) {
        text = 'Strong';
        color = '#28a745';
    }
    if (strength === 100) {
        text = 'Very Strong';
        color = '#1e7e34';
    }
    
    strengthBar.style.background = color;
    strengthText.textContent = `Password strength: ${text}`;
}

// Handle file upload preview
function handleFileUpload(e) {
    const file = e.target.files[0];
    
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit. Please choose a smaller file.');
            e.target.value = '';
            resetFilePreview();
            return;
        }
        
        // Check file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file (PNG, JPG, GIF)');
            e.target.value = '';
            resetFilePreview();
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = (event) => {
            filePreview.innerHTML = `
                <img src="${event.target.result}" alt="Preview">
                <p>${file.name} (${(file.size / 1024).toFixed(2)} KB)</p>
                <button class="btn btn-reset" onclick="removeFile()" style="margin-top: 10px; padding: 5px 15px;">
                    <i class="fas fa-trash"></i> Remove
                </button>
            `;
            filePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    } else {
        resetFilePreview();
    }
}

// Remove uploaded file
function removeFile() {
    fileInput.value = '';
    resetFilePreview();
}

// Reset file preview
function resetFilePreview() {
    filePreview.innerHTML = '';
    filePreview.classList.remove('active');
}

// Update character counter
function updateCharCount() {
    const count = bioTextarea.value.length;
    charCount.textContent = count;
    
    // Change color when approaching limit
    if (count > 450) {
        charCount.style.color = 'var(--error-color)';
    } else if (count > 400) {
        charCount.style.color = 'var(--warning-color)';
    } else {
        charCount.style.color = 'rgba(255, 255, 255, 0.6)';
    }
}

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', initForm);

// Export form data (for debugging)
window.getFormData = function() {
    const formData = new FormData(form);
    return Object.fromEntries(formData);
};
