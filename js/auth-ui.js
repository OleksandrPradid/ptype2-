import { signUp, login, logout, listenToAuthChanges } from "../firebase/auth.js";

// DOM Elements
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-btn");

// Signup Form Submission
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = `${signupForm.username.value}@typinggame.com`; // Simple email conversion
    const password = signupForm.password.value;
    const username = signupForm.username.value;

    // Validate passwords match
    if (password !== signupForm['signup-password-confirm'].value) {
      showStatus(elements.forms.signup.status, "Passwords don't match!", 'error');
      return;
    }

    try {
      await signUp(email, password, username);
      showStatus(elements.forms.signup.status, "Account created! Redirecting to login...", 'success');
      setTimeout(() => showPage('login'), 2000);
    } catch (error) {
      showStatus(elements.forms.signup.status, error.message, 'error');
    }
  });
}

// Login Form Submission
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = `${loginForm.username.value}@typinggame.com`; // Match signup format
    const password = loginForm.password.value;

    try {
      await login(email, password);
      showStatus(elements.forms.login.status, "Login successful! Redirecting...", 'success');
      // The auth state listener will handle the redirect
    } catch (error) {
      showStatus(elements.forms.login.status, error.message, 'error');
    }
  });
}

// Logout Button
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await logout();
      showPage('welcome');
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}

// Auto-redirect based on auth state
listenToAuthChanges((user) => {
  if (user) {
    handleLoginSuccess(user.displayName || "User", {
      levelsCompleted: 0, // Will be updated from game progress
      typingSpeed: 0,
      profilePicture: "https://i.imgur.com/JqYeXZk.png"
    });
  } else if (!state.isGuest && window.location.pathname.includes("profile")) {
    showPage('welcome');
  }
});

function handleLoginSuccess(username, userData) {
  updateProfile({
    username: username,
    ...userData
  });
  showPage('profile');
  generateLevels(userData.levelsCompleted);
}