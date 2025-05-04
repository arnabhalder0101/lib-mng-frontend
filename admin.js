document.addEventListener('DOMContentLoaded', () => {
  const authBtn = document.getElementById('auth-btn');
  const adminLink = document.getElementById('admin-link');
  const adminLoginPopup = document.getElementById('admin-login-popup');
  const adminLoginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('login-error');
  const adminContent = document.getElementById('admin-content');
  const booksTable = document.getElementById('books-table');
  const usersTable = document.getElementById('users-table');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const toggleButtons = document.querySelectorAll('.toggle-btn');

  // Debug: Verify popup element
  console.log('Admin login popup element:', adminLoginPopup);

  // Check if user is logged in
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }
  console.log('Initial user state:', user);

  if (user.email && user.isAdmin) {
    console.log('User is admin, showing admin content');
    authBtn.textContent = `Logout (${user.fullName})`;
    authBtn.onclick = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.reload();
    };
    if (adminLoginPopup) adminLoginPopup.classList.add('hidden');
    if (adminContent) adminContent.classList.remove('hidden');
    loadAdminContent();
  } else {
    console.log('No admin user, showing login popup');
    if (adminLoginPopup) {
      adminLoginPopup.classList.remove('hidden');
    } else {
      console.error('Admin login popup not found');
    }
    authBtn.textContent = 'Login/Signup';
    authBtn.onclick = () => {
      window.location.href = 'login.html?show=login';
    };
  }

  // // Handle admin login form submission
  // if (adminLoginForm) {
  //   adminLoginForm.addEventListener('submit', (e) => {
  //     e.preventDefault();
  //     const email = document.getElementById('admin-email').value;
  //     const password = document.getElementById('admin-password').value;
  //     console.log('Attempting login with email:', email);

  //     fetch('https://library-arnab.onrender.com/api/admin/signin', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     })
  //       .then(response => {
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! Status: ${response.status}`);
  //         }
  //         return response.json();
  //       })
  //       .then(data => {
  //         console.log('Sign-in response:', JSON.stringify(data, null, 2));
  //         if (data.error) {
  //           loginError.textContent = data.error;
  //           loginError.classList.remove('hidden');
  //           return;
  //         }
  //         // Check admin status in data.user with fallbacks
  //         const userData = data.user || {};
  //         const isAdmin = userData.isAdmin || userData.admin || (userData.role === 'admin') || (email === 'admin@lib.com');
  //         console.log('Admin fields:', {
  //           'user.isAdmin': userData.isAdmin,
  //           'user.admin': userData.admin,
  //           'user.role': userData.role,
  //           'emailFallback': email === 'admin@lib.com'
  //         });
  //         if (!isAdmin) {
  //           loginError.textContent = 'You are not authorized as an admin. Response: ' + JSON.stringify(data, null, 2);
  //           loginError.classList.remove('hidden');
  //           return;
  //         }
  //         // Successful admin login
  //         const user = {
  //           _id: userData._id || userData.userId || email,
  //           fullName: userData.fullName || userData.name || 'Admin',
  //           email: userData.email || email,
  //           isAdmin: true,
  //         };
  //         localStorage.setItem('user', JSON.stringify(user));
  //         if (data.token) {
  //           localStorage.setItem('token', data.token);
  //           console.log('Stored token:', data.token);
  //         }
  //         if (adminLoginPopup) adminLoginPopup.classList.add('hidden');
  //         if (adminContent) adminContent.classList.remove('hidden');
  //         if (loginError) loginError.classList.add('hidden');
  //         authBtn.textContent = `Logout (${user.fullName})`;
  //         authBtn.onclick = () => {
  //           localStorage.removeItem('user');
  //           localStorage.removeItem('token');
  //           window.location.reload();
  //         };
  //         loadAdminContent();
  //       })
  //       .catch(error => {
  //         console.error('Error during sign-in:', error);
  //         if (loginError) {
  //           loginError.textContent = `Failed to sign in: ${error.message}`;
  //           loginError.classList.remove('hidden');
  //         }
  //       });
  //   });
  // } else {
  //   console.error('Admin login form not found');
  // }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const email = document.getElementById('admin-email').value;
      const password = document.getElementById('admin-password').value;
      console.log('Attempting login with email:', email);
  
      fetch('https://library-arnab.onrender.com/api/admin/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) {
            // Display error from API if available
            throw new Error(data.message || `Login failed with status ${response.status}`);
          }
  
          // Success: Store user info
          const user = {
            email,
            fullName: 'Admin',
            isAdmin: true,
          };
          localStorage.setItem('user', JSON.stringify(user));
  
          // UI updates
          if (adminLoginPopup) adminLoginPopup.classList.add('hidden');
          if (adminContent) adminContent.classList.remove('hidden');
          if (loginError) loginError.classList.add('hidden');
  
          authBtn.textContent = `Logout (${user.fullName})`;
          authBtn.onclick = () => {
            localStorage.removeItem('user');
            window.location.reload();
          };
  
          loadAdminContent(); // Load admin UI/data
        })
        .catch(error => {
          console.error('Login error:', error);
          loginError.textContent = `Login failed: ${error.message}`;
          loginError.classList.remove('hidden');
        });
    });
  } else {
    console.error('Admin login form not found');
  }
  

  // INSERT YOUR CUSTOM LOGIN LOGIC HERE (e.g., additional form handlers)

  // Toggle table visibility
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const tableContainer = document.getElementById(targetId);
      tableContainer.classList.toggle('visible');
      button.classList.toggle('expanded');
    });
  });

  // Function to animate counter from 0 to target value
  function animateCounter(element, target, duration) {
    if (typeof target !== 'number') {
      element.textContent = 'N/A';
      return;
    }
    let start = 0;
    const increment = target / (duration / 50); // Update every 50ms
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target;
        clearInterval(interval);
      } else {
        element.textContent = Math.round(start);
      }
    }, 50);
  }

  // Function to load books and users
  function loadAdminContent() {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

    // Fetch all books
    fetch('https://library-arnab.onrender.com/api/books/all', { headers })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        console.log('Books response:', data);
        const books = data.books || [];
        if (!Array.isArray(books)) {
          throw new Error('Invalid books data');
        }
        booksTable.innerHTML = books.map(book => `
          <tr>
            <td>${book.bookId}</td>
            <td>${book.bookName}</td>
            <td>${book.bookAuthor}</td>
            <td>${book.quantity}</td>
          </tr>
        `).join('');
        const booksCount = document.querySelector('.count[data-target="books-count"]');
        console.log('Books count element:', booksCount);
        if (!booksCount) {
          console.error('Books count element not found');
          return;
        }
        const totalBooks = books.reduce((sum, book) => sum + (Number(book.quantity) || 0), 0);
        console.log('Animating books total quantity:', totalBooks);
        animateCounter(booksCount, totalBooks, 3000);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        booksTable.innerHTML = '<tr><td colspan="4">Failed to load books.</td></tr>';
        const booksCount = document.querySelector('.count[data-target="books-count"]');
        if (booksCount) booksCount.textContent = 'N/A';
      });

    // Fetch all users
    fetch('https://library-arnab.onrender.com/api/users/all', { headers })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        console.log('Users response:', data);
        const users = data.users || [];
        if (!Array.isArray(users)) {
          throw new Error('Invalid users data');
        }
        usersTable.innerHTML = users.map(user => `
          <tr>
            
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.borrowedBookIds && Array.isArray(user.borrowedBookIds) ? user.borrowedBookIds.join(', ') : 'None'}</td>
            <td>${user.gender || 'N/A'}</td>
            <td>${user.city || 'N/A'}</td>
          </tr>
        `).join('');
        const usersCount = document.querySelector('.count[data-target="users-count"]');
        console.log('Users count element:', usersCount);
        if (!usersCount) {
          console.error('Users count element not found');
          return;
        }
        console.log('Animating users:', users.length);
        animateCounter(usersCount, users.length, 1500);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        usersTable.innerHTML = '<tr><td colspan="6">Failed to load users.</td></tr>';
        const usersCount = document.querySelector('.count[data-target="users-count"]');
        if (usersCount) usersCount.textContent = 'N/A';
      });

    // Hide tables by default after loading
    document.getElementById('books-table-container').classList.remove('visible');
    document.getElementById('users-table-container').classList.remove('visible');
    toggleButtons.forEach(button => button.classList.remove('expanded'));
  }

  // Handle search
  searchBtn.addEventListener('click', () => {
    const searchType = document.querySelector('input[name="search-type"]:checked').value;
    const searchValue = searchInput.value.trim();
    console.log('Search type:', searchType, 'Value:', searchValue);

    if (!searchValue) {
      searchResults.innerHTML = '<p>Please enter a search term.</p>';
      return;
    }

    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    const endpoint = searchType === 'user'
      ? `https://library-arnab.onrender.com/api/users/${searchValue}`
      : `https://library-arnab.onrender.com/api/books/${searchValue}`;
    console.log('Fetching endpoint:', endpoint);

    fetch(endpoint, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Search response:', data);
        if (!data || typeof data !== 'object') {
          searchResults.innerHTML = `<p>No ${searchType} found.</p>`;
          return;
        }
        if (data.error) {
          searchResults.innerHTML = `<p>${data.error}</p>`;
          return;
        }
        if (searchType === 'user') {
          const userId = data._id || data.userId || 'N/A';
          const fullName = data.fullName || data.name || 'N/A';
          const email = data.email || 'N/A';
          const gender = data.gender || 'N/A';
          const city = data.city || 'N/A';
          const borrowedBookIds = data.borrowedBookIds && Array.isArray(data.borrowedBookIds) && data.borrowedBookIds.length
            ? data.borrowedBookIds.join(', ')
            : 'None';
          searchResults.innerHTML = `
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Books Borrowed:</strong> ${borrowedBookIds}</p>
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>City:</strong> ${city}</p>
          `;
        } else {
          const bookId = data.bookId || data.id || 'N/A';
          const bookName = data.bookName || data.name || 'N/A';
          const bookAuthor = data.bookAuthor || data.author || 'N/A';
          const quantity = data.quantity != null ? data.quantity : 'N/A';
          searchResults.innerHTML = `
            <p><strong>Book ID:</strong> ${bookId}</p>
            <p><strong>Name:</strong> ${bookName}</p>
            <p><strong>Author:</strong> ${bookAuthor}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
          `;
        }
      })
      .catch(error => {
        console.error('Error searching:', error);
        searchResults.innerHTML = `<p>Failed to perform search: ${error.message}</p>`;
      });
  });

  // INSERT YOUR CUSTOM EVENT LISTENERS OR LOGIC HERE
});