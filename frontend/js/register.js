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
        eyeIcon.src = "/frontend/assets/images/eye-slash-fill.svg";
        eyeIcon.alt = "Hide password";
      } else {
        passwordInput.type = "password";
        eyeIcon.src = "/frontend/assets/images/eye-fill.svg";
        eyeIcon.alt = "Show password";
      }
    });
  });

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.getElementById("name").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    registerMessage.textContent = "";
    registerMessage.className = "message";

    if (
      firstName === "" ||
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

    if (countPhoneDigits(phone) > 15) {
      registerMessage.textContent = "Phone number cannot exceed 15 digits.";
      registerMessage.classList.add("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      registerMessage.textContent = "Passwords do not match.";
      registerMessage.classList.add("error");
      return;
    }

    fetch("/LAMPAPI/Register.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        login: email,
        password: newPassword,
        email: email,
        phone: phone,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("Register response:", data);

        if (data.error && data.error !== "") {
          registerMessage.textContent = data.error;
          registerMessage.classList.add("error");
          return;
        }

        localStorage.setItem("email", data.email);

        registerMessage.textContent = "Account created successfully!";
        registerMessage.classList.add("success");

        setTimeout(function () {
          window.location.href = "/index.html";
        }, 1000);
      })
      .catch(function (error) {
        console.error("Register error:", error);
        registerMessage.textContent = "Could not connect to the server.";
        registerMessage.classList.add("error");
      });
  });
});

function countPhoneDigits(phone) {
  return phone.replace(/\D/g, "").length;
}
