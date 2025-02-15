const express=require('express');
const moment = require('moment-timezone');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { PDFDocument, rgb } = require('pdf-lib');
const path=require('path');
const session = require('express-session');
const app = express();

app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use(express.json());
// app.use(express.static('Frontend'));
app.use(express.static(path.join(__dirname, 'Frontend')));
app.use(session({
    secret: 'EKsh@3462',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));


const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"SMS"
})

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database!");
});



const PORT = 2025;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const createTables = () => {
//     const createStudentsTable = `
//         CREATE TABLE IF NOT EXISTS STUDENTS (
//             STUDENT_ID INT AUTO_INCREMENT PRIMARY KEY,
//             FIRST_NAME VARCHAR(100) NOT NULL,
//             GENDER VARCHAR(10),
//             CLASS VARCHAR(50),
//             GUARDIAN_NAME VARCHAR(100),
//             GUARDIAN_EMAIL VARCHAR(100)
//         );
//     `;

//     const createAttendanceTable = `
//         CREATE TABLE IF NOT EXISTS ATTENDANCE (
//             ATTENDANCE_ID INT AUTO_INCREMENT PRIMARY KEY,
//             STUDENT_ID INT NOT NULL,
//             STATUS ENUM('PRESENT', 'ABSENT', 'LATE', 'PERMISSION') NOT NULL,
//             REMARKS TEXT,
//             FOREIGN KEY (STUDENT_ID) REFERENCES STUDENTS(STUDENT_ID)
//         );
//     `;

//     const createPaymentTable = `
//         CREATE TABLE IF NOT EXISTS PAYMENT (
//             PAYMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
//             STUDENT_ID INT NOT NULL,
//             PAYMENT_DATE DATE NOT NULL,
//             PAYMENT_STATUS ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL,
//             PAYMENT_TYPE ENUM('TUITION', 'EXAM_FEES', 'LIBRARY_FEE', 'OTHER') NOT NULL,
//             REMARKS TEXT,
//             FOREIGN KEY (STUDENT_ID) REFERENCES STUDENTS(STUDENT_ID)
//         );
//     `;

//     db.query(createStudentsTable, (err, result) => {
//         if (err) {
//             console.log('Error creating STUDENTS table:', err);
//         } else {
//             console.log('STUDENTS table created successfully');
//         }
//     });

//     db.query(createAttendanceTable, (err, result) => {
//         if (err) {
//             console.log('Error creating ATTENDANCE table:', err);
//         } else {
//             console.log('ATTENDANCE table created successfully');
//         }
//     });

//     db.query(createPaymentTable, (err, result) => {
//         if (err) {
//             console.log('Error creating PAYMENT table:', err);
//         } else {
//             console.log('PAYMENT table created successfully');
//         }
//     });
// };

// createTables();


//handling login 



app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM USERS WHERE USERNAME = ?';

    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).send('Error querying database');
        }

        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }

        req.session.user = { id: user.USER_ID, username: user.USERNAME };
        res.status(200).send('Login successful');
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

app.get('/dashboard', (req, res) => {
    // res.send("Server is running!");
    res.sendFile(path.join(__dirname, 'Frontend', 'dashboard.html'));
});


app.get('/', (req, res) => {
    // res.send("Server is running!");
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

//  get all students
app.get('/student', (req, res) => {
    let students = `SELECT * FROM STUDENTS  `;
    db.query(students, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
            // console.table(result);
        }
    });
});
//get student with id 
app.get("/student/:id", (req, res) => {
    let ID = parseInt(req.params.id); // Parse the ID to integer
    

    let selectcust = `SELECT * FROM STUDENTS WHERE STUDENT_ID = ?`;
    db.query(selectcust, ID, (err, result) => {
        if (err) {
            // console.log('Database error:', err);
            return res.status(500).send('Error fetching student data');
        }

        console.log('Query executed, result:', result);

        if (result.length === 0) {
            // console.log('No student found with ID:', ID);
            return res.status(404).send('Student not found');
        }

        // console.log('Fetched student data:', result[0]);
        res.json(result[0]);
    });
});
//getting student with course
app.get('/students/:course',(req,res)=>{
    let course=req.params.course;
    let query = `SELECT * FROM STUDENTS WHERE CLASS=?  `;
    db.query(query, [course],(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
            // console.table(result);
        }
    });


})
//get student by search query
app.get('/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    const sql = `SELECT * FROM students WHERE LOWER(FIRST_NAME) LIKE ? OR LOWER(CLASS) LIKE ? OR STUDENT_ID = ?`;
    const values = [`%${query}%`, `%${query}%`, isNaN(query) ? null : parseInt(query)];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });  
        res.json(results);
}});
});

    
//adding student
app.post('/add_student', (req, res) => {
    const student = req.body;
    db.query('INSERT INTO STUDENTS SET ?', student, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ success: false, message: 'Error adding student' }); 
        } else {
            res.send({ success: true, generatedId: result.insertId, message: 'Student added successfully' }); // Return JSON object with success status and generated ID
        }
    });
});

//edit/update student by id
app.put('/update_student/:id', (req, res) => { 
    const id = req.params.id; 
    const student = req.body; 
    db.query('UPDATE STUDENTS SET ? WHERE STUDENT_ID = ?', [student, id], (err) => { 
        if (err) { 
            console.log('Database error:', err); 
        return res.status(500).send('Error updating student'); 
        } 
        else {
            res.send('Student updated');; 
        } });
} ) 
// delete s tudent by id 
app.delete('/student/:id', (req, res) => {
    const { id } = req.params;

    // First delete related attendance records
    db.query('DELETE FROM attendance WHERE STUDENT_ID = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting attendance records:', err.message);
            res.status(500).send(`Error deleting attendance records: ${err.message}`);
        } else {
            // Now delete the student record
            db.query('DELETE FROM STUDENTS WHERE STUDENT_ID = ?', [id], (err, result) => {
                if (err) {
                    console.error('Error deleting student:', err.message);
                    res.status(500).send(`Error deleting student: ${err.message}`);
                } else if (result.affectedRows === 0) {
                    res.status(404).send('Student not found');
                } else {
                    res.send('Student deleted successfully');
                }
            });
        }
    });
});




//Attendance issue end points 

//taking attendance
app.post("/attendance", (req, res) => {
    const { attendanceData } = req.body; // Array of {studentId, status, date}
    
    const values = attendanceData.map(({ studentId, status, date }) => [studentId, date, status]);

    const query = "INSERT INTO ATTENDANCE (STUDENT_ID, ATTENDANCE_DATE, STATUS) VALUES ?";
    
    db.query(query, [values], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Attendance recorded successfully." });
    });
});


app.get("/studentss/:className", (req, res) => {
    const className = req.params.className;
    
    const query = "SELECT STUDENT_ID, FIRST_NAME FROM STUDENTS WHERE CLASS = ?";
    
    db.query(query, [className], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});
// Fetch Attendance Data

// track attendance by date for specific course students 
app.get("/attendance/:className/:startDate/:endDate", (req, res) => { 
    let { className, startDate, endDate } = req.params; 
    console.log("Received className from request:", className); 
    console.log("Received startDate:", startDate); 
    console.log("Received endDate:", endDate); 
    className = className.trim(); // Ensure no spaces
  
    // Convert dates to consistent format with timezone
    const formattedStartDate = moment.tz(startDate, 'YYYY-MM-DD', 'Etc/UTC').startOf('day').format('YYYY-MM-DD');
    const formattedEndDate = moment.tz(endDate, 'YYYY-MM-DD', 'Etc/UTC').endOf('day').format('YYYY-MM-DD');
  
    console.log("Formatted startDate:", formattedStartDate);
    console.log("Formatted endDate:", formattedEndDate);
  
    const query = `
      SELECT A.STUDENT_ID, A.ATTENDANCE_DATE, A.STATUS 
      FROM ATTENDANCE A 
      JOIN STUDENTS S ON A.STUDENT_ID = S.STUDENT_ID 
      WHERE S.CLASS = ? 
      AND A.ATTENDANCE_DATE BETWEEN ? AND ? 
    `;
    console.log("Executing query with params:", [className, formattedStartDate, formattedEndDate]);
    
    db.query(query, [className, formattedStartDate, formattedEndDate], (err, results) => { 
      if (err) { 
        console.error("Database error:", err); 
        return res.status(500).json({ error: err.message }); 
      } 
      console.log("Query Results:", results); 
      res.json(results); 
    }); 
  });

// get attendance report pdf  by date for specific course students 
app.get("/generate-report/:className/:startDate/:endDate", async (req, res) => { 
    let { className, startDate, endDate } = req.params; 
    const query = `
      SELECT S.FIRST_NAME, S.GUARDIAN_NAME, A.ATTENDANCE_DATE, A.STATUS 
      FROM ATTENDANCE A 
      JOIN STUDENTS S ON A.STUDENT_ID = S.STUDENT_ID 
      WHERE S.CLASS = ? 
      AND A.ATTENDANCE_DATE BETWEEN ? AND ?
    `;
    
    db.query(query, [className, startDate, endDate], async (err, results) => { 
      if (err) { 
        console.error('Database query error:', err); 
        return res.status(500).json({ error: 'Database query error: ' + err.message }); 
      } 
      try { 
        // Create a new PDF document 
        const pdfDoc = await PDFDocument.create(); 
        const page = pdfDoc.addPage([600, 400]); 
        const { width, height } = page.getSize(); 
        // Set PDF title 
        page.drawText(`Attendance Report for ${className}`, { 
          x: 50, 
          y: height - 50, 
          size: 20, 
          color: rgb(0, 0.53, 0.77), 
        }); 
        // Draw table headers 
        page.drawText(`First Name`, { x: 50, y: height - 100, size: 12 }); 
        page.drawText(`Last Name`, { x: 150, y: height - 100, size: 12 }); 
        page.drawText(`Date`, { x: 250, y: height - 100, size: 12 }); 
        page.drawText(`Status`, { x: 350, y: height - 100, size: 12 }); 
        
        // Draw table data 
        let y = height - 120; 
        results.forEach(row => { 
          const firstName = row.FIRST_NAME || ''; 
          const lastName = row.GUARDIAN_NAME || ''; 
          const attendanceDate = new Date(row.ATTENDANCE_DATE).toISOString().split('T')[0]; // Convert date to string 
          const status = row.STATUS || ''; 
          page.drawText(firstName, { x: 50, y, size: 10 }); 
          page.drawText(lastName, { x: 150, y, size: 10 }); 
          page.drawText(attendanceDate, { x: 250, y, size: 10 }); 
          page.drawText(status, { x: 350, y, size: 10 }); 
          y -= 20; 
        }); 
        
        // Serialize the PDFDocument to bytes (a Uint8Array) 
        const pdfBytes = await pdfDoc.save(); 
        res.setHeader('Content-Type', 'application/pdf'); 
        res.setHeader('Content-Disposition', `attachment; filename=${className}_attendance_report_${startDate}_to_${endDate}.pdf`); 
        res.send(Buffer.from(pdfBytes)); 
      } catch (pdfError) { 
        console.error('PDF generation error:', pdfError); 
        res.status(500).json({ error: 'Failed to generate PDF report.' }); 
      } 
    }); 
});

// store fee info
app.post('/insert-fee', (req, res) => {
    const { studentId, feeAmount, paidDate, status } = req.body;
    const query = 'INSERT INTO Fees (Student_ID, Fee_Amount, Paid_Date, Status) VALUES (?, ?, ?, ?)';
   db.query(query, [studentId, feeAmount, paidDate, status], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Fee data inserted successfully');
    });
});
// track fee statuse for specific student
app.get('/track-fee-status/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    const query = 'SELECT * FROM Fees WHERE Student_ID = ?';
    db.query(query, [studentId], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(results);
    });
});
// get fee receipt 
app.get('/generate-fee-receipt/:feeId', (req, res) => {
    const feeId = req.params.feeId;
    const query = 'SELECT * FROM Fees WHERE Fee_ID = ?';
    
    db.query(query, [feeId], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        
        if (results.length === 0) {
            return res.status(404).send('No fee record found for the given Fee ID');
        }

        const receipt = results[0]; // Assuming you're working with a single record

        // Adding extra logic to differentiate based on status
        receipt.isPending = receipt.STATUS === 'Pending'; // You can add more custom properties if needed
        
        res.json(receipt);  // Send the result as JSON
    });
});
 //get total number of registered students 
app.get('/api/total-students', (req, res) => {
    let sql = 'SELECT COUNT(*) AS total_students FROM students';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result[0]);
    });
});
// get attendance percentage
app.get('/api/attendance-rate', (req, res) => {
    let sql = 'SELECT (SUM(CASE WHEN status="Present" THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS attendance_rate FROM attendance';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result[0]);
    });
});
// get total fee collected 
app.get('/api/fees-collected', (req, res) => {
    let sql = 'SELECT SUM(fee_amount) AS fees_collected FROM fees WHERE status="Paid"';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result[0]);
    });
});









