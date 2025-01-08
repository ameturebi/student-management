// const toggleButton = document.getElementById("sidebarToggle");
// const cancelButton = document.getElementById("cancelButton");
// const sidebar = document.getElementById("sidebar");

// toggleButton.addEventListener("click", () => {
//     sidebar.classList.toggle("toggled");
// });

// // cancelButton.addEventListener("click", () => {
// //     sidebar.classList.remove("toggled");
// // });







document.addEventListener('DOMContentLoaded', () => {
    const courses = ['FullStack', 'MobileApp', 'Graphics']; // Example courses
    
    // Function to fetch and display students by course
    const fetchAndDisplayStudents = () => {
        courses.forEach(course => {
            fetch(`http://localhost:2025/students/${course}`)
                .then(response => response.json())
                .then(data => {
                    const tableBody = document.querySelector(`.table-${course} tbody`); // Select the correct table body
                    if (tableBody) {
                        tableBody.innerHTML = ''; // Clear existing rows
                        data.forEach(row => {
                            const tableRow = `
                                <tr>
                                    <td>${row.STUDENT_ID}</td>
                                    <td>${row.FIRST_NAME}</td>
                                    <td>${row.GENDER}</td>
                                    <td>${row.CLASS}</td>
                                    <td>${row.GUARDIAN_NAME}</td>
                                    <td>${row.GUARDIAN_EMAIL}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm edit-btn" data-id="${row.STUDENT_ID}"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-danger btn-sm delete-btn" data-id="${row.STUDENT_ID}"><i class="fas fa-trash-alt"></i></button>
                                    </td>
                                </tr>
                            `;
                            tableBody.innerHTML += tableRow; // Append the row to the table body
                        });

                        // Add event listeners for edit and delete buttons
                        tableBody.querySelectorAll('.edit-btn').forEach(button => {
                            button.addEventListener('click', handleEdit);
                        });
                        tableBody.querySelectorAll('.delete-btn').forEach(button => {
                            button.addEventListener('click', handleDelete);
                        });
                    } else {
                        console.error(`Table body not found for ${course}`);
                    }
                })
                .catch(error => console.error(`Error fetching data for ${course}:`, error));
        });
    };

    // Call the function to fetch and display students initially
    fetchAndDisplayStudents();

    // Function to show success or error message
    const showMessage = (message, type) => {
        const messageContainer = document.createElement('div');
        messageContainer.className = `alert alert-${type}`;
        messageContainer.innerText = message;

        // Append the message to the top
        const mainContainer = document.querySelector('body'); // or any specific element where you want to display the message
        mainContainer.insertBefore(messageContainer, mainContainer.firstChild);

        setTimeout(() => {
            messageContainer.remove();
        }, 3000);
    };

    // Function to add a student to the table
    const addStudentToTable = (student) => {
        const tableBody = document.querySelector(`.table-${student.CLASS} tbody`);
        if (tableBody) {
            const tableRow = `
                <tr>
                    <td>${row.STUDENT_ID}</td>
                    <td>${student.FIRST_NAME}</td>
                    <td>${student.GENDER}</td>
                    <td>${student.CLASS}</td>
                    <td>${student.GUARDIAN_NAME}</td>
                    <td>${student.GUARDIAN_EMAIL}</td>
                    <td>
                        <button class="btn btn-primary btn-sm edit-btn" data-id="${student.STUDENT_ID}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${student.STUDENT_ID}"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
            tableBody.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', handleEdit);
            });
            tableBody.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDelete);
            });
            tableBody.innerHTML += tableRow;
        } else {
            console.error(`Table body not found for course: ${student.course}`);
        }
    };

    // Function to populate the form with student data
    const populateForm = (student) => {
        console.log('Populating form with student data:', student); // Log the student data
        document.getElementById('studentId').value = student.STUDENT_ID;
        document.getElementById('studentName').value = student.FIRST_NAME || '';
        document.getElementById('gender').value = student.GENDER || '';
        document.getElementById('course').value = student.CLASS || '';
        document.getElementById('parentName').value = student.GUARDIAN_NAME || '';
        document.getElementById('parentEmail').value = student.GUARDIAN_EMAIL || '';
    };
    

    const handleEdit = (event) => {
        const studentId = event.currentTarget.dataset.id;
        fetch(`http://localhost:2025/student/${studentId}`)
            .then(response => {
                if (response.status === 404) {
                    throw new Error('Student not found');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(student => {
                console.log('Fetched student data:', student);
                populateForm(student);
                const modalElement = document.querySelector('#modalform');
                const modalInstance = new bootstrap.Modal(modalElement);
                modalInstance.show();
            })
            .catch(error => {
                console.error('Error fetching student data:', error);
                showMessage(error.message, 'danger');
            });
    };
    

    // Form submission handling
    const studentForm = document.getElementById('studentForm');
    studentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(studentForm);
        const studentData = Object.fromEntries(formData.entries());

        const url = studentData.STUDENT_ID ? `http://localhost:2025/update_student` : `http://localhost:2025/add_student`;
        const method = studentData.STUDENT_ID ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        })
        .then(response => response.text())
        .then(data => {
            if (data === 'Student added' || data === 'Student updated') {
                const message = data === 'Student added' ? 'Student added successfully' : 'Student updated successfully';
                showMessage(message, 'success');
                fetchAndDisplayStudents(); // Refresh the table to show updates

                // Hide the modal
                const modalElement = document.querySelector('#modalform');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();

                // Clear form inputs
                studentForm.reset();
            } else {
                showMessage('Error adding/updating student', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error adding/updating student', 'danger');
        });
    });
});




// Modal Functionality
const openModalButton = document.getElementById("openModalButton");
const closeModalButton = document.getElementById("closeModalButton");
const modal = document.getElementById("addStudentModal");
const form = document.getElementById("addStudentForm");

// Open Modal Function


// Close Modal if clicked outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none"; // Hide the modal
    }
});
