const toggleButton = document.getElementById("sidebarToggle");
const cancelButton = document.getElementById("cancelButton");
const sidebar = document.getElementById("sidebar");

toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("toggled");
});

cancelButton.addEventListener("click", () => {
    sidebar.classList.remove("toggled");
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('/students')
    .then(response => response.json())
    .then(data => {
        const tablebody = document.querySelector('#table tbody');
        tablebody.innerHTML = '';
        data.forEach(student => {
            const row = `
                <tr>
                    <td>${student.STUDENT_ID}</td>
                    <td>${student.FIRST_NAME}</td>
                    <td>${student.LAST_NAME}</td>
                    <td>${student.CLASS}</td>
                    <td>${student.STATUS}</td>
                </tr>
            `;
            tablebody.insertAdjacentHTML('beforeend', row);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

