<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - PahanaEdu</title>
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
        }

        .reset-container {
            background: var(--white);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 450px;
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

        .reset-btn {
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

        .reset-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 119, 182, 0.3);
        }

        .reset-btn:active {
            transform: translateY(0);
        }

        .reset-btn:disabled {
            background: var(--text-secondary);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .message {
            padding: 0.75rem 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            display: none;
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

        .back-link {
            text-align: center;
            margin-top: 1.5rem;
        }

        .back-link a {
            color: var(--accent-color);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.3s ease;
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
            margin-top: 1rem;
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

        .temp-password {
            background-color: var(--light-aqua);
            border: 1px solid var(--secondary-color);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            font-family: 'Courier New', monospace;
            font-size: 1.1rem;
            text-align: center;
            font-weight: bold;
            color: var(--primary-color);
        }

        @media (max-width: 480px) {
            .reset-container {
                margin: 1rem;
                padding: 1.5rem;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="reset-container">
        <div class="header">
            <h1>Password Reset</h1>
            <p>Enter your email address to reset your password</p>
        </div>

        <div id="messageDiv" class="message"></div>

        <form id="resetForm" action="<%= request.getContextPath() %>/auth/password-reset" method="post">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="Enter your email address">
            </div>

            <button type="submit" id="resetBtn" class="reset-btn">
                Reset Password
            </button>
        </form>

        <div id="loading" class="loading">
            Processing your request...
        </div>

        <div class="back-link">
            <a href="<%= request.getContextPath() %>/auth/login">Back to Login</a>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('resetForm');
            const emailInput = document.getElementById('email');
            const resetBtn = document.getElementById('resetBtn');
            const messageDiv = document.getElementById('messageDiv');
            const loading = document.getElementById('loading');

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                handlePasswordReset();
            });

            function handlePasswordReset() {
                const email = emailInput.value.trim();

                if (!email) {
                    showMessage('Please enter your email address', 'error');
                    return;
                }

                if (!isValidEmail(email)) {
                    showMessage('Please enter a valid email address', 'error');
                    return;
                }

                // Show loading state
                resetBtn.disabled = true;
                resetBtn.textContent = 'Processing...';
                loading.style.display = 'block';
                hideMessage();

                // Prepare form data
                const formData = new FormData();
                formData.append('email', email);

                // Send request to the correct endpoint
                fetch('<%= request.getContextPath() %>/auth/password-reset', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showMessage(data.message, 'success');
                        
                        // If the message contains a temporary password, highlight it
                        if (data.message.includes('temporary password is:')) {
                            const tempPasswordMatch = data.message.match(/temporary password is: (\S+)/);
                            if (tempPasswordMatch) {
                                const tempPassword = tempPasswordMatch[1];
                                showTempPassword(tempPassword, data.message);
                            }
                        }
                        
                        // Clear form
                        emailInput.value = '';
                        
                        // Show redirect message after 3 seconds
                        setTimeout(() => {
                            showMessage(data.message + '\\n\\nRedirecting to login page...', 'success');
                            setTimeout(() => {
                                window.location.href = '<%= request.getContextPath() %>/auth/login';
                            }, 2000);
                        }, 3000);
                        
                    } else {
                        showMessage(data.message || 'Password reset failed', 'error');
                    }
                })
                .catch(error => {
                    console.error('Reset error:', error);
                    showMessage('Network error. Please check your connection and try again.', 'error');
                })
                .finally(() => {
                    // Reset button state
                    resetBtn.disabled = false;
                    resetBtn.textContent = 'Reset Password';
                    loading.style.display = 'none';
                });
            }

            function showMessage(message, type) {
                messageDiv.innerHTML = message.replace(/\\n/g, '<br>');
                messageDiv.className = 'message ' + type;
                messageDiv.style.display = 'block';
                
                // Auto-hide error messages after 10 seconds
                if (type === 'error') {
                    setTimeout(() => {
                        hideMessage();
                    }, 10000);
                }
            }

            function showTempPassword(tempPassword, fullMessage) {
                const messageWithHighlight = fullMessage.replace(
                    tempPassword,
                    '<div class="temp-password">' + tempPassword + '</div>'
                );
                messageDiv.innerHTML = messageWithHighlight;
                messageDiv.className = 'message success';
                messageDiv.style.display = 'block';
            }

            function hideMessage() {
                messageDiv.style.display = 'none';
                messageDiv.innerHTML = '';
            }

            function isValidEmail(email) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
                return emailRegex.test(email);
            }

            // Clear message when user starts typing
            emailInput.addEventListener('input', function() {
                if (messageDiv.style.display === 'block' && messageDiv.classList.contains('error')) {
                    hideMessage();
                }
            });
        });
    </script>
</body>
</html>