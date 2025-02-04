document.addEventListener('DOMContentLoaded', () => {
    const fetchAndDisplayStudents = () => {
        fetch('http://localhost:2025/student')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch students');
                return response.json();
            })
            .then(data => {
                const tableBody = document.querySelector('.table-All tbody');
                if (tableBody) {
                    tableBody.innerHTML = '';
                    const rowsHTML = data.map(row => `
                        <tr data-student-id="${row.STUDENT_ID}">
                            <td>${row.STUDENT_ID}</td>
                            <td>${row.FIRST_NAME}</td>
                            <td>${row.GENDER}</td>
                            <td>${row.CLASS}</td>
                            <td>${row.GUARDIAN_NAME}</td>
                            <td>${row.GUARDIAN_EMAIL}</td>
                            <td>
                                <button class="btn btn-primary btn-sm edit-btn" data-id="${row.STUDENT_ID}"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${row.STUDENT_ID}"><i class="bi bi-person-x"></i></button>
                            </td>
                        </tr>`).join('');
                    tableBody.insertAdjacentHTML('beforeend', rowsHTML);
                    
                    // Add event listeners to delete buttons after displaying students
                    const deleteButtons = document.querySelectorAll('.delete-btn');
                    deleteButtons.forEach(button => {
                        button.addEventListener('click', handleDeleteStudent);
                    });
                   // Ensure the event listener references the correct function
                    const editButtons = document.querySelectorAll('.edit-btn');
                    editButtons.forEach(button => {
                        button.addEventListener('click', handleEdit);  // Use 'handleEdit' consistently
                    });

                    

                } else {
                    console.error('Table body not found');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                showMessage('Error fetching data.', 'danger');
            });
    };
    
    fetchAndDisplayStudents();

    document.getElementById('searchInput').addEventListener('input', function () {
        const query = this.value.trim();
        
        if (query === '') {
            fetchAndDisplayStudents(); // Reset to full list when search is cleared
            return;
        }
    
        fetch(`/search?q=${query}`)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector('.table-All tbody');
                tableBody.innerHTML = '';
    
                if (data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="7">No students found.</td></tr>';
                    return;
                }
    
                const rowsHTML = data.map(row => `
                    <tr data-student-id="${row.STUDENT_ID}">
                        <td>${row.STUDENT_ID}</td>
                        <td>${row.FIRST_NAME}</td>
                        <td>${row.GENDER}</td>
                        <td>${row.CLASS}</td>
                        <td>${row.GUARDIAN_NAME}</td>
                        <td>${row.GUARDIAN_EMAIL}</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-btn" data-id="${row.STUDENT_ID}"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${row.STUDENT_ID}"><i class="bi bi-person-x"></i></button>
                        </td>
                    </tr>`).join('');
    
                tableBody.insertAdjacentHTML('beforeend', rowsHTML);
    
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                showMessage('Error fetching search results. Please try again.', 'danger');
            });
    });
    
    

    const form = document.querySelector('#studentForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
    
            const studentId = form.querySelector('#studentId').value;
            const student = {
                FIRST_NAME: form.querySelector('#studentName').value,
                GENDER: form.querySelector('#gender').value,
                CLASS: form.querySelector('#course').value,
                GUARDIAN_NAME: form.querySelector('#parentName').value,
                GUARDIAN_EMAIL: form.querySelector('#parentEmail').value,
            };
    
            if (studentId) {
                // Update student
                fetch(`http://localhost:2025/update_student/${studentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(student),
                })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to update student');
                    return response.text();
                })
                .then(data => {
                    if (data === "Student updated") {
                        updateStudentInTable({ ...student, STUDENT_ID: studentId });
                        showMessage('Student updated successfully!', 'success');
                        form.reset();
    
                        const modalElement = document.getElementById('modalform');
                        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                        modal.hide();
                        

                    } else {
                        showMessage('Failed to update student.', 'danger');
                    }
                })
                .catch(error => {
                    console.error('Error updating student:', error);
                    showMessage('Error updating student.', 'danger');
                });
            } else {
                // Add student
                fetch('http://localhost:2025/add_student', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(student),
                })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to add student');
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        student.STUDENT_ID = data.generatedId;
                        addStudentToTable(student);
                        showMessage('Student added successfully!', 'success');
                        form.reset();
    
                        const modalElement = document.getElementById('modalform');
                        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                        modal.hide();

                    } else {
                        showMessage('Failed to add student.', 'danger');
                    }
                })
                .catch(error => {
                    console.error('Error adding student:', error);
                    showMessage('Error adding student.', 'danger');
                });
            }
        });
    }

    
    

   
    
    

    

    // Add event listener to the confirm delete button
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    confirmDeleteButton.addEventListener('click', () => {
        const studentId = confirmDeleteButton.getAttribute('data-id');
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);

        fetch(`http://localhost:2025/student/${studentId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete student');
            return response.text(); // Get raw response text instead of parsing as JSON
        })
        .then(text => {
            if (text.includes('Student deleted successfully')) {
                row.remove();
                showMessage('Student deleted successfully!', 'success');

                // Hide the confirmation modal after successful deletion
                const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
                confirmationModal.hide();
            } else {
                showMessage('Failed to delete student.', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deleting student:', error);
            showMessage('Error deleting student.', 'danger');
        });
    });
});

// Handle student deletion
const handleDeleteStudent = (event) => {
    const button = event.target.closest('.delete-btn'); // Find the closest ancestor element with the class 'delete-btn' to ensure we get the correct delete button
    const studentId = button.getAttribute('data-id'); // Retrieve the student ID from the data-id attribute of the delete button

    // Store the student ID in a data attribute of the modal's confirm button
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    confirmDeleteButton.setAttribute('data-id', studentId);

    // Show the confirmation modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();
};
const handleEdit = (event) => {
        // Get the closest button (to handle cases when the icon inside the button is clicked)
        const button = event.target.closest('.edit-btn');
        const studentId = button.getAttribute('data-id');
        const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
    
        const student = {
            STUDENT_ID: studentId,
            FIRST_NAME: row.children[1].innerText,
            GENDER: row.children[2].innerText,
            CLASS: row.children[3].innerText,
            GUARDIAN_NAME: row.children[4].innerText,
            GUARDIAN_EMAIL: row.children[5].innerText,
        };
    
        populateForm(student); // Populate the form with the student data
    
        // Show the modal with the form
        const modalElement = document.getElementById('modalform');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    };
    const populateForm = (student) => {
        const form = document.querySelector('#studentForm');
        form.querySelector('#studentId').value = student.STUDENT_ID; // Hidden field for student ID
        form.querySelector('#studentName').value = student.FIRST_NAME;
        form.querySelector('#gender').value = student.GENDER;
        form.querySelector('#course').value = student.CLASS;
        form.querySelector('#parentName').value = student.GUARDIAN_NAME;
        form.querySelector('#parentEmail').value = student.GUARDIAN_EMAIL;
    };
    const updateStudentInTable = (student) => {
        const row = document.querySelector(`tr[data-student-id="${student.STUDENT_ID}"]`);
        if (row) {
            row.children[1].innerText = student.FIRST_NAME;
            row.children[2].innerText = student.GENDER;
            row.children[3].innerText = student.CLASS;
            row.children[4].innerText = student.GUARDIAN_NAME;
            row.children[5].innerText = student.GUARDIAN_EMAIL;
    
            // Reattach event listeners after updating row
            row.querySelector('.edit-btn').addEventListener('click', handleEdit);
            row.querySelector('.delete-btn').addEventListener('click', handleDeleteStudent);
        }
    };
const showMessage = (message, type) => {
    const messageContainer = document.createElement('div');
    messageContainer.className = `alert alert-${type}`;
    messageContainer.innerText = message;
    document.body.insertBefore(messageContainer, document.body.firstChild);
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
};

const addStudentToTable = (student) => {
    const tableBody = document.querySelector('.table-All tbody');
    if (tableBody) {
        const tableRowHTML = `
            <tr data-student-id="${student.STUDENT_ID}">
                <td>${student.STUDENT_ID}</td>
                <td>${student.FIRST_NAME}</td>
                <td>${student.GENDER}</td>
                <td>${student.CLASS}</td>
                <td>${student.GUARDIAN_NAME}</td>
                <td>${student.GUARDIAN_EMAIL}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${student.STUDENT_ID}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${student.STUDENT_ID}"><i class="bi bi-person-x"></i></button>
                </td>
            </tr>`;
        tableBody.insertAdjacentHTML('beforeend', tableRowHTML);

        // Select the newly added row
        const tableRow = tableBody.querySelector(`tr[data-student-id="${student.STUDENT_ID}"]`);

        // Add event listeners for the new row
        tableRow.querySelector('.delete-btn').addEventListener('click', handleDeleteStudent);
        tableRow.querySelector('.edit-btn').addEventListener('click', handleEdit);
    } else {
        console.error(`Table body not found for class: ${student.CLASS}`);
    }
};



// Modal Functionality
const openModalButton = document.getElementById("openModalButton");
const closeModalButton = document.getElementById("closeModalButton");
const modal = document.getElementById("addStudentModal");
// const form = document.getElementById("addStudentForm");

// Close Modal if clicked outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none"; // Hide the modal
    }
});
