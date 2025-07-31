<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="javax.servlet.http.HttpSession" %>
<%
    // Check if user is already logged in for password change
    HttpSession userSession = request.getSession(false);
    boolean isLoggedIn = (userSession != null && Boolean.TRUE.equals(userSession.getAttribute("isLoggedIn")));
    String loggedInEmail = isLoggedIn ? (String) userSession.getAttribute("userEmail") : "";
    String userRole = isLoggedIn ? (String) userSession.getAttribute("userRole") : "";
%>
<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Management - PahanaEdu</title>
    <style>
        :root {
            /* Color Palette - Medical/Health Inspired */
            --primary-color: #0077B6; /* Calm Blue – Trustworthy */
            --secondary-color: #90E0EF; /* Light Aqua – Freshness, Relief */
            --accent-color: #00B4D8; /* Highlight buttons/links */
            --background-color: #F8F9FA; /* Light Gray – Clean, Minimal */
            --text-primary: #212529; /* Almost Black – Easy Readability */
            --text-secondary: #6C757D; /* Muted Gray – For hints/labels */
            --alert-color: #D00000; /* For form errors, warnings */
            --success-color: #38B000; /* For success messages/status */
            --white: #FFFFFF;
            --light-blue: rgba(0, 119, 182, 0.1);
            --light-aqua: rgba(144, 224, 239, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--background-color);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .password-container {
            background: var(--white);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
            border: 1px solid var(--light-blue);
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .header h1 {
            color: var(--primary-color);
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 0.95rem;
        }

        .user-info {
            background: var(--light-blue);
            padding: 0.75rem 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: var(--primary-color);
        }

        .user-info strong {
            color: var(--text-primary);
        }

        .tab-container {
            display: flex;
            margin-bottom: 2rem;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #E9ECEF;
        }

        .tab-button {
            flex: 1;
            padding: 0.75rem 1rem;
            background: #F8F9FA;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.3s ease;
            color: var(--text-secondary);
        }

        .tab-button.active {
            background: var(--primary-color);
            color: var(--white);
        }

        .tab-button:hover:not(.active) {
            background: var(--light-blue);
            color: var(--primary-color);
        }

        .tab-button:disabled {
            background: #F8F9FA;
            color: var(--text-secondary);
            cursor: not-allowed;
            opacity: 0.6;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
            font-weight: 500;
            font-size: 0.95rem;
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #E9ECEF;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background-color: var(--white);
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px var(--light-blue);
        }

        .form-group input:invalid {
            border-color: var(--alert-color);
        }

        .form-group input:disabled {
            background-color: #F8F9FA;
            color: var(--text-secondary);
            cursor: not-allowed;
        }

        .submit-btn {
            width: 100%;
            padding: 0.85rem;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: var(--white);
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 1rem;
        }

        .submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 119, 182, 0.3);
        }

        .submit-btn:active:not(:disabled) {
            transform: translateY(0);
        }

        .submit-btn:disabled {
            background: var(--text-secondary);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
            opacity: 0.7;
        }

        .message {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            display: none;
            word-wrap: break-word;
        }

        .message.success {
            background-color: rgba(56, 176, 0, 0.1);
            border: 1px solid var(--success-color);
            color: var(--success-color);
        }

        .message.error {
            background-color: rgba(208, 0, 0, 0.1);
            border: 1px solid var(--alert-color);
            color: var(--alert-color);
        }

        .temp-password {
            background-color: var(--light-aqua);
            border: 2px solid var(--secondary-color);
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            font-size: 1.1rem;
            text-align: center;
            font-weight: bold;
            color: var(--primary-color);
            position: relative;
            word-break: break-all;
        }

        .copy-btn {
            background: var(--primary-color);
            color: var(--white);
            border: none;
            border-radius: 4px;
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
            cursor: pointer;
            margin-left: 0.5rem;
            transition: background 0.3s ease;
            font-weight: 500;
        }

        .copy-btn:hover {
            background: var(--accent-color);
        }

        .back-link {
            text-align: center;
            margin-top: 1.5rem;
        }

        .back-link a {
            color: var(--accent-color);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.3s ease;
            margin: 0 1rem;
        }

        .back-link a:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }

        .loading {
            display: none;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin: 1rem 0;
        }

        .loading::after {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-left: 8px;
            border: 2px solid var(--light-blue);
            border-top: 2px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .password-requirements {
            background: var(--light-blue);
            padding: 1rem;
            border-radius: 6px;
            margin-top: 0.5rem;
            font-size: 0.85rem;
        }

        .requirement {
            display: flex;
            align-items: center;
            margin: 0.25rem 0;
        }

        .requirement.met {
            color: var(--success-color);
        }

        .requirement.unmet {
            color: var(--text-secondary);
        }

        .requirement::before {
            content: "✓";
            margin-right: 0.5rem;
            font-weight: bold;
        }

        .requirement.unmet::before {
            content: "○";
        }

        .step-indicator {
            background: var(--light-aqua);
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: var(--primary-color);
            text-align: center;
            font-weight: 500;
        }

        .role-restriction {
            background: rgba(208, 0, 0, 0.1);
            border: 1px solid var(--alert-color);
            color: var(--alert-color);
            padding: 1rem;
            border-radius: 6px;
            text-align: center;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }

        .security-note {
            background: var(--light-blue);
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 0.85rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent-color);
        }

        .password-display {
            font-size: 1.2rem; 
            font-weight: bold; 
            margin: 10px 0; 
            padding: 15px; 
            background: rgba(0, 119, 182, 0.1); 
            border-radius: 5px; 
            color: var(--primary-color); 
            word-break: break-all;
            text-align: center;
            border: 2px solid var(--secondary-color);
            font-family: 'Courier New', monospace;
        }

        @media (max-width: 480px) {
            .password-container {
                margin: 1rem;
                padding: 1.5rem;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }

            .tab-button {
                font-size: 0.85rem;
                padding: 0.6rem 0.8rem;
            }

            .back-link a {
                display: block;
                margin: 0.5rem 0;
            }
        }
    </style>
</head>
<body>
    <div class="password-container">
        <div class="header">
            <h1>Password Management</h1>
            <p>Reset your password or change to a new one</p>
        </div>

        <% if (isLoggedIn) { %>
        <div class="user-info">
            <strong>Logged in as:</strong> <%= loggedInEmail %> (<%= userRole %>)
        </div>
        <% } %>

        <div class="tab-container">
            <button class="tab-button active" onclick="switchTab('reset')" id="resetTabBtn">Reset Password</button>
            <button class="tab-button" onclick="switchTab('change')" id="changeTabBtn" 
                    <% if (!isLoggedIn) { %>disabled title="Login required for password change"<% } %>>
                Change Password
            </button>
        </div>

        <div id="messageDiv" class="message"></div>

        <!-- Password Reset Tab -->
        <div id="resetTab" class="tab-content active">
            <div class="step-indicator">
                Step 1: Enter your email to reset password
            </div>

            <div class="security-note">
                <strong>Security Notice:</strong> Password reset is only available for customer accounts. 
                Admin and staff members should contact the administrator for password assistance.
            </div>
            
            <form id="resetForm">
                <div class="form-group">
                    <label for="resetEmail">Email Address</label>
                    <input type="email" id="resetEmail" name="email" required 
                           placeholder="Enter your registered email address"
                           autocomplete="email">
                </div>

                <button type="submit" id="resetBtn" class="submit-btn">
                    Reset Password
                </button>
            </form>

            <div id="tempPasswordSection" style="display: none;">
                <div class="step-indicator">
                    Step 2: Use temporary password to login immediately
                </div>
                
                <div class="security-note">
                    <strong>Important:</strong> This temporary password will be shown only once. 
                    Copy it and use it to login immediately, then change it to a secure password.
                </div>
                
                <div id="tempPasswordDisplay"></div>
                
                <div class="back-link" style="margin-top: 1rem;">
                    <a href="<%= request.getContextPath() %>/login-signup.jsp" class="submit-btn" style="display: inline-block; text-decoration: none; text-align: center;">
                        Go to Login Page
                    </a>
                </div>
            </div>
        </div>

        <!-- Password Change Tab -->
        <div id="changeTab" class="tab-content">
            <% if (isLoggedIn) { %>
                <div class="step-indicator">
                    Change your current password to a new secure password
                </div>
            <% } else { %>
                <div class="role-restriction">
                    <strong>Login Required</strong><br>
                    You must be logged in to change your password. Please login first or use the password reset option.
                </div>
            <% } %>
            
            <form id="changeForm" <% if (!isLoggedIn) { %>style="display: none;"<% } %>>
                <div class="form-group">
                    <label for="changeEmail">Email Address</label>
                    <input type="email" id="changeEmail" name="email" required 
                           placeholder="Enter your email address"
                           autocomplete="email"
                           <% if (isLoggedIn) { %>value="<%= loggedInEmail %>" readonly<% } %>>
                </div>

                <div class="form-group">
                    <label for="currentPassword">Current Password</label>
                    <input type="password" id="currentPassword" name="currentPassword" required 
                           placeholder="Enter your current password"
                           autocomplete="current-password">
                </div>

                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input type="password" id="newPassword" name="newPassword" required 
                           placeholder="Enter new password"
                           autocomplete="new-password">
                    
                    <div class="password-requirements">
                        <div class="requirement unmet" id="req-length">At least 6 characters long</div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirm New Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required 
                           placeholder="Confirm new password"
                           autocomplete="new-password">
                </div>

                <button type="submit" id="changeBtn" class="submit-btn">
                    Change Password
                </button>
            </form>

            <% if (!isLoggedIn) { %>
            <div class="back-link">
                <a href="<%= request.getContextPath() %>/login-signup.jsp">Login First</a>
            </div>
            <% } %>
        </div>

        <div id="loading" class="loading">
            Processing your request...
        </div>

        <div class="back-link">
            <% if (isLoggedIn) { %>
                <a href="<%= request.getContextPath() %>/dashboard">Back to Dashboard</a>
                <a href="<%= request.getContextPath() %>/auth/logout">Logout</a>
            <% } else { %>
                <a href="<%= request.getContextPath() %>/login-signup.jsp">Back to Login</a>
                <a href="<%= request.getContextPath() %>/index.jsp">Home</a>
            <% } %>
        </div>
    </div>

    <script>
        // Global variables
        const contextPath = '<%= request.getContextPath() %>';
        const isLoggedIn = <%= isLoggedIn %>;
        const loggedInEmail = '<%= loggedInEmail %>';

        document.addEventListener('DOMContentLoaded', function() {
            initializePasswordManagement();
        });

        function initializePasswordManagement() {
            // Form elements
            const resetForm = document.getElementById('resetForm');
            const changeForm = document.getElementById('changeForm');
            const messageDiv = document.getElementById('messageDiv');
            const loading = document.getElementById('loading');
            
            // Reset form elements
            const resetEmailInput = document.getElementById('resetEmail');
            const resetBtn = document.getElementById('resetBtn');
            const tempPasswordSection = document.getElementById('tempPasswordSection');
            const tempPasswordDisplay = document.getElementById('tempPasswordDisplay');
            
            // Change form elements
            const changeEmailInput = document.getElementById('changeEmail');
            const currentPasswordInput = document.getElementById('currentPassword');
            const newPasswordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const changeBtn = document.getElementById('changeBtn');

            // Event listeners
            if (resetForm) {
                resetForm.addEventListener('submit', handlePasswordReset);
            }

            if (changeForm && isLoggedIn) {
                changeForm.addEventListener('submit', handlePasswordChange);
            }

            if (newPasswordInput) {
                newPasswordInput.addEventListener('input', checkPasswordRequirements);
            }

            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', checkPasswordMatch);
            }

            // Clear messages when user starts typing
            [resetEmailInput, changeEmailInput, currentPasswordInput].forEach(input => {
                if (input) {
                    input.addEventListener('input', function() {
                        if (messageDiv.style.display === 'block' && messageDiv.classList.contains('error')) {
                            hideMessage();
                        }
                    });
                }
            });

            // Password Reset Handler
            function handlePasswordReset(e) {
                e.preventDefault();
                
                const email = resetEmailInput.value.trim();

                // Client-side validation
                if (!email) {
                    showMessage('Please enter your email address', 'error');
                    resetEmailInput.focus();
                    return;
                }

                if (!isValidEmail(email)) {
                    showMessage('Please enter a valid email address', 'error');
                    resetEmailInput.focus();
                    return;
                }

                setLoadingState(resetBtn, true, 'Processing...');
                hideMessage();

                // Prepare form data using URLSearchParams for better servlet compatibility
                const formData = new URLSearchParams();
                formData.append('email', email);

                fetch(contextPath + '/auth/password-reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Reset response data:', data);
                    console.log('Response message:', JSON.stringify(data.message));
                    
                    if (data.success) {
                        showMessage(data.message, 'success');
                        
                        // Extract password from message
                        const message = data.message;
                        let tempPassword = extractPasswordFromMessage(message);
                        
                        console.log('Final extracted password:', tempPassword);
                        
                        if (tempPassword) {
                            showTempPasswordSection(tempPassword, message);
                            document.getElementById('resetForm').style.display = 'none';
                            tempPasswordSection.style.display = 'block';
                            resetEmailInput.dataset.email = email;
                        } else {
                            // If we can't extract password, show the full message
                            console.log('Could not extract password, showing full message');
                            showManualPasswordSection(message);
                        }
                        
                        resetEmailInput.value = '';
                    } else {
                        showMessage(data.message || 'Password reset failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Reset error:', error);
                    showMessage('Network error occurred. Please check your connection and try again.', 'error');
                })
                .finally(() => {
                    setLoadingState(resetBtn, false, 'Reset Password');
                });
            }

            // Function to extract password from message
            function extractPasswordFromMessage(message) {
                console.log('Extracting password from message:', message);
                
                let tempPassword = null;
                
                // Pattern for: "Your temporary password is: PASSWORD"
                let match = message.match(/Your temporary password is:\s*([^\s\\n\r]+)/i);
                if (match) {
                    tempPassword = match[1];
                    console.log('Found password with pattern 1:', tempPassword);
                    return tempPassword;
                }
                
                // Pattern for: "temporary password is: PASSWORD"
                match = message.match(/temporary password is:\s*([^\s\\n\r]+)/i);
                if (match) {
                    tempPassword = match[1];
                    console.log('Found password with pattern 2:', tempPassword);
                    return tempPassword;
                }
                
                // Pattern for finding password after colon followed by space
                match = message.match(/:\s+([A-Za-z0-9]{6,})/);
                if (match) {
                    tempPassword = match[1];
                    console.log('Found password with pattern 3:', tempPassword);
                    return tempPassword;
                }
                
                // Last resort - find any alphanumeric string that looks like a password (6+ chars)
                const words = message.split(/\s+/);
                for (let word of words) {
                    // Clean word from punctuation
                    const cleanWord = word.replace(/[^A-Za-z0-9]/g, '');
                    if (cleanWord.length >= 6 && /^[A-Za-z0-9]+$/.test(cleanWord)) {
                        tempPassword = cleanWord;
                        console.log('Found password with pattern 4:', tempPassword);
                        return tempPassword;
                    }
                }
                
                return null;
            }

            // Password Change Handler
            function handlePasswordChange(e) {
                e.preventDefault();
                
                if (!isLoggedIn) {
                    showMessage('You must be logged in to change your password', 'error');
                    return;
                }

                const email = changeEmailInput.value.trim();
                const currentPassword = currentPasswordInput.value;
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;

                // Client-side validation
                if (!email) {
                    showMessage('Email address is required', 'error');
                    changeEmailInput.focus();
                    return;
                }

                if (!isValidEmail(email)) {
                    showMessage('Please enter a valid email address', 'error');
                    changeEmailInput.focus();
                    return;
                }

                if (!currentPassword) {
                    showMessage('Current password is required', 'error');
                    currentPasswordInput.focus();
                    return;
                }

                if (!newPassword) {
                    showMessage('New password is required', 'error');
                    newPasswordInput.focus();
                    return;
                }

                if (newPassword.length < 6) {
                    showMessage('New password must be at least 6 characters long', 'error');
                    newPasswordInput.focus();
                    return;
                }

                if (newPassword !== confirmPassword) {
                    showMessage('New passwords do not match', 'error');
                    confirmPasswordInput.focus();
                    return;
                }

                if (currentPassword === newPassword) {
                    showMessage('New password must be different from current password', 'error');
                    newPasswordInput.focus();
                    return;
                }

                setLoadingState(changeBtn, true, 'Changing Password...');
                hideMessage();

                // Prepare form data using URLSearchParams for better servlet compatibility
                const formData = new URLSearchParams();
                formData.append('email', email);
                formData.append('currentPassword', currentPassword);
                formData.append('newPassword', newPassword);
                formData.append('confirmPassword', confirmPassword);

                fetch(contextPath + '/auth/password-change', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showMessage(data.message, 'success');
                        
                        // Clear form
                        currentPasswordInput.value = '';
                        newPasswordInput.value = '';
                        confirmPasswordInput.value = '';
                        
                        // Reset password requirements display
                        checkPasswordRequirements();
                        
                        // Redirect after success
                        setTimeout(() => {
                            showMessage(data.message + '<br><br>Redirecting to login page...', 'success');
                            setTimeout(() => {
                                window.location.href = contextPath + '/auth/login';
                            }, 2000);
                        }, 2000);
                        
                    } else {
                        showMessage(data.message || 'Password change failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Change error:', error);
                    showMessage('Network error occurred. Please check your connection and try again.', 'error');
                })
                .finally(() => {
                    setLoadingState(changeBtn, false, 'Change Password');
                });
            }

            // Password Requirements Checker
            function checkPasswordRequirements() {
                const password = newPasswordInput.value;
                const lengthReq = document.getElementById('req-length');
                
                if (lengthReq) {
                    if (password.length >= 6) {
                        lengthReq.classList.add('met');
                        lengthReq.classList.remove('unmet');
                    } else {
                        lengthReq.classList.remove('met');
                        lengthReq.classList.add('unmet');
                    }
                }
            }

            // Password Match Checker
            function checkPasswordMatch() {
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                if (confirmPassword && newPassword !== confirmPassword) {
                    confirmPasswordInput.style.borderColor = 'var(--alert-color)';
                } else {
                    confirmPasswordInput.style.borderColor = '#E9ECEF';
                }
            }

            // Helper Functions
            function showMessage(message, type) {
                messageDiv.innerHTML = message;
                messageDiv.className = 'message ' + type;
                messageDiv.style.display = 'block';
                
                // Auto-hide error messages after 8 seconds
                if (type === 'error') {
                    setTimeout(() => {
                        if (messageDiv.classList.contains('error')) {
                            hideMessage();
                        }
                    }, 8000);
                }

                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            function hideMessage() {
                messageDiv.style.display = 'none';
                messageDiv.innerHTML = '';
                messageDiv.className = 'message';
            }

            function showTempPasswordSection(tempPassword, fullMessage) {
                console.log('Showing temp password section with password:', tempPassword);
                
                if (!tempPassword) {
                    console.error('No password provided to showTempPasswordSection');
                    return;
                }
                
                const tempPasswordDisplay = document.getElementById('tempPasswordDisplay');
                if (!tempPasswordDisplay) {
                    console.error('tempPasswordDisplay element not found');
                    return;
                }
                
                // Create the HTML content without using template literals to avoid escaping issues
                const passwordDisplayHTML = 
                    '<div class="temp-password">' +
                        '<div style="margin-bottom: 10px; font-size: 0.9rem; color: var(--text-primary);">Your Temporary Password:</div>' +
                        '<div class="password-display">' + tempPassword + '</div>' +
                        '<button type="button" class="copy-btn" onclick="copyToClipboard(\'' + tempPassword + '\')">Copy Password</button>' +
                    '</div>' +
                    '<div class="security-note">' +
                        '<strong>Security Instructions:</strong><br>' +
                        '1. Copy this temporary password immediately<br>' +
                        '2. Use it to login to your account<br>' +
                        '3. Change it to a secure password right away<br>' +
                        '4. This password will not be shown again' +
                    '</div>';
                
                console.log('Setting innerHTML for temp password display');
                tempPasswordDisplay.innerHTML = passwordDisplayHTML;
                
                // Double check if the display was set
                setTimeout(() => {
                    console.log('tempPasswordDisplay innerHTML after set:', tempPasswordDisplay.innerHTML.length > 0 ? 'Content set successfully' : 'Failed to set content');
                }, 100);
            }

            // Function to show manual password section when auto-extraction fails
            function showManualPasswordSection(fullMessage) {
                console.log('Showing manual password section with message:', fullMessage);
                
                const tempPasswordDisplay = document.getElementById('tempPasswordDisplay');
                if (!tempPasswordDisplay) {
                    console.error('tempPasswordDisplay element not found');
                    return;
                }
                
                const passwordDisplayHTML = 
                    '<div class="temp-password">' +
                        '<div style="margin-bottom: 10px; font-size: 0.9rem; color: var(--text-primary);">Password Reset Response:</div>' +
                        '<div style="font-size: 1rem; margin: 10px 0; padding: 15px; background: rgba(0, 119, 182, 0.1); border-radius: 5px; color: var(--primary-color); white-space: pre-wrap; word-break: break-word;">' +
                            fullMessage +
                        '</div>' +
                        '<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 10px;">' +
                            'Please copy your temporary password from the message above.' +
                        '</div>' +
                    '</div>' +
                    '<div class="security-note">' +
                        '<strong>Security Instructions:</strong><br>' +
                        '1. Find and copy your temporary password from the message above<br>' +
                        '2. Use it to login to your account<br>' +
                        '3. Change it to a secure password right away<br>' +
                        '4. This password will not be shown again' +
                    '</div>';
                
                console.log('Setting innerHTML for manual temp password display');
                tempPasswordDisplay.innerHTML = passwordDisplayHTML;
                
                // Show the temp password section
                document.getElementById('resetForm').style.display = 'none';
                document.getElementById('tempPasswordSection').style.display = 'block';
            }

            function setLoadingState(button, isLoading, text) {
                if (button) {
                    button.disabled = isLoading;
                    button.textContent = text || button.textContent;
                }
                loading.style.display = isLoading ? 'block' : 'none';
            }

            function isValidEmail(email) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(email);
            }
        }

        // Tab Switching Function (Global scope)
        function switchTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected tab
            const selectedTab = document.getElementById(tabName + 'Tab');
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
            
            // Activate selected button
            if (event && event.target) {
                event.target.classList.add('active');
            }
            
            // Clear messages and reset temp password section
            const messageDiv = document.getElementById('messageDiv');
            const tempPasswordSection = document.getElementById('tempPasswordSection');
            const resetForm = document.getElementById('resetForm');
            
            if (messageDiv) {
                messageDiv.style.display = 'none';
                messageDiv.innerHTML = '';
            }
            
            if (tempPasswordSection) {
                tempPasswordSection.style.display = 'none';
            }
            
            if (resetForm && tabName === 'reset') {
                resetForm.style.display = 'block';
            }

            // Focus on first input of active tab
            setTimeout(() => {
                const activeTab = document.querySelector('.tab-content.active');
                if (activeTab) {
                    const firstInput = activeTab.querySelector('input:not([disabled]):not([readonly])');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }
            }, 100);
        }

        // Copy to clipboard function (Global scope)
        function copyToClipboard(text) {
            console.log('Attempting to copy:', text);
            
            if (navigator.clipboard && window.isSecureContext) {
                // Modern clipboard API
                navigator.clipboard.writeText(text).then(function() {
                    console.log('Copy successful');
                    showMessage('Temporary password copied to clipboard!', 'success');
                    setTimeout(() => {
                        hideMessage();
                    }, 3000);
                }).catch(function(err) {
                    console.error('Modern clipboard failed:', err);
                    fallbackCopyTextToClipboard(text);
                });
            } else {
                console.log('Using fallback copy method');
                // Fallback for older browsers
                fallbackCopyTextToClipboard(text);
            }
        }

        // Fallback copy function
        function fallbackCopyTextToClipboard(text) {
            console.log('Using fallback copy for:', text);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                console.log('Fallback copy result:', successful);
                if (successful) {
                    showMessage('Temporary password copied to clipboard!', 'success');
                    setTimeout(() => {
                        hideMessage();
                    }, 3000);
                } else {
                    showMessage('Could not copy password. Please select and copy manually: ' + text, 'error');
                }
            } catch (err) {
                console.error('Fallback copy failed:', err);
                showMessage('Copy failed. Your temporary password is: ' + text, 'error');
            }
            
            document.body.removeChild(textArea);
        }

        // Proceed to Password Change Function (Global scope)
        function proceedToPasswordChange() {
            const resetEmail = document.getElementById('resetEmail').dataset.email || 
                              document.getElementById('resetEmail').value;
            
            // Switch to change password tab
            switchTab('change');
            
            // Pre-fill email if available and user is not logged in
            if (resetEmail && !isLoggedIn) {
                const changeEmailInput = document.getElementById('changeEmail');
                if (changeEmailInput) {
                    changeEmailInput.value = resetEmail;
                }
            }
            
            // Focus on current password field
            setTimeout(() => {
                const currentPasswordInput = document.getElementById('currentPassword');
                if (currentPasswordInput) {
                    currentPasswordInput.focus();
                }
            }, 100);
        }

        // Show/Hide message functions (Global scope)
        function showMessage(message, type) {
            const messageDiv = document.getElementById('messageDiv');
            if (messageDiv) {
                messageDiv.innerHTML = message;
                messageDiv.className = 'message ' + type;
                messageDiv.style.display = 'block';
                
                // Auto-hide error messages after 8 seconds
                if (type === 'error') {
                    setTimeout(() => {
                        if (messageDiv.classList.contains('error')) {
                            hideMessage();
                        }
                    }, 8000);
                }

                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function hideMessage() {
            const messageDiv = document.getElementById('messageDiv');
            if (messageDiv) {
                messageDiv.style.display = 'none';
                messageDiv.innerHTML = '';
                messageDiv.className = 'message';
            }
        }

        // Page visibility change handler - clear sensitive data when page is hidden
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Clear temporary password display for security
                const tempPasswordSection = document.getElementById('tempPasswordSection');
                if (tempPasswordSection && tempPasswordSection.style.display !== 'none') {
                    console.log('Page hidden - securing temporary password display');
                }
            }
        });

        // Prevent form submission on Enter key in password fields (security measure)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.type === 'password') {
                // Allow normal form submission behavior
                return true;
            }
        });

        // Auto-focus management
        window.addEventListener('load', function() {
            // Focus on first input field of active tab
            setTimeout(() => {
                const activeTab = document.querySelector('.tab-content.active');
                if (activeTab) {
                    const firstInput = activeTab.querySelector('input:not([disabled]):not([readonly])');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }
            }, 500);
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(e) {
            // Clear any sensitive data when navigating
            const tempPasswordSection = document.getElementById('tempPasswordSection');
            if (tempPasswordSection) {
                tempPasswordSection.style.display = 'none';
            }
            
            const resetForm = document.getElementById('resetForm');
            if (resetForm) {
                resetForm.style.display = 'block';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Escape key to clear messages
            if (e.key === 'Escape') {
                hideMessage();
            }
            
            // Ctrl+Tab or Alt+Tab for tab switching (when focus is on tab buttons)
            if ((e.ctrlKey || e.altKey) && e.key === 'Tab' && 
                document.activeElement && document.activeElement.classList.contains('tab-button')) {
                e.preventDefault();
                const tabButtons = document.querySelectorAll('.tab-button:not([disabled])');
                const currentIndex = Array.from(tabButtons).indexOf(document.activeElement);
                const nextIndex = (currentIndex + 1) % tabButtons.length;
                tabButtons[nextIndex].click();
                tabButtons[nextIndex].focus();
            }
        });
    </script>
</body>
</html>