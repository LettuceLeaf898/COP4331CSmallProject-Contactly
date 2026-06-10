document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  const profileBtn = document.getElementById("profileBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutButton = document.getElementById("logoutButton");
  const userName = document.getElementById("userName");

  const addContactForm = document.getElementById("addContactForm");
  const userId = localStorage.getItem("userId");

  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  if (firstName && lastName) {
    userName.textContent = `${firstName} ${lastName}`;
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

addContactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const message = document.getElementById("addContactMessage");
  const first = document.getElementById("contactFirstName").value.trim();
  const last = document.getElementById("contactLastName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  if (!first || !last || !email || !phone) {
    message.textContent = "Please fill out all fields.";
    message.className = "message error";
    return;
  }

  fetch("/LAMPAPI/AddContact.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: Number(userId),
      firstName: first,
      lastName: last,
      email: email,
      phone: phone,
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.error && data.error !== "") {
        message.textContent = data.error;
        message.className = "message error";
        return;
      }

      message.textContent = "Contact added!";
      message.className = "message success";
      addContactForm.reset();
      // optionally close the modal and refresh the contact list here
    })
    .catch(function (error) {
      console.error("Add contact error:", error);
      message.textContent = "Something went wrong. Try again.";
      message.className = "message error";
    });
});

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchInput = document.getElementById("search");
  const searchText = searchInput.value.trim();

  if (searchText === "") {
    console.log("Search field is empty.");
    return;
  }

  fetch("/LAMPAPI/SearchContact.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: Number(userId),
      search: searchText,
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("Search response:", data);

      if (data.error && data.error !== "") {
        console.log(data.error);

        const contactsContainer = document.getElementById("contactsContainer");
        const contactsCount = document.getElementById("contactsCount");

        contactsContainer.innerHTML = "<p>No contacts found.</p>";
        contactsCount.textContent = "0 Contacts";
        return;
      }

      displayContacts(data.contacts);
    })
    .catch(function (error) {
      console.error("Search error:", error);
    });
});
});
