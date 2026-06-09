document.addEventListener("DOMContentLoaded", function () {
  console.log("login.js is connected");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginMessage = document.getElementById("loginMessage");
  const passwordToggle = document.getElementById("passwordToggle");
  const passwordEyeIcon = document.getElementById("passwordEyeIcon");

  if (passwordToggle) {
    passwordToggle.addEventListener("click", function () {
      const passwordIsHidden = passwordInput.type === "password";

      if (passwordIsHidden) {
        passwordInput.type = "text";
        passwordEyeIcon.src = "/frontend/assets/images/eye-slash-fill.svg";
        passwordEyeIcon.alt = "Hide password";
      } else {
        passwordInput.type = "password";
        passwordEyeIcon.src = "/frontend/assets/images/eye-fill.svg";
        passwordEyeIcon.alt = "Show password";
      }
    });
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    loginMessage.textContent = "";
    loginMessage.className = "message";

    if (email === "" || password === "") {
      loginMessage.textContent = "Please enter both email and password.";
      loginMessage.classList.add("error");
      return;
    }

    fetch("/LAMPAPI/Login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: email,
        password: password,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("Login response:", data);

        if (data.error && data.error !== "") {
          loginMessage.textContent = data.error;
          loginMessage.classList.add("error");
          return;
        }

        localStorage.setItem("userId", data.id);
        localStorage.setItem("firstName", data.firstName);
        localStorage.setItem("lastName", data.lastName);
        localStorage.setItem("login", data.login);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phoneNumber);
        localStorage.setItem("dateCreated", data.creationDate);
        localStorage.setItem("password", data.password);

        loginMessage.textContent = "Login successful!";
        loginMessage.classList.add("success");

        setTimeout(function () {
          window.location.href = "/frontend/pages/homepage.html";
        }, 800);
      })
      .catch(function (error) {
        console.error("Login error:", error);
        loginMessage.textContent = "Could not connect to the server.";
        loginMessage.classList.add("error");
      });
  });
});
