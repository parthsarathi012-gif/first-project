// ============================================================================
// STUDY HUB - MAIN JAVASCRIPT
// ============================================================================

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  
  // Check if on admin page
  if (window.location.pathname.includes('admin.html')) {
    setupAdminPanel();
  } else {
    setupFormValidation();
    setupNavigationHandlers();
    setupSignOut();
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeApp() {
  console.log('Study Hub initialized');
  checkUserSession();
}

// ============================================================================
// USER SESSION MANAGEMENT
// ============================================================================

function saveUserData(userData) {
  localStorage.setItem('studyHubUser', JSON.stringify(userData));
  console.log('✓ User data saved to localStorage:', userData);
}

function getUserData() {
  const userData = localStorage.getItem('studyHubUser');
  return userData ? JSON.parse(userData) : null;
}

function isEmailAlreadyRegistered(email) {
  const user = getUserData();
  if (user && user.email === email) {
    return true;
  }
  return false;
}

function checkUserSession() {
  const user = getUserData();
  const currentPage = getCurrentPage();
  
  // If no user is logged in and not on login/registration/admin page, redirect to login
  if (!user && currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'admin') {
    window.location.href = 'index.html';
  }
}

function getCurrentPage() {
  const currentPath = window.location.pathname;
  if (currentPath.includes('admin.html')) return 'admin';
  if (currentPath.includes('registration.html')) return 'register';
  if (currentPath.includes('choosing.html')) return 'choose';
  if (currentPath.includes('index.html') || currentPath === '/') return 'login';
  return 'unknown';
}

function logoutUser() {
  localStorage.removeItem('studyHubUser');
  window.location.href = 'index.html';
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

function setupFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // Validate form fields
  if (!validateForm(form)) {
    return;
  }

  // Collect form data
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Handle different form types
  if (form.querySelector('#email') && form.querySelector('#password')) {
    const isRegistration = form.querySelector('#fullname');
    
    if (isRegistration) {
      // Check if email is already registered
      if (isEmailAlreadyRegistered(data.email)) {
        showRegistrationError('This email is already registered! Please login or use a different email.');
        return;
      }
      handleRegistration(data, form);
    } else {
      handleLogin(data, form);
    }
  }
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required]');
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      showError(input, 'This field is required');
      isValid = false;
    } else {
      clearError(input);
      
      // Specific validation rules
      if (input.type === 'email' && !isValidEmail(input.value)) {
        showError(input, 'Please enter a valid email address');
        isValid = false;
      }
      
      if (input.id === 'password' && input.value.length < 8) {
        showError(input, 'Password must be at least 8 characters');
        isValid = false;
      }
      
      if (input.id === 'phone' && !isValidPhone(input.value)) {
        showError(input, 'Please enter a valid phone number');
        isValid = false;
      }
    }
  });
  
  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function showError(input, message) {
  input.classList.add('error');
  
  let errorElement = input.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('error-message')) {
    errorElement = document.createElement('span');
    errorElement.classList.add('error-message');
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }
  errorElement.textContent = message;
}

function clearError(input) {
  input.classList.remove('error');
  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.remove();
  }
}

// ============================================================================
// LOGIN & REGISTRATION HANDLERS
// ============================================================================

function handleLogin(data, form) {
  // Check if email is registered
  const user = getUserData();
  
  if (!user || user.email !== data.email) {
    showLoginError('Email not found! Please register first or check your email.');
    return;
  }
  
  // Check if password matches
  if (user.password !== data.password) {
    showLoginError('Incorrect password! Please try again.');
    return;
  }
  
  // Login successful - clear error and redirect
  const errorBox = document.getElementById('login-error');
  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }
  
  // Show success message
  showMessage('Login successful! Redirecting...', 'success');
  
  // Redirect after 1 second
  setTimeout(() => {
    form.action = 'choosing.html';
    form.submit();
  }, 1000);
}

function handleRegistration(data, form) {
  // Create user object with registration details
  const user = {
    fullName: data.fullname,
    email: data.email,
    grade: data.grade,
    phone: data.phone,
    password: data.password,
    registrationTime: new Date().toISOString()
  };
  
  // Save to localStorage
  saveUserData(user);
  
  // Clear error message if any
  const errorBox = document.getElementById('registration-error');
  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }
  
  // Show success message
  showMessage('Registration successful! Redirecting...', 'success');
  
  // Redirect after 1 second
  setTimeout(() => {
    form.action = 'choosing.html';
    form.submit();
  }, 1000);
}

// ============================================================================
// NAVIGATION HANDLERS
// ============================================================================

function setupNavigationHandlers() {
  // Handle grade selection cards
  const gradeCards = document.querySelectorAll('.why-grid .card, .grid .card');
  gradeCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      const gradeText = this.querySelector('h3')?.textContent;
      if (gradeText) {
        navigateToGrade(gradeText);
      }
    });
  });
  
  // Handle navigation links
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      // Let normal navigation work
      if (this.href.includes('#')) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

function navigateToGrade(grade) {
  const user = getUserData();
  if (user) {
    user.selectedGrade = grade;
    saveUserData(user);
    
    // Map grade text to HTML files
    const gradeMap = {
      'Grade 9': '9th.html',
      'Grade 10': '10th.html',
      'Grade 11': '11th.html',
      'Grade 12': '12th.html'
    };
    
    const targetPage = gradeMap[grade];
    if (targetPage) {
      console.log('Navigating to:', targetPage);
      window.location.href = targetPage;
    } else {
      console.log('Grade not found:', grade);
    }
  }
}

// ============================================================================
// SIGN OUT FUNCTIONALITY
// ============================================================================

function setupSignOut() {
  // Find sign out button
  const signOutPanel = document.querySelector('.sign-out-panel');
  if (signOutPanel) {
    // Create sign out button if it doesn't exist
    let signOutButton = signOutPanel.querySelector('button');
    if (!signOutButton) {
      signOutButton = document.createElement('button');
      signOutButton.textContent = 'Sign out';
      signOutButton.classList.add('sign-out-button');
      signOutPanel.appendChild(signOutButton);
    }
    
    signOutButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to sign out?')) {
        logoutUser();
      }
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showMessage(message, type = 'info') {
  // Create message container if it doesn't exist
  let messageContainer = document.getElementById('message-container');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    document.body.insertBefore(messageContainer, document.body.firstChild);
  }
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `message-${type}`);
  messageElement.textContent = message;
  
  messageContainer.appendChild(messageElement);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

function showRegistrationError(message) {
  const errorBox = document.getElementById('registration-error');
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    errorBox.style.color = '#d32f2f';
    errorBox.style.backgroundColor = '#ffebee';
    errorBox.style.border = '1px solid #d32f2f';
    errorBox.style.padding = '10px 12px';
    errorBox.style.borderRadius = '4px';
    errorBox.style.marginBottom = '15px';
    errorBox.style.fontSize = '14px';
    errorBox.style.fontWeight = '500';
  }
}

function showLoginError(message) {
  const errorBox = document.getElementById('login-error');
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    errorBox.style.color = '#d32f2f';
    errorBox.style.backgroundColor = '#ffebee';
    errorBox.style.border = '1px solid #d32f2f';
    errorBox.style.padding = '10px 12px';
    errorBox.style.borderRadius = '4px';
    errorBox.style.marginBottom = '15px';
    errorBox.style.fontSize = '14px';
    errorBox.style.fontWeight = '500';
  }
}

// ============================================================================
// ADMIN PANEL
// ============================================================================

// Admin credentials (for demo - change in production)
const ADMIN_CREDENTIALS = {
  email: 'admin@studyhub.com',
  password: 'parth'
};

function setupAdminPanel() {
  const adminSession = localStorage.getItem('adminSession');
  
  if (adminSession) {
    // Admin already logged in
    showAdminPanel();
  } else {
    // Show admin login form
    setupAdminLoginForm();
  }
}

function setupAdminLoginForm() {
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  // Validate credentials
  if (email !== ADMIN_CREDENTIALS.email) {
    showAdminLoginError('Invalid email address');
    return;
  }
  
  if (password !== ADMIN_CREDENTIALS.password) {
    showAdminLoginError('Invalid password');
    return;
  }
  
  // Admin login successful
  const adminSession = {
    email: email,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('adminSession', JSON.stringify(adminSession));
  console.log('✓ Admin logged in successfully');
  
  showAdminPanel();
}

function showAdminLoginError(message) {
  const errorBox = document.getElementById('admin-login-error');
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    errorBox.style.color = '#d32f2f';
    errorBox.style.backgroundColor = '#ffebee';
    errorBox.style.border = '1px solid #d32f2f';
    errorBox.style.padding = '10px 12px';
    errorBox.style.borderRadius = '4px';
    errorBox.style.marginBottom = '15px';
    errorBox.style.fontSize = '14px';
    errorBox.style.fontWeight = '500';
  }
}

function showAdminPanel() {
  const loginContainer = document.getElementById('admin-login');
  const adminPanel = document.getElementById('admin-panel');
  
  if (loginContainer) loginContainer.style.display = 'none';
  if (adminPanel) adminPanel.style.display = 'block';
  
  // Load and display all users
  displayAllUsers();
  
  // Setup logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to logout?')) {
        adminLogout();
      }
    });
  }
}

function displayAllUsers() {
  const tbody = document.getElementById('users-tbody');
  const totalUsersSpan = document.getElementById('total-users');
  const usersBadge = document.getElementById('users-badge');
  
  // Get all users from localStorage
  // Note: In current setup, we only have one user at a time
  // For a real app, you'd need a backend database
  const user = getUserData();
  
  if (!user) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #cbd5e1; padding: 40px;"><p style="font-size: 1.1rem;">✨ No users registered yet</p></td></tr>';
    totalUsersSpan.textContent = '0';
    usersBadge.textContent = '0 users';
    return;
  }
  
  // Display user
  const registrationDate = new Date(user.registrationTime).toLocaleDateString();
  const row = `
    <tr>
      <td>${user.fullName || 'N/A'}</td>
      <td>${user.email || 'N/A'}</td>
      <td>${user.grade || 'N/A'}</td>
      <td>${user.phone || 'N/A'}</td>
      <td>${registrationDate}</td>
      <td><button class="view-user-btn" onclick="alert('📋 User Details:\\n\\n👤 Name: ${user.fullName}\\n📧 Email: ${user.email}\\n📚 Grade: ${user.grade}\\n📱 Phone: ${user.phone}\\n📅 Registered: ${registrationDate}')">View Details</button></td>
    </tr>
  `;
  
  tbody.innerHTML = row;
  totalUsersSpan.textContent = '1';
  usersBadge.textContent = '1 user';
}

function adminLogout() {
  localStorage.removeItem('adminSession');
  console.log('✓ Admin logged out');
  // Reload page to show login form
  window.location.href = 'admin.html';
}

// ============================================================================
// END OF FILE
// ============================================================================

// ============================================================================
// END OF SCRIPT
// ============================================================================