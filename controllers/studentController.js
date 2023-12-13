const LibraryModel = require("../models/Library.model.js");
const StudentModel = require("../models/Student.model.js");

/** GET: http://localhost:5000/api/student/example/?libraryId=example */
exports.getStudent = async (req, res) => {
    const { id } = req.params;
    const { libraryId } = req.query;
    const { userId } = req.user;

    const library = await LibraryModel.findOne({ _id: libraryId, owner: userId })

    return await StudentModel.findOne({ _id: id, library: library._id })
        .then(async (student) => {
            if(!student) res.status(404).send({message:"Couldn't find student!"}) 
            
            return res.status(200).json(student)
        })
        .catch((error) => res.status(400).send({ message: "Couldn't read student data!" }))
}

/** POST: http://localhost:5000/api/student/?libraryId=example
 * @param:{
        "name":"example",
        "email":"example@gmail.com",
        "mobile":"+91 99999-99999",
        "address":"Chandpur Harvansh, Dabhasemar-224133",
        "profile":"base64"
    } 
*/
exports.createStudent = async (req, res) => {
    try {
        const { userId } = req.user;

        const { libraryId } = req.query;

        const { name, email, mobile, address } = req.body;

        if (!name.trim() && !mobile.trim() && !email.trim()) res.status(400).send({ message: "Please fill all the necessary fields" });

        const library = await LibraryModel.findOne({ _id: libraryId, owner: userId })

        const studentInstance = StudentModel({ name, email, mobile, address, library: library._id })

        await studentInstance.save()
            .then((student) => {
                return res.status(201).send(student)
            })
            .catch((error) => {
                return res.status(400).send({ message: "Couldn't add a student!" })
            })
    } catch (error) {
        console.log(" Error: ", error)

        return res.status(500).send(error)
    }
}


/** PUT: http://localhost:5000/api/student/example/?libraryId=example
 * @param:{
        "name":"example",
        "email":"example@gmail.com",
        "mobile":"+91 99999-99999",
        "address":"Chandpur Harvansh, Dabhasemar-224133",
        "profile":"base64"
    }
*/
exports.updateStudent = async (req, res) => {
    const { id } = req.params;

    const { userId } = req.user;

    const { libraryId } = req.query;

    const library = await LibraryModel.findOne({ _id: libraryId, owner: userId })

    return await StudentModel.findOneAndUpdate(
        { _id: id, library: library._id },
        { $set: req.body },
        { new: true }
    )
        .then((student) => {
            if (!student) res.status(404).send({ message: "Couldn't find student!" })

            return res.status(202).send(student)
        })
        .catch((error) => res.status(500).send({ message: "Couldn't update student!" }));
};

/** PUT: http://localhost:5000/api/student/example/?libraryId=example */
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;

    const { userId } = req.user;

    const { libraryId } = req.query;

    const library = await LibraryModel.findOne({ _id: libraryId, owner: userId })

    await StudentModel.findByIdAndRemove({ _id: id, library: library._id })
        .then((student) => {
            if(!student) res.status(404).send({message:"Couldn't find student!"})

            return res.status(202).send({ message: "Student deleted successfully!" });
        })
        .catch((error) => {
            return res.status(500).send({ message: "Couldn't delete Student!" })
        });
};

/** GET: http://localhost:5000/api/student */
exports.getStudents = async (req, res) => {
    try {
        const { userId } = req.user;

        const { libraryId } = req.query;

        const library = await LibraryModel.findOne({ _id: libraryId, owner: userId })

        const students = await StudentModel.find({ library: library._id })

        return res.status(200).send(students)
    } catch (error) {
        return res.status(500).send(error)
    }
}
