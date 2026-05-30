document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginMessage = document.getElementById("loginMessage");
  const passwordToggle = document.getElementById("passwordToggle");

  passwordToggle.addEventListener("click", function () {
    const passwordIsHidden = passwordInput.type === "password";

    if (passwordIsHidden) {
      passwordInput.type = "text";
      passwordEyeIcon.src = "../assets/images/eye-slash-fill.svg";
      passwordEyeIcon.alt = "Hide password";
    } else {
      passwordInput.type = "password";
      passwordEyeIcon.src = "../assets/images/eye-fill.svg";
      passwordEyeIcon.alt = "Show password";
    }
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();


    if (email === "" || password === "") {
      loginMessage.textContent = "Please enter both email and password.";
      loginMessage.classList.add("error");
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);

  });
});
