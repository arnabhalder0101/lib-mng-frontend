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

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email) {
    authBtn.textContent = `Logout (${user.fullName})`;
    authBtn.onclick = () => {
      localStorage.removeItem('user');
      window.location.reload();
    };
  } else {
    authBtn.onclick = () => {
      window.location.href = 'login.html?show=login';
    };
  }

  // Show admin login popup on page load
  adminLoginPopup.classList.remove('hidden');

  // Handle admin login form submission
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    if (email === 'admin@lib.com' && password === 'admin123') {
      // Successful login
      localStorage.setItem('user', JSON.stringify({
        email: 'admin@lib.com',
        fullName: 'Admin',
        isAdmin: true
      }));
      adminLoginPopup.classList.add('hidden');
      adminContent.classList.remove('hidden');
      loginError.classList.add('hidden');
      loadAdminContent();
    } else {
      // Failed login
      loginError.textContent = 'Invalid email or password.';
      loginError.classList.remove('hidden');
    }
  });

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
    // Fetch all books
    fetch('https://library-arnab.onrender.com/api/books/all')
    .then(response => response.json())
    .then(books => {console.log(books);
      booksTable.innerHTML = books.books.map(book => `
        <tr>
          <td>${book.bookId}</td>
          <td>${book.bookName}</td>
          <td>${book.bookAuthor}</td>
          <td>${book.quantity}</td>
        </tr>
      `).join('');
      const booksCount = document.querySelector('.count[data-target="books-count"]');
        console.log('Books count element:', booksCount); // Debug log
        if (!booksCount) {
          console.error('Books count element not found');
          return;
        }
        const totalBooks = books.books.reduce((sum, book) => sum + (Number(book.quantity) || 0), 0);
        console.log('Animating books total quantity:', totalBooks); // Debug log
        animateCounter(booksCount, totalBooks, 3000); // Animate over 3 seconds
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        booksTable.innerHTML = '<tr><td colspan="4">Failed to load books.</td></tr>';
        const booksCount = document.querySelector('.count[data-target="books-count"]');
        if (booksCount) booksCount.textContent = 'N/A';
      });

    // Fetch all users
    fetch('https://library-arnab.onrender.com/api/users/all')
      .then(response => response.json())
      .then(users => {console.log(users);
        usersTable.innerHTML = users.users.map(user => `
          <tr>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.borrowedBookIds}</td>
            <td>${user.gender || 'N/A'}</td>
            <td>${user.city || 'N/A'}</td>
          </tr>
        `).join('');
        const usersCount = document.querySelector('.count[data-target="users-count"]');
        animateCounter(usersCount, users.users.length, 1500); // Animate over 1.5 second
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        usersTable.innerHTML = '<tr><td colspan="6">Failed to load users.</td></tr>';
        const usersCount = document.querySelector('.count[data-target="users-count"]');
        usersCount.textContent = 'N/A';
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
    console.log('Search type:', searchType, 'Value:', searchValue); // Debug log

    if (!searchValue) {
      searchResults.innerHTML = '<p>Please enter a search term.</p>';
      return;
    }

    const endpoint = searchType === 'user'
      ? `https://library-arnab.onrender.com/api/users/${searchValue}`
      : `https://library-arnab.onrender.com/api/books/${searchValue}`;
    console.log('Fetching endpoint:', endpoint); // Debug log

    fetch(endpoint)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Search response:', data); // Debug log
        if (!data || typeof data !== 'object') {
          searchResults.innerHTML = `<p>No ${searchType} found.</p>`;
          return;
        }
        if (data.error) {
          searchResults.innerHTML = `<p>${data.error}</p>`;
          return;
        }
        if (searchType === 'user') {
          // Use fallback field names (e.g., id if userId is undefined)
          const userId = data.userId || data.id || 'N/A';
          const fullName = data.fullName || data.name || 'N/A';
          const email = data.email || 'N/A';
          const gender = data.gender || 'N/A';
          const city = data.city || 'N/A';
          const booksBorrowed = data.booksBorrowed && Array.isArray(data.booksBorrowed) && data.booksBorrowed.length
            ? data.booksBorrowed.join(', ')
            : 'None';
          searchResults.innerHTML = `
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>Books Borrowed:</strong> ${booksBorrowed}</p>
          `;
        } else {
          // Use fallback field names (e.g., id if bookId is undefined)
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
        console.error('Error searching:', error); // Debug log
        searchResults.innerHTML = `<p>Failed to perform search: ${error.message}</p>`;
      });
  });
});