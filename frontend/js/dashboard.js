const userMenuBtn = document.getElementById("user-menu-btn");
const userMenu = document.getElementById("user-menu");

userMenuBtn.addEventListener("click", () => {
  userMenu.classList.toggle("hidden");
});

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/frontend/public/auth.html";
} else {
  fetch("http://localhost:8000/auth/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then(data => {
    document.getElementById("user-name").textContent = data.first_name;
    document.getElementById("user-email").textContent = data.email;
    document.getElementById("user-plan").textContent = data.plan;
  })
  .catch(() => {
    localStorage.removeItem("token");
    window.location.href = "/frontend/public/auth.html";
  });
}

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/frontend/public/auth.html";
});

document.getElementById("delete-btn").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete your account?")) return;

  const res = await fetch("http://localhost:8000/auth/delete", {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (res.ok) {
    localStorage.removeItem("token");
    alert("Account deleted successfully.");
    window.location.href = "/frontend/public/auth.html";
  } else {
    alert("Failed to delete account.");
  }
});