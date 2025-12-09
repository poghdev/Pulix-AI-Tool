document.getElementById('show-register').addEventListener('click', function (e) {
  e.preventDefault();
  document.querySelector('.auth-wrapper').classList.remove('login-mode');
  document.querySelector('.auth-wrapper').classList.add('register-mode');
});

document.getElementById('show-login').addEventListener('click', function (e) {
  e.preventDefault();
  document.querySelector('.auth-wrapper').classList.remove('register-mode');
  document.querySelector('.auth-wrapper').classList.add('login-mode');
});

function showFieldMessage(field, message, type = "error") {
  let msgBox = field.nextElementSibling; // предполагаем, что сразу после input <div class="form-message">
  if (!msgBox || !msgBox.classList.contains("form-message")) {
    msgBox = document.createElement("div");
    msgBox.className = "form-message";
    field.insertAdjacentElement("afterend", msgBox);
  }

  msgBox.textContent = message;
  msgBox.style.color = type === "success" ? "limegreen" : "red";
  msgBox.style.display = "block";
}

function clearFieldMessages(form) {
  form.querySelectorAll(".form-message").forEach(m => m.remove());
}

function validateEmail(email) {
  return email.includes("@");
}

function validatePassword(password) {
  return password.length >= 8 && /\d/.test(password);
}

function validateNotEmpty(value) {
  return value.trim().length > 0;
}

document.querySelector(".register-page .auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  clearFieldMessages(form);

  const first_name = document.getElementById("reg-name");
  const last_name = document.getElementById("reg-lastname");
  const email = document.getElementById("reg-email");
  const password = document.getElementById("reg-password");

  if (!validateNotEmpty(first_name.value)) {
    return showFieldMessage(first_name, "First name cannot be empty.");
  }
  if (!validateNotEmpty(last_name.value)) {
    return showFieldMessage(last_name, "Last name cannot be empty.");
  }
  if (!validateEmail(email.value)) {
    return showFieldMessage(email, "Email must contain '@'.");
  }
  if (!validatePassword(password.value)) {
    return showFieldMessage(password, "Password must be 8+ characters and contain a number.");
  }

  const body = {
    first_name: first_name.value,
    last_name: last_name.value,
    email: email.value,
    password: password.value
  };

  const res = await fetch("http://localhost:8000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  let data;
  try { data = await res.json(); } 
  catch { data = { detail: "Server error" }; }

  if (res.ok) {
    showFieldMessage(password, "Registration successful! Now log in.", "success");
    setTimeout(() => {
      document.querySelector('.auth-wrapper').classList.remove('register-mode');
      document.querySelector('.auth-wrapper').classList.add('login-mode');
    }, 1000);
  } else {
    if (data.detail.includes("password")) {
      showFieldMessage(password, data.detail);
    } else if (data.detail.includes("email")) {
      showFieldMessage(email, data.detail);
    } else {
      showFieldMessage(password, data.detail);
    }
  }
});

document.querySelector(".login-page .auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  clearFieldMessages(form);

  const email = document.getElementById("login-email");
  const password = document.getElementById("login-password");

  // ===== LOCAL VALIDATION =====
  if (!validateEmail(email.value)) {
    return showFieldMessage(email, "Email must contain '@'.");
  }
  if (!validatePassword(password.value)) {
    return showFieldMessage(password, "Password must be 8+ characters and contain a number.");
  }

  const body = { email: email.value, password: password.value };

  const res = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  let data;
  try { data = await res.json(); } 
  catch { data = { detail: "Server error" }; }

  if (res.ok) {
    showFieldMessage(password, "Login successful! Redirecting...", "success");
    localStorage.setItem("token", data.access_token);
    setTimeout(() => { window.location.href = "../private/dashboard.html"; }, 800);
  } else {
    if (data.detail.includes("password")) {
      showFieldMessage(password, data.detail);
    } else if (data.detail.includes("email")) {
      showFieldMessage(email, data.detail);
    } else {
      showFieldMessage(password, data.detail);
    }
  }
});

const token = localStorage.getItem("token");
const firstName = localStorage.getItem("firstName");
const lastName = localStorage.getItem("lastName");

if (token) {
    document.querySelector(".auth-links").style.display = "none";

    document.querySelector(".user-info").innerHTML = `
        ${firstName} ${lastName}
        <button id="logout">Logout</button>
    `;
}