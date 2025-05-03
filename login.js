document.addEventListener('DOMContentLoaded', () => {
  const authBtn = document.getElementById('auth-btn');
  const adminLink = document.getElementById('admin-link');
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginMessage = document.getElementById('login-message');
  const signupMessage = document.getElementById('signup-message');
  const switchToSignup = document.getElementById('switch-to-signup');
  const closeButtons = document.querySelectorAll('.close-btn');

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email) {
    authBtn.textContent = `Logout (${user.fullName})`;
    authBtn.onclick = () => {
      localStorage.removeItem('user');
      window.location.reload();
    };
    if (!user.isAdmin) {
      adminLink.style.display = 'none';
    }
  } else {
    authBtn.onclick = () => {
      window.location.href = 'login.html?show=login';
    };
  }

  // Handle query param to show modal
  const params = new URLSearchParams(window.location.search);
  const show = params.get('show');
  if (show === 'login') {
    loginModal.classList.remove('hidden');
  } else if (show === 'signup') {
    signupModal.classList.remove('hidden');
  }

  // Close modals
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      loginModal.classList.add('hidden');
      signupModal.classList.add('hidden');
      window.location.href = 'home.html';
    });
  });

  // Switch to signup
  switchToSignup.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    signupModal.classList.remove('hidden');
    loginMessage.textContent = '';
  });

  // Handle login form submission
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const emailOrUserId = document.getElementById('email-or-userid').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!emailOrUserId || !password) {
      loginMessage.textContent = 'Please fill all fields.';
      loginMessage.classList.add('error');
      return;
    }

    fetch('https://library-arnab.onrender.com/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({"email": emailOrUserId, "password": password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          loginMessage.textContent = 'Invalid credentials.';
          loginMessage.classList.add('error');
          return;
        }
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          isAdmin: data.isAdmin || false
        }));
        loginMessage.textContent = 'Login successful!';
        loginMessage.classList.remove('error');
        loginMessage.classList.add('success');
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);
      })
      .catch(error => {
        console.error('Error logging in:', error);
        loginMessage.textContent = 'Failed to login.';
        loginMessage.classList.add('error');
      });
  });

  // Handle signup form submission
  signupForm.addEventListener('submit', event => {
    event.preventDefault();
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const state = document.getElementById('state').value.trim();
    const city = document.getElementById('city').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!firstName || !lastName || !gender || !state || !city || !email || !password) {
      signupMessage.textContent = 'Please fill all fields.';
      signupMessage.classList.add('error');
      return;
    }

    fetch('https://library-arnab.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        gender,
        state,
        city,
        email,
        password
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          signupMessage.textContent = 'Failed to sign up.';
          signupMessage.classList.add('error');
          return;
        }
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          fullName: `${firstName} ${lastName}`,
          email: data.email,
          isAdmin: false
        }));
        signupMessage.textContent = 'Sign up successful!';
        signupMessage.classList.remove('error');
        signupMessage.classList.add('success');
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);
      })
      .catch(error => {
        console.error('Error signing up:', error);
        signupMessage.textContent = 'Failed to sign up.';
        signupMessage.classList.add('error');
      });
  });
});