document.addEventListener("DOMContentLoaded", function () {
  console.log("homepage.js is connected");

  let currentContactsPage = 1;
  let totalContactsPages = 1;
  let isLoadingContacts = false;
  let contactsById = {};

  const sortContactsSelect = document.getElementById("sortContactsSelect");
  const sortContactsButton = document.getElementById("sortContactsButton");
  const searchForm = document.getElementById("searchForm");
  const profileBtn = document.getElementById("profileBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutButton = document.getElementById("logoutButton");
  const userName = document.getElementById("userName");
  const addContactForm = document.getElementById("addContactForm");
  const userId = localStorage.getItem("userId");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const addContactMessage = document.getElementById("addContactMessage");
  const seeAllContactsButton = document.getElementById("seeAllContactsButton");
  const contactsContainer = document.getElementById("contactsContainer");
  const contactsCount = document.getElementById("contactsCount");
  const sortDropdownBtn = document.getElementById("sortDropdownBtn");
  const sortDropdownMenu = document.getElementById("sortDropdownMenu");
  const sortDropdownText = document.getElementById("sortDropdownText");
  const editContactForm = document.getElementById("editContactForm");
  const deleteContactButton = document.getElementById("deleteContactButton");

  if (deleteContactButton) {
    deleteContactButton.addEventListener("click", function () {
      const contactId = document.getElementById("editContactId").value;
      const userId = localStorage.getItem("userId");
      const editContactMessage = document.getElementById("editContactMessage");

      editContactMessage.textContent = "";
      editContactMessage.className = "message";

      if (!contactId || !userId) {
        editContactMessage.textContent = "Contact or user not found.";
        editContactMessage.classList.add("error");
        return;
      }

      fetch("/LAMPAPI/DeleteContact.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: Number(contactId),
          userId: Number(userId),
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log("Delete contact response:", data);

          if (data.error && data.error !== "") {
            editContactMessage.textContent = data.error;
            editContactMessage.classList.add("error");
            return;
          }

          editContactMessage.textContent = "Contact deleted successfully.";
          editContactMessage.classList.add("success");

          setTimeout(function () {
            const modalElement = document.getElementById("editContactModal");
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.hide();

            currentContactsPage = 1;
            loadContacts(currentContactsPage, false);
          }, 800);
        })
        .catch(function (error) {
          console.error("Delete contact error:", error);
          editContactMessage.textContent = "Could not connect to the server.";
          editContactMessage.classList.add("error");
        });
    });
  }

  if (editContactForm) {
    editContactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const contactId = document.getElementById("editContactId").value;
      const firstName = document
        .getElementById("editContactFirstName")
        .value.trim();
      const lastName = document
        .getElementById("editContactLastName")
        .value.trim();
      const email = document.getElementById("editContactEmail").value.trim();
      const phone = document.getElementById("editContactPhone").value.trim();
      const editContactMessage = document.getElementById("editContactMessage");

      editContactMessage.textContent = "";
      editContactMessage.className = "message";

      if (firstName === "" || lastName === "" || email === "" || phone === "") {
        editContactMessage.textContent = "Please fill out all fields.";
        editContactMessage.classList.add("error");
        return;
      }

      if (countPhoneDigits(phone) > 15) {
        editContactMessage.textContent =
          "Phone number cannot exceed 15 digits.";
        editContactMessage.classList.add("error");
        return;
      }

      fetch("/LAMPAPI/UpdateContact.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: Number(contactId),
          userId: Number(localStorage.getItem("userId")),
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log("Update contact response:", data);

          if (data.error && data.error !== "") {
            editContactMessage.textContent = data.error;
            editContactMessage.classList.add("error");
            return;
          }

          editContactMessage.textContent = "Contact updated successfully!";
          editContactMessage.classList.add("success");

          setTimeout(function () {
            const modalElement = document.getElementById("editContactModal");
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.hide();

            currentContactsPage = 1;
            loadContacts(currentContactsPage, false);
          }, 800);
        })
        .catch(function (error) {
          console.error("Update contact error:", error);
          editContactMessage.textContent = "Could not connect to the server.";
          editContactMessage.classList.add("error");
        });
    });
  }

  if (sortDropdownBtn && sortDropdownMenu) {
    sortDropdownBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      sortDropdownMenu.classList.toggle("show");
    });

    sortDropdownMenu.addEventListener("click", function (event) {
      const clickedButton = event.target.closest("button");

      if (!clickedButton) {
        return;
      }

      const sortBy = clickedButton.getAttribute("data-sort");
      const label = clickedButton.textContent.trim();

      sortDropdownText.textContent = `Sort By: ${label}`;
      sortDropdownMenu.classList.remove("show");

      if (sortBy === "addDate") {
        currentContactsPage = 1;
        loadContacts(currentContactsPage, false);
        return;
      }

      sortContacts(sortBy);
    });

    window.addEventListener("click", function () {
      sortDropdownMenu.classList.remove("show");
    });
  }

  if (sortContactsSelect) {
    sortContactsSelect.addEventListener("change", function () {
      const sortBy = sortContactsSelect.value;

      if (sortBy === "addDate") {
        currentContactsPage = 1;
        loadContacts(currentContactsPage, false);
        return;
      }

      sortContacts(sortBy);
    });
  }

  if (seeAllContactsButton) {
    console.log("See All Contacts button found");

    seeAllContactsButton.addEventListener("click", function () {
      console.log("See All Contacts clicked");

      currentContactsPage = 1;
      loadContacts(currentContactsPage, false);
    });
  } else {
    console.log("See All Contacts button NOT found");
  }

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

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const searchInput = document.getElementById("search");
      const searchText = searchInput.value.trim();

      if (searchText === "") {
        currentContactsPage = 1;
        loadContacts(currentContactsPage, false);
        return;
      }

      if (!userId) {
        contactsContainer.innerHTML = "<p>No logged-in user found.</p>";
        contactsCount.textContent = "0 Contacts";
        return;
      }

      removeLoadMoreButton();

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

          contactsContainer.innerHTML = "";

          if (data.error && data.error !== "") {
            contactsContainer.innerHTML = "<p>No contacts found.</p>";
            contactsCount.textContent = "0 Contacts";
            return;
          }

          contactsCount.textContent = `${data.contacts.length} Contacts`;
          renderContacts(data.contacts);
        })
        .catch(function (error) {
          console.error("Search error:", error);
          contactsContainer.innerHTML = "<p>Could not search contacts.</p>";
          contactsCount.textContent = "0 Contacts";
        });
    });
  }

  if (contactsContainer) {
    contactsContainer.addEventListener("click", function (event) {
      const menuButton = event.target.closest(".contact-menu");

      if (!menuButton) {
        return;
      }

      const contactId = menuButton.getAttribute("data-contact-id");
      const contact = contactsById[contactId];

      if (!contact) {
        console.log("Contact not found:", contactId);
        return;
      }

      document.getElementById("editContactId").value = contact.ID;
      document.getElementById("editContactFirstName").value = contact.FirstName;
      document.getElementById("editContactLastName").value = contact.LastName;
      document.getElementById("editContactEmail").value = contact.Email;
      document.getElementById("editContactPhone").value = contact.Phone;
      document.getElementById("editContactDateCreated").textContent =
        formatDate(contact.AddDate);

      const editContactMessage = document.getElementById("editContactMessage");
      editContactMessage.textContent = "";
      editContactMessage.className = "message";

      const modalElement = document.getElementById("editContactModal");
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    });
  }

  if (addContactForm) {
    addContactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const firstName = document
        .getElementById("contactFirstName")
        .value.trim();
      const lastName = document.getElementById("contactLastName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const phone = document.getElementById("contactPhone").value.trim();

      addContactMessage.textContent = "";
      addContactMessage.className = "message";

      if (firstName === "" || lastName === "" || email === "" || phone === "") {
        addContactMessage.textContent = "Please fill out all fields.";
        addContactMessage.classList.add("error");
        return;
      }

      if (countPhoneDigits(phone) > 15) {
        addContactMessage.textContent = "Phone number cannot exceed 15 digits.";
        addContactMessage.classList.add("error");
        return;
      }

      if (!userId) {
        addContactMessage.textContent = "No logged-in user found.";
        addContactMessage.classList.add("error");
        return;
      }

      fetch("/LAMPAPI/AddContact.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          email: email,
          userId: Number(userId),
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log("Add contact response:", data);

          if (data.error && data.error !== "") {
            addContactMessage.textContent = data.error;
            addContactMessage.classList.add("error");
            return;
          }

          addContactMessage.textContent = "Contact added successfully!";
          addContactMessage.classList.add("success");

          addContactForm.reset();

          setTimeout(function () {
            const modalElement = document.getElementById("addContactModal");

            if (modalElement) {
              const modal = bootstrap.Modal.getInstance(modalElement);
              modal.hide();
            }

            if (typeof loadContacts === "function") {
              currentContactsPage = 1;
              loadContacts(currentContactsPage, false);
            }
          }, 800);
        })
        .catch(function (error) {
          console.error("Add contact error:", error);
          addContactMessage.textContent = "Could not connect to the server.";
          addContactMessage.classList.add("error");
        });
    });
  }

  function renderContacts(contacts) {
    contacts.forEach(function (contact) {
      contactsById[contact.ID] = contact;

      const contactCard = document.createElement("div");
      contactCard.className = "contact-card";

      contactCard.innerHTML = `
      <button type="button" class="contact-menu" data-contact-id="${contact.ID}">⋮</button>

      <h3 class="contact-name">${contact.FirstName} ${contact.LastName}</h3>

      <div class="contact-detail">
        <img
          src="../assets/images/envelope-fill.svg"
          alt=""
          class="contact-icon"
        />
        <span>${contact.Email}</span>
      </div>

      <div class="contact-detail">
        <img
          src="../assets/images/telephone-fill.svg"
          alt=""
          class="contact-icon"
        />
        <span>${contact.Phone}</span>
      </div>

      <div class="contact-detail">
        <img
          src="../assets/images/clock-fill.svg"
          alt=""
          class="contact-icon"
        />
        <span>${formatDate(contact.AddDate)}</span>
      </div>
    `;

      contactsContainer.appendChild(contactCard);
    });
  }

  function sortContacts(sortBy) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      contactsContainer.innerHTML = "<p>No logged-in user found.</p>";

      if (contactsCount) {
        contactsCount.textContent = "0 Contacts";
      }

      return;
    }

    removeLoadMoreButton();

    fetch("/LAMPAPI/SortContact.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(userId),
        sortBy: sortBy,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("Sort contacts response:", data);

        contactsContainer.innerHTML = "";

        if (data.error && data.error !== "") {
          contactsContainer.innerHTML = "<p>No contacts found.</p>";

          if (contactsCount) {
            contactsCount.textContent = "0 Contacts";
          }

          return;
        }

        if (contactsCount) {
          contactsCount.textContent = `${data.contacts.length} Contacts`;
        }

        renderContacts(data.contacts);
      })
      .catch(function (error) {
        console.error("Sort contacts error:", error);
        contactsContainer.innerHTML = "<p>Could not sort contacts.</p>";

        if (contactsCount) {
          contactsCount.textContent = "0 Contacts";
        }
      });
  }

  function loadContacts(page, append) {
    console.log("loadContacts called", {
      page: page,
      append: append,
      userId: localStorage.getItem("userId"),
    });
    const userId = localStorage.getItem("userId");
    const contactsContainer = document.getElementById("contactsContainer");
    const contactsCount = document.getElementById("contactsCount");

    if (!userId) {
      console.error("No logged-in user found.");
      return;
    }

    if (isLoadingContacts) {
      return;
    }

    isLoadingContacts = true;

    fetch("/LAMPAPI/GetContacts.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(userId),
        page: page,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("Get contacts response:", data);

        isLoadingContacts = false;

        if (!append) {
          contactsContainer.innerHTML = "";
        } else {
          removeLoadMoreButton();
        }

        if (data.error && data.error !== "") {
          if (!append) {
            contactsContainer.innerHTML = "<p>No contacts found.</p>";
            contactsCount.textContent = "0 Contacts";
          }
          return;
        }

        currentContactsPage = data.page;
        totalContactsPages = data.totalPages;

        contactsCount.textContent = `${data.total} Contacts`;

        renderContacts(data.contacts);

        if (currentContactsPage < totalContactsPages) {
          addLoadMoreButton();
        }
      })
      .catch(function (error) {
        isLoadingContacts = false;
        console.error("Get contacts error:", error);
        contactsContainer.innerHTML = "<p>Could not load contacts.</p>";
      });
  }

  function addLoadMoreButton() {
    const contactsContainer = document.getElementById("contactsContainer");

    const loadMoreWrapper = document.createElement("div");
    loadMoreWrapper.className = "load-more-wrapper";
    loadMoreWrapper.id = "loadMoreWrapper";

    loadMoreWrapper.innerHTML = `
    <button type="button" class="load-more-button" id="loadMoreContacts">
      Load More
    </button>
  `;

    contactsContainer.appendChild(loadMoreWrapper);

    const loadMoreButton = document.getElementById("loadMoreContacts");

    loadMoreButton.addEventListener("click", function () {
      loadContacts(currentContactsPage + 1, true);
    });
  }

  function removeLoadMoreButton() {
    const oldLoadMoreWrapper = document.getElementById("loadMoreWrapper");

    if (oldLoadMoreWrapper) {
      oldLoadMoreWrapper.remove();
    }
  }
});

function countPhoneDigits(phone) {
  return phone.replace(/\D/g, "").length;
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const datePart = dateString.split(" ")[0];
  const parts = datePart.split("-");

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  const date = new Date(year, month, day);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
