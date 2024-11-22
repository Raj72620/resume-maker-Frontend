// Select the form and input fields
const form = document.getElementById('resumeForm');
const inputs = form.querySelectorAll('input, textarea');

// Utility function to show error
const showError = (input, message) => {
  const parent = input.parentElement;
  parent.classList.add('error');
  const tooltip = parent.querySelector('.tooltip');
  tooltip.textContent = message;
  tooltip.style.display = 'block';
};

// Utility function to show success
const showSuccess = (input) => {
  const parent = input.parentElement;
  parent.classList.remove('error');
  const tooltip = parent.querySelector('.tooltip');
  tooltip.style.display = 'none';
};

// Validation functions
const validateName = (nameInput) => {
  if (nameInput.value.trim() === '') {
    showError(nameInput, 'Name is required.');
    return false;
  }
  showSuccess(nameInput);
  return true;
};

const validateEmail = (emailInput) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    showError(emailInput, 'Enter a valid email address.');
    return false;
  }
  showSuccess(emailInput);
  return true;
};

const validatePhone = (phoneInput) => {
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneInput.value.trim())) {
    showError(phoneInput, 'Enter a valid 10-digit phone number.');
    return false;
  }
  showSuccess(phoneInput);
  return true;
};

const validateField = (input) => {
  if (input.value.trim() === '') {
    showError(input, `${input.placeholder} is required.`);
    return false;
  }
  showSuccess(input);
  return true;
};

// Real-time validation
inputs.forEach((input) => {
  input.addEventListener('input', () => {
    if (input.type === 'email') validateEmail(input);
    else if (input.type === 'tel') validatePhone(input);
    else validateField(input);
  });
});

// Form submit event
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent form submission

  // Validate all fields
  const isNameValid = validateName(form.elements['name']);
  const isEmailValid = validateEmail(form.elements['email']);
  const isPhoneValid = validatePhone(form.elements['phone']);

  let isValid = isNameValid && isEmailValid && isPhoneValid;

  // Validate other fields
  inputs.forEach((input) => {
    if (!['email', 'tel', 'name'].includes(input.name)) {
      isValid = validateField(input) && isValid;
    }
  });

  // If all fields are valid, submit the form
  if (isValid) {
    form.submit(); // Submit to the server
  }
});

// Download PDF
document.getElementById("downloadPdf").addEventListener("click", async () => {
  try {
    const formData = new FormData(document.getElementById("resumeForm"));
    const response = await fetch("/generate", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to generate PDF.");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);

    showFeedback("PDF downloaded successfully!", false);
  } catch (error) {
    showFeedback("Error downloading PDF: " + error.message, true);
  }
});

// Send Email
document.getElementById("emailForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const formData = Object.fromEntries(
      new FormData(document.getElementById("resumeForm")).entries()
    );
    const emailAddress = document.getElementById("emailAddress").value;

    const response = await fetch("/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData, emailAddress }),
    });

    if (!response.ok) throw new Error("Failed to send email.");

    showFeedback("Email sent successfully!", false);
  } catch (error) {
    showFeedback("Error sending email: " + error.message, true);
  }
});

// Show feedback messages
function showFeedback(message, isError) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.className = isError ? "feedback error" : "feedback";
}
