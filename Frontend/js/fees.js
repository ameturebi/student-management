document.addEventListener("DOMContentLoaded", function() {
  const feeForm = document.getElementById("feeForm");
  const trackFeeForm = document.getElementById("trackFeeForm");
  const generateReceiptForm = document.getElementById("generateReceiptForm");

  feeForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const data = {
      studentId: document.getElementById("studentId").value,
      feeAmount: document.getElementById("feeAmount").value,
      paidDate: document.getElementById("paidDate").value,
      status: document.getElementById("status").value
    };
    fetch('/insert-fee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => {
      const alertBox = document.createElement('div');
      alertBox.className = 'alert alert-success alert-dismissible fade show';
      alertBox.role = 'alert';
      alertBox.innerHTML = `
        <strong>Success!</strong> Fee recorded successfully.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.getElementById("feeResponse").appendChild(alertBox);
      setTimeout(() => {
        alertBox.remove();
      }, 3000);
      feeForm.reset(); // Reset the form fields
    })
    .catch(error => {
      console.error('Error:', error);
      const alertBox = document.createElement('div');
      alertBox.className = 'alert alert-danger alert-dismissible fade show';
      alertBox.role = 'alert';
      alertBox.innerHTML = `
        <strong>Error!</strong> ${error}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.getElementById("feeResponse").appendChild(alertBox);
    });
  });

  trackFeeForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const studentId = document.getElementById("trackStudentId").value;
    
    fetch(`/track-fee-status/${studentId}`)
      .then(response => response.json())
      .then(data => {
        console.log("API Response:", data); // Debugging line to check API data
  
        if (!data || data.length === 0) {
          document.getElementById("modalBody").innerHTML = `<p class="text-danger">No fee records found for this student.</p>`;
          return;
        }
  
        let cards = "";
        data.forEach(fee => {
          const feeID = fee.FEE_ID || "N/A";
          const amount = fee.FEE_AMOUNT !== undefined ? `${fee.FEE_AMOUNT} Birr` : "N/A";
          const paidDate = fee.PAID_DATE || "N/A";
          const status = fee.STATUS || "Unknown";
  
          cards += `
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Fee ID: ${feeID}</h5>
                <p class="card-text"><strong>Amount:</strong> ${amount}</p>
                <p class="card-text"><strong>Paid Date:</strong> ${paidDate}</p>
                <p class="card-text"><strong>Status:</strong> 
                  <span class="badge bg-${status === 'Paid' ? 'success' : 'warning'}">${status}</span>
                </p>
              </div>
            </div>`;
        });
  
        document.getElementById("modalBody").innerHTML = cards;
  
        const feeStatusModal = new bootstrap.Modal(document.getElementById('feeStatusModal'));
        feeStatusModal.show();
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById("modalBody").innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
      });
      const feeStatusModalElement = document.getElementById('feeStatusModal');
feeStatusModalElement.addEventListener('hidden.bs.modal', function () {
    document.getElementById('trackFeeForm').reset();  // Reset the form fields
});
  });
  

  generateReceiptForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const feeId = document.getElementById("feeId").value;

    console.log("Requested Fee ID:", feeId);

    fetch(`/generate-fee-receipt/${feeId}`)
    .then(response => response.json())  // Parse as JSON
    .then(data => {
        console.log(data);

        let receiptContent = `
            <p>Receipt for Fee ID: ${data.FEE_ID}</p>
            <p>Student ID: ${data.STUDENT_ID}</p>
            <p>Amount: ${data.FEE_AMOUNT}</p>
            <p>Paid Date: ${new Date(data.PAID_DATE).toLocaleDateString()}</p>
            <p>Status: <strong>${data.STATUS}</strong></p>
        `;

        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = receiptContent;
        modalBody.classList.remove('bg-success', 'bg-warning');  // Remove previous styles
        modalBody.classList.add(data.isPending ? 'bg-warning' : 'bg-success');  // Add the right class

        document.getElementById("feeStatusModalLabel").textContent = "Fee Receipt";

        const feeStatusModal = new bootstrap.Modal(document.getElementById('feeStatusModal'));
        feeStatusModal.show();
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("modalBody").textContent = 'Error: ' + error;
    });
});

// Reset form after modal is closed
const feeStatusModalElement = document.getElementById('feeStatusModal');
feeStatusModalElement.addEventListener('hidden.bs.modal', function () {
    document.getElementById('generateReceiptForm').reset();  // Reset the form fields
});

});
