const express = require("express");
const { Auth } = require("../middleware/auth");
const { createLibrary, getLibraries, deleteLibrary, updateLibrary, getLibrary } = require("../controllers/libraryController");

const router = express.Router();

router.route("/").get(Auth,getLibraries).post(Auth,createLibrary);
router.route("/:id").get(Auth,getLibrary).put(Auth,updateLibrary).delete(Auth,deleteLibrary);

module.exports = router;