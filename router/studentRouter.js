const express = require("express");
const { Auth } = require("../middleware/auth");
const { createStudent, getStudent, getStudents, updateStudent, deleteStudent } = require("../controllers/studentController");

const router = express.Router();

router.route("/")
    .get(Auth, getStudents)
    .post(Auth, createStudent);
    
router.route("/:id")
    .get(Auth, getStudent)
    .put(Auth, updateStudent)
    .delete(Auth, deleteStudent)

module.exports = router;