const express=require('express');
const cors = require('cors');
const mysql = require('mysql');
const path=require('path')
require('dotenv').config()

const app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Frontend')));
const db = mysql.createConnection({ 
    host: "localhost", 
    user: "SMS", 
    password: "SMS", 
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
const PORT = process.env.PORT || 2025;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Creat Tables 
    // Create Student Table 
// let Students=`CREATE TABLE IF NOT EXISTS STUDENTS ( 
//     STUDENT_ID INT AUTO_INCREMENT PRIMARY KEY, 
//     FIRST_NAME  VARCHAR(100) NOT NULL,
//     GENDER VARCHAR(10), 
//     CLASS VARCHAR(50), 
//     GUARDIAN_NAME VARCHAR(100), 
//     GUARDIAN_EMAIL VARCHAR(100),
// )
// `
// let Attendance=`CREATE TABLE IF NOT EXISTS ATTENDANCE (
//     ATTENDANCE_ID INT AUTO_INCREMENT PRIMARY KEY,
//     STUDENT_ID INT NOT NULL,
//     STATUS ENUM('PRESENT', 'ABSENT', 'LATE', 'PERMISSION') NOT NULL,
//     REMARKS TEXT,
//     FOREIGN KEY (STUDENT_ID) REFERENCES STUDENTS(STUDENT_ID)
// )`
// let Payment=`CREATE TABLE IF NOT EXISTS  PAYMENT (
//     PAYMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
//     STUDENT_ID INT NOT NULL,
//     PAYMENT_DATE DATE NOT NULL,
//     PAYMENT_STATUS ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL,
//     PAYMENT_TYPE ENUM('TUITION', 'EXAM_FEES', 'LIBRARY_FEE', 'OTHER') NOT NULL,
//     REMARKS TEXT,
//     FOREIGN KEY (STUDENT_ID) REFERENCES STUDENTS(STUDENT_ID)
// )`
// db.query(Students,(err,result)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log('Students Table Created')
//     }
// });
// db.query(Attendance,(err,result)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log('Attendance Table Created')
//     }
// });
// db.query(Payment,(err,result)=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log('Payment Table Created')
//     }
// });  



app.get('/students', (req, res) => {
    let students = `SELECT * FROM STUDENTS`;
    db.query(students, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
            console.table(result);
        }
    });
});

app.get("/students/:id", (req, res) => {
    let ID = req.params.id;
    let selectcust = `SELECT * FROM STUDENTS WHERE STUDENT_ID = ?`;
    db.query(selectcust, [ID], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.table(result);
            res.json(result);
        }
    });
});

app.post('/add_student', (req, res) => { 
    const student = req.body; 
    db.query('INSERT INTO STUDENTS SET ?', student, (err) => { 
        if (err) {
            console.log(err);
            res.status(500).send('Error adding student');
        } else {
            res.send('Student added');
        }
    });
});

app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const student = req.body;
    db.query('UPDATE STUDENTS SET ? WHERE STUDENT_ID = ?', [student, id], (err) => {
        if (err) {
            res.status(500).send('Error updating student');
        } else {
            res.send('Student updated successfully');
        }
    });
});

app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM STUDENTS WHERE STUDENT_ID = ?', [id], (err) => {
        if (err) {
            res.status(500).send('Error deleting student');
        } else {
            res.send('Student deleted successfully');
        }
    });
});

// ATTENDANCE ROUTES
app.get('/attendance', (req, res) => {
    let attendance = `SELECT * FROM ATTENDANCE`;
    db.query(attendance, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error fetching attendance records');
        } else {
            res.json(result);
            console.table(result);
        }
    });
});

app.get('/attendance/:student_id', (req, res) => {
    const { student_id } = req.params;
    let attendance = `SELECT * FROM ATTENDANCE WHERE STUDENT_ID = ?`;
    db.query(attendance, [student_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error fetching attendance records for the student');
        } else {
            res.json(result);
            console.table(result);
        }
    });
});

app.post('/attendance', (req, res) => {
    const attendance = req.body;
    db.query('INSERT INTO ATTENDANCE SET ?', attendance, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error adding attendance record');
        } else {
            res.send('Attendance record added');
        }
    });
});

app.put('/attendance/:attendance_id', (req, res) => {
    const { attendance_id } = req.params;
    const attendance = req.body;
    db.query('UPDATE ATTENDANCE SET ? WHERE ATTENDANCE_ID = ?', [attendance, attendance_id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error updating attendance record');
        } else {
            res.send('Attendance record updated successfully');
        }
    });
});

app.delete('/attendance/:attendance_id', (req, res) => {
    const { attendance_id } = req.params;
    db.query('DELETE FROM ATTENDANCE WHERE ATTENDANCE_ID = ?', [attendance_id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting attendance record');
        } else {
            res.send('Attendance record deleted successfully');
        }
    });
});

// PAYMENT METHODS
app.get('/payments', (req, res) => {
    let payments = `SELECT * FROM PAYMENT`;
    db.query(payments, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error fetching payment records');
        } else {
            res.json(result);
            console.table(result);
        }
    });
});

app.get('/payments/:student_id', (req, res) => {
    const { student_id } = req.params;
    let payments = `SELECT * FROM PAYMENT WHERE STUDENT_ID = ?`;
    db.query(payments, [student_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error fetching payment records for the student');
        } else {
            res.json(result);
            console.table(result);
        }
    });
});

app.post('/payments', (req, res) => {
    const payment = req.body;
    db.query('INSERT INTO PAYMENT SET ?', payment, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error adding payment record');
        } else {
            res.send('Payment record added');
        }
    });
});

app.put('/payments/:payment_id', (req, res) => {
    const { payment_id } = req.params;
    const payment = req.body;
    db.query('UPDATE PAYMENT SET ? WHERE PAYMENT_ID = ?', [payment, payment_id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error updating payment record');
        } else {
            res.send('Payment record updated successfully');
        }
    });
});

// Uncommented and fixed deletion route
app.delete('/payments/:payment_id', (req, res) => {
    const { payment_id } = req.params;
    db.query('DELETE FROM PAYMENT WHERE PAYMENT_ID = ?', [payment_id], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting payment record');
        } else {
            res.send('Payment record deleted successfully');
        }
    });
});

// ALTER TABLE QUERY
const query = `ALTER TABLE STUDENTS 
                    DROP COLUMN AGE` 

db.query(query, (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Columns removed successfully');
    }
});

