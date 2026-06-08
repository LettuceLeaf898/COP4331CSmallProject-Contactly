document.addEventListener("DOMContentLoaded", function () {
  const updateForm = document.getElementById("updateForm");
  const profileBtn = document.getElementById("profileBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutButton = document.getElementById("logoutButton");
  const userName = document.getElementById("userName");
  const accountUserName = document.getElementById("accountUserName");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const email = localStorage.getItem("email");
  const editEmail = document.getElementById("editEmail");
  const phone = localStorage.getItem("phone");
  const editPhone = document.getElementById("editPhone");
  const storedPassword = localStorage.getItem("password");
  const editNewPassword = document.getElementById("newPassword");
  const editConfirmPassword = document.getElementById("confirmPassword");
  const dateCreated = localStorage.getItem("dateCreated");
  const deleteAccountButton = document.getElementById("deleteAccountButton");
  const deleteMessage = document.getElementById("deleteMessage");
  const userId = localStorage.getItem("userId");
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

  if (firstName && lastName) {
    userName.textContent = `${firstName} ${lastName}`;
    accountUserName.textContent = `${firstName} ${lastName}`;
  }

  if (email) {
    editEmail.value = email;
  }

  if (phone) {
    editPhone.value = phone;
  }

  if (storedPassword) {
    editNewPassword.value = storedPassword;
    editConfirmPassword.value = storedPassword;
  }

  profileBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  window.addEventListener("click", function () {
    dropdownMenu.classList.remove("show");
  });

  logoutButton.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "../../index.html";
  });

  if (updateForm) {
    updateForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const editPhone = document.getElementById("editPhone").value.trim();
      const editEmail = document.getElementById("editEmail").value.trim();
      const newPassword = document.getElementById("newPassword").value.trim();
      const confirmPassword = document
        .getElementById("confirmPassword")
        .value.trim();

      const updateMessage = document.getElementById("updateMessage");
      updateMessage.textContent = "";
      updateMessage.className = "message";

      if (
        editPhone === "" ||
        editEmail === "" ||
        newPassword === "" ||
        confirmPassword === ""
      ) {
        updateMessage.textContent = "Please fill out all fields.";
        updateMessage.classList.add("error");
        return;
      }

      if (newPassword !== confirmPassword) {
        updateMessage.textContent = "Passwords do not match.";
        updateMessage.classList.add("error");
        return;
      }

      fetch("/LAMPAPI/UpdateUser.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(userId),
          firstName: firstName,
          lastName: lastName,
          login: editEmail,
          password: newPassword,
          email: editEmail,
          phone: editPhone,
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log("Update response:", data);

          if (data.error && data.error !== "") {
            updateMessage.textContent = data.error;
            updateMessage.classList.add("error");
            return;
          }

          updateMessage.textContent = "Account updated successfully!";
          updateMessage.classList.add("success");

          localStorage.setItem("email", editEmail);
          localStorage.setItem("phone", editPhone);
          localStorage.setItem("password", newPassword);

          setTimeout(function () {
            window.location.href = "./account.html";
          }, 1000);
        })
        .catch(function (error) {
          console.error("Update error:", error);
          updateMessage.textContent = "Could not connect to the server.";
          updateMessage.classList.add("error");
        });
    });
  }

  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", function () {
      if (!userId) {
        deleteMessage.textContent = "No logged-in user found.";
        deleteMessage.className = "message error";
        return;
      }

      fetch("/LAMPAPI/DeleteUser.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(userId),
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log("Delete response:", data);

          if (data.error && data.error !== "") {
            deleteMessage.textContent = data.error;
            deleteMessage.className = "message error";
            return;
          }

          localStorage.clear();

          deleteMessage.textContent = "Account deleted successfully.";
          deleteMessage.className = "message success";

          setTimeout(function () {
            window.location.href = "/index.html";
          }, 1000);
        })
        .catch(function (error) {
          console.error("Delete error:", error);
          deleteMessage.textContent = "Could not connect to the server.";
          deleteMessage.className = "message error";
        });
    });
  }
});
