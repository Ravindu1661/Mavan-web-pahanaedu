/**
 * Customer Profile JavaScript
 * Handles profile management and security settings
 */

// Global variables
let currentProfile = null;
let isLoading = false;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    setupEventListeners();
    loadProfileData();
});

/**
 * Initialize profile page
 */
function initializeProfile() {
    console.log('Customer Profile: Initializing...');
    
    // Add fade-in animation to main elements
    const animatedElements = document.querySelectorAll('.profile-sidebar, .profile-main-content');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }
    
    // Password strength checking
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Confirm password matching
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
    
    console.log('Customer Profile: Event listeners set up');
}

/**
 * Load profile data from server
 */
async function loadProfileData() {
    try {
        showLoading(true);
        
        const response = await fetch('customer/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=get'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message || 'Failed to load profile data');
        }
        
        currentProfile = data;
        populateProfileData(data);
        
        // Load additional statistics
        await loadProfileStats();
        
        console.log('Customer Profile: Profile data loaded successfully');
        
    } catch (error) {
        console.error('Customer Profile: Error loading profile data:', error);
        showNotification('Failed to load profile data: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Load profile statistics
 */
async function loadProfileStats() {
    try {
        const response = await fetch('customer/dashboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=stats'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (!data.error) {
                updateProfileStats(data);
            }
        }
    } catch (error) {
        console.error('Customer Profile: Error loading stats:', error);
    }
}

/**
 * Populate profile data in forms
 */
function populateProfileData(data) {
    // Personal information
    document.getElementById('firstName').value = data.firstName || '';
    document.getElementById('lastName').value = data.lastName || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    
    // Sidebar profile info
    const sidebarInfo = document.getElementById('profileSidebarInfo');
    if (sidebarInfo) {
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        sidebarInfo.innerHTML = `
            <h3 class="profile-name">${fullName || 'User'}</h3>
            <p class="profile-email">${data.email || ''}</p>
            <span class="profile-status ${data.status === 'active' ? 'active' : 'inactive'}">
                <i class="fas fa-circle"></i> ${data.status === 'active' ? 'Active Account' : 'Inactive Account'}
            </span>
        `;
    }
    
    // Security info
    if (data.createdAt) {
        const createdDate = new Date(data.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const accountCreatedElement = document.getElementById('accountCreatedDate');
        if (accountCreatedElement) {
            accountCreatedElement.textContent = createdDate;
        }
    }
    
    // Set last login time (current time for demonstration)
    const lastLoginElement = document.getElementById('lastLoginTime');
    if (lastLoginElement) {
        lastLoginElement.textContent = 'Just now';
    }
}

/**
 * Update profile statistics
 */
function updateProfileStats(data) {
    const totalOrdersElement = document.getElementById('totalOrdersCount');
    const totalSpentElement = document.getElementById('totalSpentAmount');
    
    if (totalOrdersElement) {
        totalOrdersElement.textContent = data.totalOrders || '0';
    }
    
    if (totalSpentElement) {
        const amount = data.totalSpent ? parseFloat(data.totalSpent) : 0;
        totalSpentElement.textContent = `Rs. ${amount.toFixed(2)}`;
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Add animation
    const activePanel = document.getElementById(`${tabName}Tab`);
    activePanel.style.opacity = '0';
    activePanel.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        activePanel.style.transition = 'all 0.3s ease';
        activePanel.style.opacity = '1';
        activePanel.style.transform = 'translateX(0)';
    }, 50);
    
    console.log(`Customer Profile: Switched to ${tabName} tab`);
}

/**
 * Handle profile form submission
 */
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    try {
        // Clear previous errors
        clearFormErrors();
        
        // Validate form
        if (!validateProfileForm()) {
            return;
        }
        
        showLoading(true);
        
        const formData = new FormData(event.target);
        const params = new URLSearchParams();
        params.append('action', 'update');
        
        for (let [key, value] of formData) {
            params.append(key, value);
        }
        
        const response = await fetch('customer/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message || 'Failed to update profile');
        }
        
        if (data.success) {
            showNotification('Profile updated successfully!', 'success');
            
            // Update navbar if name changed
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const fullName = `${firstName} ${lastName}`.trim();
            
            // Update sidebar
            const profileName = document.querySelector('.profile-name');
            if (profileName) {
                profileName.textContent = fullName;
            }
            
            // Update navbar user name if function exists
            if (typeof updateNavbarUserName === 'function') {
                updateNavbarUserName(fullName);
            }
            
            console.log('Customer Profile: Profile updated successfully');
        } else {
            throw new Error(data.message || 'Failed to update profile');
        }
        
    } catch (error) {
        console.error('Customer Profile: Error updating profile:', error);
        showNotification('Failed to update profile: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Handle password form submission
 */
async function handlePasswordSubmit(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    try {
        // Clear previous errors
        clearPasswordErrors();
        
        // Validate password form
        if (!validatePasswordForm()) {
            return;
        }
        
        showLoading(true);
        
        const formData = new FormData(event.target);
        const params = new URLSearchParams();
        params.append('action', 'change-password');
        
        for (let [key, value] of formData) {
            params.append(key, value);
        }
        
        const response = await fetch('customer/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message || 'Failed to change password');
        }
        
        if (data.success) {
            showNotification('Password changed successfully!', 'success');
            resetPasswordForm();
            console.log('Customer Profile: Password changed successfully');
        } else {
            throw new Error(data.message || 'Failed to change password');
        }
        
    } catch (error) {
        console.error('Customer Profile: Error changing password:', error);
        showNotification('Failed to change password: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Validate profile form
 */
function validateProfileForm() {
    let isValid = true;
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // First name validation
    if (!firstName) {
        showFieldError('firstName', 'First name is required');
        isValid = false;
    } else if (firstName.length < 2) {
        showFieldError('firstName', 'First name must be at least 2 characters');
        isValid = false;
    }
    
    // Last name validation
    if (!lastName) {
        showFieldError('lastName', 'Last name is required');
        isValid = false;
    } else if (lastName.length < 2) {
        showFieldError('lastName', 'Last name must be at least 2 characters');
        isValid = false;
    }
    
    // Phone validation (optional but if provided, must be valid)
    if (phone && !isValidPhoneNumber(phone)) {
        showFieldError('phone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate password form
 */
function validatePasswordForm() {
    let isValid = true;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Current password validation
    if (!currentPassword) {
        showPasswordError('currentPassword', 'Current password is required');
        isValid = false;
    }
    
    // New password validation
    if (!newPassword) {
        showPasswordError('newPassword', 'New password is required');
        isValid = false;
    } else if (newPassword.length < 6) {
        showPasswordError('newPassword', 'Password must be at least 6 characters');
        isValid = false;
    } else if (!isStrongPassword(newPassword)) {
        showPasswordError('newPassword', 'Password must contain letters, numbers, and special characters');
        isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
        showPasswordError('confirmPassword', 'Please confirm your new password');
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        showPasswordError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    // Check if new password is different from current
    if (currentPassword && newPassword && currentPassword === newPassword) {
        showPasswordError('newPassword', 'New password must be different from current password');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Check password strength
 */
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthIndicator.textContent = '';
        strengthIndicator.className = 'password-strength';
        return;
    }
    
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) strength++;
    else feedback.push('at least 8 characters');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('uppercase letter');
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('lowercase letter');
    
    // Number check
    if (/\d/.test(password)) strength++;
    else feedback.push('number');
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    else feedback.push('special character');
    
    // Update strength indicator
    if (strength < 3) {
        strengthIndicator.textContent = `Weak - Add: ${feedback.join(', ')}`;
        strengthIndicator.className = 'password-strength weak';
    } else if (strength < 5) {
        strengthIndicator.textContent = `Medium - Consider adding: ${feedback.join(', ')}`;
        strengthIndicator.className = 'password-strength medium';
    } else {
        strengthIndicator.textContent = 'Strong password';
        strengthIndicator.className = 'password-strength strong';
    }
}

/**
 * Check password match
 */
function checkPasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirmPassword && newPassword !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        errorElement.classList.add('show');
    } else {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

/**
 * Toggle password visibility
 */
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

/**
 * Format phone number
 */
function formatPhoneNumber() {
    const input = document.getElementById('phone');
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Sri Lankan phone number formatting
    if (value.startsWith('94')) {
        // International format
        value = value.substring(0, 11);
        if (value.length > 2) {
            value = '+94 ' + value.substring(2);
        }
    } else if (value.startsWith('0')) {
        // Local format
        value = value.substring(0, 10);
        if (value.length > 3) {
            value = value.substring(0, 3) + ' ' + value.substring(3);
        }
        if (value.length > 7) {
            value = value.substring(0, 7) + ' ' + value.substring(7);
        }
    }
    
    input.value = value;
}

/**
 * Reset personal information form
 */
function resetPersonalForm() {
    if (currentProfile) {
        populateProfileData(currentProfile);
        clearFormErrors();
        showNotification('Form reset to original values', 'info');
    }
}

/**
 * Reset password form
 */
function resetPasswordForm() {
    const form = document.getElementById('passwordForm');
    if (form) {
        form.reset();
        clearPasswordErrors();
        
        // Clear password strength indicator
        const strengthIndicator = document.getElementById('passwordStrength');
        if (strengthIndicator) {
            strengthIndicator.textContent = '';
            strengthIndicator.className = 'password-strength';
        }
    }
}

/**
 * Utility Functions
 */

/**
 * Show field error
 */
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = 'var(--danger-color)';
    }
}

/**
 * Show password error
 */
function showPasswordError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = 'var(--danger-color)';
    }
}

/**
 * Clear form errors
 */
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('show');
    });
    
    const formFields = document.querySelectorAll('.form-group input');
    formFields.forEach(field => {
        field.style.borderColor = '';
    });
}

/**
 * Clear password errors
 */
function clearPasswordErrors() {
    const passwordErrors = document.querySelectorAll('#securityTab .error-message');
    passwordErrors.forEach(element => {
        element.textContent = '';
        element.classList.remove('show');
    });
    
    const passwordFields = document.querySelectorAll('#securityTab .form-group input');
    passwordFields.forEach(field => {
        field.style.borderColor = '';
    });
}

/**
 * Validate phone number
 */
function isValidPhoneNumber(phone) {
    // Remove spaces and special characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Sri Lankan phone patterns
    const patterns = [
        /^94[0-9]{9}$/, // International format: 94xxxxxxxxx
        /^0[0-9]{9}$/,  // Local format: 0xxxxxxxxx
        /^[0-9]{9}$/    // Without leading zero: xxxxxxxxx
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Check if password is strong
 */
function isStrongPassword(password) {
    // At least 6 characters, contains letters and numbers
    return password.length >= 6 && 
           /[A-Za-z]/.test(password) && 
           /\d/.test(password);
}

/**
 * Show loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('show');
            isLoading = true;
        } else {
            overlay.classList.remove('show');
            isLoading = false;
        }
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    // Try to use SweetAlert2 if available
    if (typeof Swal !== 'undefined') {
        const config = {
            title: type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info',
            text: message,
            icon: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: {
                popup: 'swal-toast',
                title: 'swal-toast-title',
                content: 'swal-toast-content'
            }
        };
        
        Swal.fire(config);
    } else {
        // Fallback to custom notification
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type} show`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    console.log(`Customer Profile: ${type.toUpperCase()} - ${message}`);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Unknown';
    }
}

/**
 * Debounce function for input handling
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + S to save profile
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const activeTab = document.querySelector('.tab-panel.active');
        if (activeTab && activeTab.id === 'personalTab') {
            const form = document.getElementById('profileForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    }
    
    // Escape to close loading overlay
    if (event.key === 'Escape' && isLoading) {
        showLoading(false);
    }
});

/**
 * Handle visibility change (tab switching)
 */
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Refresh data when user returns to tab
        console.log('Customer Profile: Tab became visible, refreshing data...');
        // Could implement auto-refresh here if needed
    }
});

/**
 * Before unload warning for unsaved changes
 */
let hasUnsavedChanges = false;

// Track form changes
document.addEventListener('input', function(event) {
    if (event.target.closest('#profileForm') || event.target.closest('#passwordForm')) {
        hasUnsavedChanges = true;
    }
});

// Reset unsaved changes flag on successful submit
document.addEventListener('submit', function(event) {
    if (event.target.id === 'profileForm' || event.target.id === 'passwordForm') {
        // Will be reset after successful submission
        setTimeout(() => {
            hasUnsavedChanges = false;
        }, 1000);
    }
});

// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', function(event) {
    if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
    }
});

/**
 * Initialize tooltips and help text
 */
function initializeTooltips() {
    // Add help icons and tooltips for form fields
    const helpTexts = {
        phone: 'Enter your phone number in format: +94 XX XXX XXXX or 0XX XXX XXXX',
        newPassword: 'Password should be at least 6 characters with letters, numbers, and special characters'
    };
    
    Object.keys(helpTexts).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            const helpIcon = document.createElement('span');
            helpIcon.className = 'help-icon';
            helpIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
            helpIcon.title = helpTexts[fieldId];
            helpIcon.style.cssText = `
                margin-left: 5px;
                color: var(--text-muted);
                cursor: help;
                font-size: 12px;
            `;
            
            const label = field.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.appendChild(helpIcon);
            }
        }
    });
}

// Initialize tooltips when DOM is ready
document.addEventListener('DOMContentLoaded', initializeTooltips);

console.log('Customer Profile: JavaScript initialized successfully');