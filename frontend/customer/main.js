/**
 * SmartEats Main Logic
 * Handles: Authentication, Modals, Mobile Menu, and Special Offers
 */

// --- 1. GLOBAL VARIABLES & ELEMENT SELECTION ---

// Mobile Menu Elements
const toggleButton = document.getElementById('navbar-toggle');
const closeButton = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-nav-sidebar');

// Login/Logout Buttons (Desktop & Mobile)
const loginBtnDesktop = document.getElementById('login-btn-desktop');
const loginBtnMobile = document.getElementById('login-btn-mobile');
const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
const logoutBtnMobile = document.getElementById('logout-btn-mobile');

// Login Modal Elements
const loginModalOverlay = document.getElementById('login-modal-overlay');
const loginModalCloseBtn = document.getElementById('login-modal-close');
const customerLoginForm = document.getElementById('customer-login-form');
const modalMessage = document.getElementById('modal-message');
const passwordInput = document.getElementById('modal-password');
const passwordToggleButton = document.getElementById('password-toggle');
const openRegisterModalBtn = document.getElementById('open-register-modal');

// Register Modal Elements
const registerModalOverlay = document.getElementById('register-modal-overlay');
const registerModalCloseBtn = document.getElementById('register-modal-close');
const customerRegisterForm = document.getElementById('customer-register-form');
const registerMessage = document.getElementById('register-message');
const openLoginLink = document.getElementById('open-login-link');


// --- 2. AUTHENTICATION LOGIC ---

// Check if user is logged in on page load
function checkLoginState() {
    const token = localStorage.getItem('canteen_customer_token') || sessionStorage.getItem('canteen_customer_token');
    
    if (token) {
        document.body.classList.add('is-logged-in');
    } else {
        document.body.classList.remove('is-logged-in');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('canteen_customer_token');
    sessionStorage.removeItem('canteen_customer_token');
    window.location.href = 'index.html'; // Redirect to home
}

// Reset forms and messages when opening modals
function resetForms() {
    if (customerLoginForm) customerLoginForm.reset();
    if (customerRegisterForm) customerRegisterForm.reset();
    if (modalMessage) modalMessage.textContent = '';
    if (registerMessage) registerMessage.textContent = '';
}


// --- 3. EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Run checks immediately
    checkLoginState();
    
    // Only run this if we are on the homepage (element exists)
    if (document.getElementById('special-offers-grid')) {
        fetchSpecialOffers();
    }

    // 2. Mobile Menu Logic
    if (toggleButton && closeButton && mobileMenu) {
        toggleButton.addEventListener('click', () => mobileMenu.classList.add('active'));
        closeButton.addEventListener('click', () => mobileMenu.classList.remove('active'));
    }

    // 3. Login Modal Logic
    if (loginBtnDesktop) loginBtnDesktop.addEventListener('click', () => {
        resetForms();
        loginModalOverlay.style.display = 'flex';
    });
    
    if (loginBtnMobile) loginBtnMobile.addEventListener('click', () => {
        resetForms();
        loginModalOverlay.style.display = 'flex';
        if (mobileMenu) mobileMenu.classList.remove('active');
    });

    if (loginModalCloseBtn) loginModalCloseBtn.addEventListener('click', () => {
        loginModalOverlay.style.display = 'none';
    });

    // Close on click outside
    if (loginModalOverlay) loginModalOverlay.addEventListener('click', (e) => {
        if (e.target === loginModalOverlay) loginModalOverlay.style.display = 'none';
    });

    // 4. Register Modal Logic
    if (registerModalOverlay) {
        // Switch to Register
        if (openRegisterModalBtn) openRegisterModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetForms();
            loginModalOverlay.style.display = 'none';
            registerModalOverlay.style.display = 'flex';
        });

        // Switch to Login
        if (openLoginLink) openLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            resetForms();
            registerModalOverlay.style.display = 'none';
            loginModalOverlay.style.display = 'flex';
        });

        // Close Register
        if (registerModalCloseBtn) registerModalCloseBtn.addEventListener('click', () => {
            registerModalOverlay.style.display = 'none';
        });
        
        registerModalOverlay.addEventListener('click', (e) => {
            if (e.target === registerModalOverlay) registerModalOverlay.style.display = 'none';
        });
    }

    // 5. Password Toggle
    if (passwordToggleButton) passwordToggleButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggleButton.classList.toggle('fa-eye');
        passwordToggleButton.classList.toggle('fa-eye-slash');
    });

    // 6. Login Form Submit
    if (customerLoginForm) customerLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        modalMessage.textContent = 'Logging in...';
        modalMessage.style.color = 'var(--text-muted)';

        const email = document.getElementById('modal-email').value;
        const password = document.getElementById('modal-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok && data.role === 'customer') {
                if (rememberMe) {
                    localStorage.setItem('canteen_customer_token', data.token);
                } else {
                    sessionStorage.setItem('canteen_customer_token', data.token);
                }
                modalMessage.textContent = 'Login successful! Refreshing...';
                modalMessage.style.color = 'var(--success)';
                setTimeout(() => { window.location.reload(); }, 1000);
            } else {
                modalMessage.textContent = data.msg || 'Login failed.';
                modalMessage.style.color = '#d9534f';
            }
        } catch (err) {
            console.error(err);
            modalMessage.textContent = 'Error connecting to server.';
            modalMessage.style.color = '#d9534f';
        }
    });

    // 7. Register Form Submit
    if (customerRegisterForm) customerRegisterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerMessage.textContent = 'Creating account...';
        registerMessage.style.color = 'var(--text-muted)';

        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const registerData = { username, email, password, role: 'customer' };

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = 'Success! Please log in.';
                registerMessage.style.color = 'var(--success)';
                setTimeout(() => {
                    registerModalOverlay.style.display = 'none';
                    loginModalOverlay.style.display = 'flex';
                    resetForms();
                }, 2000);
            } else {
                registerMessage.textContent = data.msg || 'Registration failed.';
                registerMessage.style.color = '#d9534f';
            }
        } catch (err) {
            console.error(err);
            registerMessage.textContent = 'Error connecting to server.';
            registerMessage.style.color = '#d9534f';
        }
    });

    // 8. Logout Listeners
    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', logout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', logout);
});


// --- 4. SPECIAL OFFERS FETCH FUNCTION (Home Page Only) ---
async function fetchSpecialOffers() {
    const offersGrid = document.getElementById('special-offers-grid');
    if (!offersGrid) return; // Exit if element doesn't exist on this page

    try {
        const response = await fetch('http://localhost:5000/api/menu');
        if (!response.ok) throw new Error('Failed to fetch menu');
        
        const allItems = await response.json();
        // Get the first 3 items
        const specialOffers = allItems.slice(0, 3);

        if (specialOffers.length === 0) {
            offersGrid.innerHTML = '<p style="color: var(--text-muted);">No special offers today.</p>';
            return;
        }

        offersGrid.innerHTML = ''; // Clear loading text
        
        specialOffers.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card'; 
            card.innerHTML = `
                <div class="menu-card-img-container">
                    <img src="${item.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${item.name}">
                </div>
                <div class="menu-card-body">
                    <h3>${item.name}</h3>
                    <p>${item.description || 'No description available.'}</p>
                </div>
                <div class="menu-card-footer">
                    <span class="price">₹${item.price.toFixed(2)}</span>
                    <a href="menu.html" class="add-btn" style="text-decoration: none;">
                        <i class="fa-solid fa-plus"></i> View
                    </a>
                </div>
            `;
            offersGrid.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        offersGrid.innerHTML = '<p style="color: red;">Could not load offers.</p>';
    }
}