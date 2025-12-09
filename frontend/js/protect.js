const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/frontend/public/auth.html";
}