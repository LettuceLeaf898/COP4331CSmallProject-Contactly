document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const registerMessage = document.getElementById("registerMessage");

  const passwordToggleButtons = document.querySelectorAll(".password-toggle");

  passwordToggleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const targetInputId = button.getAttribute("data-target");
      const passwordInput = document.getElementById(targetInputId);
      const eyeIcon = button.querySelector(".password-eye-icon");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.src = "../assets/images/eye-slash-fill.svg";
        eyeIcon.alt = "Hide password";
      } else {
        passwordInput.type = "password";
        eyeIcon.src = "../assets/images/eye-fill.svg";
        eyeIcon.alt = "Show password";
      }
    });
  });

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    if (
      name === "" ||
      lastName === "" ||
      phone === "" ||
      email === "" ||
      newPassword === "" ||
      confirmPassword === ""
    ) {
      registerMessage.textContent = "Please fill out all fields.";
      registerMessage.classList.add("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      registerMessage.textContent = "Passwords do not match.";
      registerMessage.classList.add("error");
      return;
    }

    console.log("Register form submitted:", {
      name: name,
      lastName: lastName,
      phone: phone,
      email: email,
      password: newPassword,
    });

  });
});
