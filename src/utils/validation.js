// Currently, basic validation is handled by HTML5 attributes (required, minlength, type).
// You can expand this file for more complex client-side validation if needed.

const Validation = {
  isValidEmail(email) {
    // Basic email regex for client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isStrongPassword(password) {
    // Password must be at least 8 characters (as per API requirement)
    return password.length >= 8;
  },

  // Add more validation functions as needed
};

export default Validation;
