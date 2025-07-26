/**
 * Pahana Edu - Login & Signup JavaScript
 * Simple and clean implementation for AuthController integration
 */

// Global Variables
let currentForm = 'login';

// DOM Elements
const loginToggle = document.getElementById('loginToggle');
const signupToggle = document.getElementById('signupToggle');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const messageContainer = document.getElementById('messageContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pahana Edu - Initializing JavaScript...');
    
    // Check if all required elements exist
    if (!validateElements()) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // Setup event listeners
    initializeEventListeners();
    
    console.log('Pahana Edu - JavaScript loaded successfully');
});

/**
 * Validate that all required DOM elements exist
 */
function validateElements() {
    const requiredElements = [
        loginToggle, signupToggle, loginForm, signupForm,
        loginFormElement, signupFormElement, messageContainer, loadingOverlay
    ];
    
    return requiredElements.every(element => element !== null);
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    try {
        // Form toggle events
        loginToggle.addEventListener('click', () => switchForm('login'));
        signupToggle.addEventListener('click', () => switchForm('signup'));
        
        // Form submission events
        loginFormElement.addEventListener('submit', handleLogin);
        signupFormElement.addEventListener('submit', handleSignup);
        
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhone);
        }
        
        // Password strength monitoring
        const signupPassword = document.getElementById('signupPassword');
        if (signupPassword) {
            signupPassword.addEventListener('input', checkPasswordStrength);
        }
        
        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', validatePasswordMatch);
        }
        
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

/**
 * Switch between login and signup forms
 */
function switchForm(formType) {
    if (currentForm === formType) return;
    
    try {
        // Update toggle buttons
        loginToggle.classList.toggle('active', formType === 'login');
        signupToggle.classList.toggle('active', formType === 'signup');
        
        // Switch forms
        if (formType === 'login') {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        }
        
        currentForm = formType;
        clearMessages();
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = formType === 'login' 
                ? document.getElementById('loginEmail')
                : document.getElementById('firstName');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
        
    } catch (error) {
        console.error('Error switching forms:', error);
    }
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId) {
    try {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const toggleBtn = input.parentNode.querySelector('.toggle-password');
        if (!toggleBtn) return;
        
        const icon = toggleBtn.querySelector('i');
        if (!icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    } catch (error) {
        console.error('Error toggling password:', error);
    }
}

/**
 * Format phone number input (numbers only, max 10 digits)
 */
function formatPhone(event) {
    try {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        event.target.value = value;
    } catch (error) {
        console.error('Error formatting phone:', error);
    }
}

/**
 * Check password strength and update indicator
 */
function checkPasswordStrength(event) {
    try {
        const password = event.target.value;
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthFill || !strengthText) return;
        
        if (!password) {
            strengthFill.style.width = '0%';
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        let strength = 0;
        let strengthLabel = 'Weak';
        let strengthClass = 'weak';
        
        // Calculate strength based on criteria
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        
        // Determine strength level
        if (strength <= 25) {
            strengthLabel = 'Weak';
            strengthClass = 'weak';
        } else if (strength <= 50) {
            strengthLabel = 'Fair';
            strengthClass = 'fair';
        } else if (strength <= 75) {
            strengthLabel = 'Good';
            strengthClass = 'good';
        } else {
            strengthLabel = 'Strong';
            strengthClass = 'strong';
        }
        
        // Update UI
        strengthFill.style.width = strength + '%';
        strengthFill.className = 'strength-fill ' + strengthClass;
        strengthText.textContent = 'Password strength: ' + strengthLabel;
        
    } catch (error) {
        console.error('Error checking password strength:', error);
    }
}

/**
 * Validate password confirmation match
 */
function validatePasswordMatch() {
    try {
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (!password || !confirmPassword) return;
        
        const container = confirmPassword.closest('.input-container');
        if (!container) return;
        
        if (confirmPassword.value && password.value) {
            if (confirmPassword.value === password.value) {
                container.classList.remove('error');
                container.classList.add('valid');
            } else {
                container.classList.remove('valid');
                container.classList.add('error');
            }
        } else {
            container.classList.remove('valid', 'error');
        }
    } catch (error) {
        console.error('Error validating password match:', error);
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        console.log('Attempting login for:', email);
        console.log('Remember me:', rememberMe);
        
        // Basic validation
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        showLoading();
        
        // Create URL encoded form data
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);
        params.append('rememberMe', rememberMe ? 'true' : 'false');
        
        console.log('Login form data:', params.toString());
        
        // Send request to AuthController
        const response = await fetch('auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        });
        
        console.log('Login response status:', response.status);
        
        const result = await response.json();
        console.log('Login result:', result);
        
        if (result.success) {
            showMessage(result.message, 'success');
            console.log('Login successful, redirecting to:', result.redirectUrl);
            setTimeout(() => {
                window.location.href = result.redirectUrl;
            }, 1500);
        } else {
            showMessage(result.message, 'error');
            console.log('Login failed:', result.message);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please check your connection and try again.', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(event) {
    event.preventDefault();
    
    try {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        console.log('Attempting signup for:', email);
        console.log('First name:', firstName);
        console.log('Last name:', lastName);
        console.log('Phone:', phone);
        console.log('Terms agreed:', agreeTerms);
        
        // Comprehensive validation
        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (phone.length !== 10) {
            showMessage('Please enter a valid 10-digit phone number', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (!agreeTerms) {
            showMessage('Please agree to the terms and conditions', 'error');
            return;
        }
        
        showLoading();
        
        // Create URL encoded form data - matching Java parameter names exactly
        const params = new URLSearchParams();
        params.append('firstName', firstName);
        params.append('lastName', lastName);
        params.append('phone', phone);
        params.append('email', email);
        params.append('password', password);
        params.append('confirmPassword', confirmPassword);
        
        console.log('Signup form data:', params.toString());
        
        // Send request to AuthController
        const response = await fetch('auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        });
        
        console.log('Signup response status:', response.status);
        
        const result = await response.json();
        console.log('Signup result:', result);
        
        if (result.success) {
            showMessage(result.message, 'success');
            console.log('Signup successful, redirecting to:', result.redirectUrl);
            setTimeout(() => {
                window.location.href = result.redirectUrl;
            }, 1500);
        } else {
            showMessage(result.message, 'error');
            console.log('Signup failed:', result.message);
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Registration failed. Please check your connection and try again.', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show message to user
 */
function showMessage(message, type) {
    try {
        if (!messageContainer) return;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        
        messageContainer.innerHTML = `<i class="fas ${icon}"></i>${message}`;
        messageContainer.className = `message-container show ${type}`;
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
            clearMessages();
        }, 5000);
        
    } catch (error) {
        console.error('Error showing message:', error);
    }
}

/**
 * Clear all messages
 */
function clearMessages() {
    try {
        if (messageContainer) {
            messageContainer.classList.remove('show', 'success', 'error');
            messageContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('Error clearing messages:', error);
    }
}

/**
 * Show loading overlay
 */
function showLoading() {
    try {
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
            console.log('Loading overlay shown');
        }
    } catch (error) {
        console.error('Error showing loading:', error);
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    try {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
            console.log('Loading overlay hidden');
        }
    } catch (error) {
        console.error('Error hiding loading:', error);
    }
}

console.log('Pahana Edu - Login/Signup JavaScript loaded successfully');