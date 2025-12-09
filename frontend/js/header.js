document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const authButtons = document.querySelector(".auth-buttons");
  const userMenu = document.querySelector(".user-menu");
  const userNameBtn = document.querySelector(".user-name-btn");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const emailSpan = document.querySelector(".user-email");
  const planSpan = document.querySelector(".user-plan");
  const logoutBtn = document.querySelector(".logout-btn");
  const deleteBtn = document.querySelector(".delete-btn");

  if (token) {
    authButtons.querySelectorAll("a").forEach(a => a.style.display = "none");
    userMenu.style.display = "inline-block";

    try {
      const res = await fetch("http://localhost:8000/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Token invalid");

      const data = await res.json();

      userNameBtn.textContent = data.user.first_name;
      emailSpan.textContent = data.user.email;
      planSpan.textContent = data.user.plan;

    } catch (err) {
      console.log(err);
      localStorage.removeItem("token");
      window.location.href = "../frontend/public/auth.html";
    }
  }

  userNameBtn.addEventListener("click", () => {
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../public/auth.html";
  });

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;
    try {
      const res = await fetch("http://localhost:8000/auth/delete", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete account");
      localStorage.removeItem("token");
      alert("Account deleted");
      window.location.href = "../public/auth.html";
    } catch (err) {
      alert(err.message);
    }
  });
});