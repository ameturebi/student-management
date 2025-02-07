document.addEventListener("DOMContentLoaded", function () {
    // Attendance Form
    const classSelectAttendance = document.getElementById("classSelectAttendance");
    const studentTableBody = document.getElementById("studentTableBody");
    const submitAttendanceBtn = document.getElementById("submitAttendance");

    classSelectAttendance.addEventListener("change", function () {
        const selectedClass = classSelectAttendance.value;
        if (!selectedClass) return;

        fetch(`http://localhost:2025/studentss/${selectedClass}`)
            .then(response => response.json())
            .then(students => {
                studentTableBody.innerHTML = ""; // Clear previous data

                students.forEach(student => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${student.FIRST_NAME}</td>
                        <td>
                            <select class="form-select attendanceStatus" data-student-id="${student.STUDENT_ID}">
                                <option value="PRESENT">Present</option>
                                <option value="ABSENT">Absent</option>
                                <option value="LATE">Late</option>
                                <option value="PERMISSION">Permission</option>
                            </select>
                        </td>
                    `;
                    studentTableBody.appendChild(row);
                });
            });
    });

    submitAttendanceBtn.addEventListener("click", function () {
        const attendanceData = [];
        document.querySelectorAll(".attendanceStatus").forEach(select => {
            attendanceData.push({
                studentId: select.getAttribute("data-student-id"),
                status: select.value,
                date: new Date().toISOString().split("T")[0] // Today's date
            });
        });

        fetch("http://localhost:2025/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attendanceData })
        }).then(response => response.json())
        .then(data => {
            displayAlert(data.message, "success");
            studentTableBody.innerHTML = "";
        });
    });

    function displayAlert(message, type) {
        const alertMessage = document.getElementById("alertMessage");
        alertMessage.className = `alert alert-${type}`;
        alertMessage.innerText = message;
        alertMessage.style.display = "block";
        setTimeout(() => alertMessage.style.display = "none", 3000);
    }



  
    const viewAttendanceBtn = document.getElementById("viewAttendance"); 
    viewAttendanceBtn.addEventListener("click", function () { 
      const selectedClass = classSelectView.value.trim(); 
      const startDate = document.getElementById("startDate").value; 
      const endDate = document.getElementById("endDate").value; 
      
      if (!selectedClass || !startDate || !endDate) { 
        console.error('Please fill out all fields.'); 
        return; 
      } 
      
      const formattedStartDate = new Date(startDate).toISOString().split("T")[0]; 
      const formattedEndDate = new Date(endDate).toISOString().split("T")[0]; 
      console.log("Fetching attendance for:", selectedClass, "from", formattedStartDate, "to", formattedEndDate); 
      
      const requestUrl = `/attendance/${encodeURIComponent(selectedClass)}/${encodeURIComponent(formattedStartDate)}/${encodeURIComponent(formattedEndDate)}?nocache=${new Date().getTime()}`; 
      console.log("Requesting URL:", requestUrl); 
      
      fetch(requestUrl) 
        .then(response => response.json()) 
        .then(data => { 
          console.log("Received Data:", data); 
          attendanceTableBody.innerHTML = ""; // Clear previous data 
          data.forEach(record => { 
            const tr = document.createElement("tr"); 
            tr.innerHTML = `<td>${record.STUDENT_ID}</td><td>${new Date(record.ATTENDANCE_DATE).toISOString().split("T")[0]}</td><td>${record.STATUS}</td>`; 
            attendanceTableBody.appendChild(tr); 
          }); 
        }) 
        .catch(error => console.error('Fetch error:', error)); 
    });
    

document.getElementById('generateReport').addEventListener('click', function () { 
    const selectedClass = classSelectView.value.trim(); 
    const startDate = document.getElementById("startDate").value; 
    const endDate = document.getElementById("endDate").value; 
    
    if (!selectedClass || !startDate || !endDate) { 
      console.error('Please fill out all fields.'); 
      return; 
    } 
    
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0]; 
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0]; 
    const requestUrl = `/generate-report/${encodeURIComponent(selectedClass)}/${encodeURIComponent(formattedStartDate)}/${encodeURIComponent(formattedEndDate)}`; 
    
    // Fetch the PDF report from the backend and provide a download link 
    fetch(requestUrl) 
      .then(response => response.blob()) 
      .then(blob => { 
        const url = window.URL.createObjectURL(blob); 
        const a = document.createElement('a'); 
        a.style.display = 'none'; 
        a.href = url; 
        a.download = `${selectedClass}_attendance_report_${formattedStartDate}_to_${formattedEndDate}.pdf`; 
        document.body.appendChild(a); 
        a.click(); 
        window.URL.revokeObjectURL(url); 
      }) 
      .catch(error => console.error('Report generation error:', error)); 
  });
  
    
});















