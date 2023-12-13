const LibraryModel = require("../models/Library.model.js");

/** GET: http://localhost:5000/api/library/example */
exports.getLibrary = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    return await LibraryModel.findOne({ _id: id, owner: userId })
        .then(async (library) => res.status(200).json(library))
        .catch((error) => res.status(400).send({ message: "Couldn't read library data!" }))
}

/** POST: http://localhost:5000/api/library or http://localhost:5000/api/auth/onboarding 
 * @param:{
        "name":"Shanti Digital Library",
        "address":"Chandpur Harvansh, Dabhasemar-224133",
        "description":"It is an innovative platform designed to preserve, organize, and provide access to a vast array of digital content spanning various disciplines and subject areas."
    } 
*/
exports.createLibrary = async (req, res) => {
    try {
        const { userId } = req.user;

        const { name, address, description } = req.body;

        if (!name.trim("") && !address.trim("")) res.status(400).send({ message: "Please fill all the necessary fields" });

        const libraryInstance = LibraryModel({ name, address, description, owner: userId })

        await libraryInstance.save()
            .then((library) => {
                return res.status(201).send(library)
            })
            .catch((error) => {
                return res.status(400).send({ message: "Couldn't add a library!" })
            })

    } catch (error) {
        return res.status(500).send(error)
    }
}

/** PUT: http://localhost:5000/api/library/example
 * @param:{
        "name":"Shanti Digital Library",
        "address":"Chandpur Harvansh, Dabhasemar-224133",
        "description":"It is an innovative platform designed to preserve, organize, and provide access to a vast array of digital content spanning various disciplines and subject areas."
    } 
*/
exports.updateLibrary = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    return await LibraryModel.findOneAndUpdate(
        { _id: id, owner: userId },
        { $set: req.body },
        { new: true }
    )
        .then((library) => {
            if (!library) res.status(404).send({ message: "Couldn't find library!" })

            return res.status(202).send(library)
        })
        .catch((error) => res.status(500).send({ message: "Couldn't update library!" }));
};

/** DELETE: http://localhost:5000/api/library/example */
exports.deleteLibrary = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    await LibraryModel.findByIdAndRemove({ _id: id,owner:userId })
        .then((result) => {
            return res.status(202).send({ message: "Library deleted successfully!" });
        })
        .catch((error) => {
            return res.status(500).send({ message: "Couldn't delete library!" })
        });
};

/** POST: http://localhost:5000/api/library */
exports.getLibraries = async (req, res) => {
    try {
        const { userId } = req.user;

        const libraries = await LibraryModel.find({ owner: userId })

        return res.status(200).send(libraries)
    } catch (error) {
        return res.status(500).send(error)
    }
}