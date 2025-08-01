const form = document.getElementById("Password-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");
const confirmpassword = document.getElementById("confirmpassword");
var valid = true;

form.addEventListener("submit", (e) => {
  e.preventDefault();
   valid = true;
  validateInputs();
  if (valid) {
    form.submit()
  }
});
function validateInputs() {
  console.log("hii");

  const usernameVal = username.value.trim();
  const emailVal = email.value.trim();
  const phoneVal = phone.value.trim();
  const passwordVal = password.value.trim();
  const confirmPasswordVal = confirmpassword.value.trim();

  if (usernameVal === " ") {
    setError(username, "Username cannot be blank");
  } else if (usernameVal.length < 3) {
    setError(username, "Username must be at least 3 characters");
  } else {
    setSuccess(username);
  }

  if (emailVal === "") {
    setError(email, "Email cannot be blank");
  } else if (!isValidEmail(emailVal)) {
    setError(email, "Not a valid email");
  } else {
    setSuccess(email);
  }

  if (phoneVal === "") {
    setError(phone, "Phone number cannot be blank");
  } else if (phoneVal.length < 10) {
    setError(phone, "Phone number must be at least 10 digits");
  } else {
    setSuccess(phone);
  }

  if (passwordVal === "") {
    setError(password, "Password cannot be blank");
  } else if (passwordVal.length < 6) {
    setError(password, "Password must be at least 6 characters");
  } else {
    setSuccess(password);
  }

  if (confirmPasswordVal === "") {
    setError(confirmpassword, "Please confirm your password");
  } else if (confirmPasswordVal !== passwordVal) {
    setError(confirmpassword, "Passwords do not match");
  } else {
    setSuccess(confirmpassword);
  }
}

function setError(input, message) {
  const formControl = input.parentElement;
  const small = formControl.querySelector("small");
  formControl.className = "form-control error";
  small.innerText = message;
  valid = false;
}

function setSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control success";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
