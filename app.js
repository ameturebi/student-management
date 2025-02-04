const express=require('express');
const cors = require('cors');
const mysql = require('mysql');
const path=require('path')
require('dotenv').config()

const app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use(express.json());
// app.use(express.static('Frontend'));
app.use(express.static(path.join(__dirname, 'Frontend')));
const db = mysql.createConnection({ 
    host: "localhost", 
    user: "root", 
    password: "", 
    database:"SMS"
})
db.connect((err,result) => {
    if (err){
        console.log(err)
    }
    else{
        console.log('connected')
    }
    
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
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

app.get("/student/:id", (req, res) => {
    let ID = parseInt(req.params.id); // Parse the ID to integer
    // console.log('Received request for student ID:', ID);

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
app.get('/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    const sql = `SELECT * FROM students WHERE LOWER(FIRST_NAME) LIKE ? OR LOWER(CLASS) LIKE ? OR STUDENT_ID = ?`;
    const values = [`%${query}%`, `%${query}%`, isNaN(query) ? null : parseInt(query)];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Internal Server Error' });  // Return JSON instead of plain text
        }
        res.json(results);
    });
});

    





app.post('/add_student', (req, res) => {
    const student = req.body;
    db.query('INSERT INTO STUDENTS SET ?', student, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ success: false, message: 'Error adding student' }); // Return JSON object for error
        } else {
            res.send({ success: true, generatedId: result.insertId, message: 'Student added successfully' }); // Return JSON object with success status and generated ID
        }
    });
});


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


app.delete('/student/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM STUDENTS WHERE STUDENT_ID = ?', [id], (err) => {
        if (err) {
            res.status(500).send('Error deleting student');
        } else {
            res.send('Student deleted successfully');
        }
    });
});

// // ATTENDANCE ROUTES
// app.get('/attendance', (req, res) => {
//     let attendance = `SELECT * FROM ATTENDANCE`;
//     db.query(attendance, (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error fetching attendance records');
//         } else {
//             res.json(result);
//             console.table(result);
//         }
//     });
// });

// app.get('/attendance/:student_id', (req, res) => {
//     const { student_id } = req.params;
//     let attendance = `SELECT * FROM ATTENDANCE WHERE STUDENT_ID = ?`;
//     db.query(attendance, [student_id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error fetching attendance records for the student');
//         } else {
//             res.json(result);
//             console.table(result);
//         }
//     });
// });

// app.post('/attendance', (req, res) => {
//     const attendance = req.body;
//     db.query('INSERT INTO ATTENDANCE SET ?', attendance, (err) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error adding attendance record');
//         } else {
//             res.send('Attendance record added');
//         }
//     });
// });

// app.put('/attendance/:attendance_id', (req, res) => {
//     const { attendance_id } = req.params;
//     const attendance = req.body;
//     db.query('UPDATE ATTENDANCE SET ? WHERE ATTENDANCE_ID = ?', [attendance, attendance_id], (err) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error updating attendance record');
//         } else {
//             res.send('Attendance record updated successfully');
//         }
//     });
// });

// app.delete('/attendance/:attendance_id', (req, res) => {
//     const { attendance_id } = req.params;
//     db.query('DELETE FROM ATTENDANCE WHERE ATTENDANCE_ID = ?', [attendance_id], (err) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error deleting attendance record');
//         } else {
//             res.send('Attendance record deleted successfully');
//         }
//     });
// });

// // PAYMENT METHODS
// app.get('/payments', (req, res) => {
//     let payments = `SELECT * FROM PAYMENT`;
//     db.query(payments, (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error fetching payment records');
//         } else {
//             res.json(result);
//             console.table(result);
//         }
//     });
// });

// app.get('/payments/:student_id', (req, res) => {
//     const { student_id } = req.params;
//     let payments = `SELECT * FROM PAYMENT WHERE STUDENT_ID = ?`;
//     db.query(payments, [student_id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error fetching payment records for the student');
//         } else {
//             res.json(result);
//             console.table(result);
//         }
//     });
// });

// app.post('/payments', (req, res) => {
//     const payment = req.body;
//     db.query('INSERT INTO PAYMENT SET ?', payment, (err) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error adding payment record');
//         } else {
//             res.send('Payment record added');
//         }
//     });
// });

// app.put('/payments/:payment_id', (req, res) => {
//     const { payment_id } = req.params;
//     const payment = req.body;
//     db.query('UPDATE PAYMENT SET ? WHERE PAYMENT_ID = ?', [payment, payment_id], (err) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error updating payment record');
//         } else {
//             res.send('Payment record updated successfully');
//         }
//     });
// });

// // Uncommented and fixed deletion route
// app.delete('/payments/:payment_id', (req, res) => {
//     const { payment_id } = req.params;
//     db.query('DELETE FROM PAYMENT WHERE PAYMENT_ID = ?', [payment_id], (err) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error deleting payment record');
//         } else {
//             res.send('Payment record deleted successfully');
//         }
//     });
// });

// // ALTER TABLE QUERY
// const query = `ALTER TABLE STUDENTS 
//                     DROP COLUMN AGE` 

// db.query(query, (err, result) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log('Columns removed successfully');
//     }
// });

