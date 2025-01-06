const toggleButton = document.getElementById("sidebarToggle");
const cancelButton = document.getElementById("cancelButton");
const sidebar = document.getElementById("sidebar");

toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("toggled");
});

cancelButton.addEventListener("click", () => {
    sidebar.classList.remove("toggled");
});