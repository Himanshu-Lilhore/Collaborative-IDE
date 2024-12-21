const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const { tokenizeSession } = require('../utils/tokenizer');
const { defaultFileTree, sessionTokenValidity } = require('../utils/constants')

const excludeSensitive = (dataMap) => {
    dataMap = dataMap.toObject()
    const sensitive = ['__v', 'createdAt', 'updatedAt', 'password']
    const filteredKeys = Object.keys(dataMap).filter(key => !sensitive.includes(key))
    let cleanData = {}
    filteredKeys.forEach(key => cleanData[key] = dataMap[key])
    return (cleanData)
}

exports.createSession = async (req, res) => {
    try {
        let sessionConfig = {}
        if (req.user) sessionConfig.admin = req.user._id
        else sessionConfig.admin = null
        let newProj = null
        if (req.body.project) {
            sessionConfig.project = req.body.project
            sessionConfig.sessionFileTree = structuredClone((await Project.findById(req.body.project)).fileTree)
        }
        else {
            newProj = await Project.create({
                name: 'Auto generated project',
                fileTree: defaultFileTree,
                isPrivate: false
            })
            sessionConfig.project = newProj._id
            sessionConfig.sessionFileTree = defaultFileTree
        }
        const newSession = await Session.create({
            ...sessionConfig,
            ...req.body,
        })
        const sessionToken = tokenizeSession(newSession._id)
        res.cookie('sessiontoken', sessionToken, { httpOnly: true, maxAge: sessionTokenValidity, sameSite: 'None', secure: true })
        await User.findByIdAndUpdate(req.user._id, { sessions: [...req.user.sessions, newSession._id] })
        console.log('Session created : ', newSession._id)
        res.status(200).json(excludeSensitive(newSession));
    } catch (error) {
        res.clearCookie('sessiontoken', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        res.status(500).json({ error: error.message });
    }
};


exports.getSession = async (req, res) => {
    try {
        let session = null
        if (req.body.projectId) session = await Session.findOne({ project: req.body.projectId })
        else session = await Session.findById(req.body.sessionId)

        if (!session) return res.status(404).json({ message: 'Session not found' });
        else {
            const sessionToken = tokenizeSession(session._id)
            res.cookie('sessiontoken', sessionToken, { httpOnly: true, maxAge: sessionTokenValidity, sameSite: 'None', secure: true })
            console.log('Session fetched : ', session._id)
            res.status(200).json(excludeSensitive(session));
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.joinSession = async (req, res) => {
    try {
        const session = await Session.find({ ...req.body })
        if (!session) return res.status(404).json({ message: 'Session not found' });
        else {
            console.log(`${req.user._id} joined session ${session._id}`)
            const sessionToken = tokenizeSession(session._id)
            res.cookie('sessiontoken', sessionToken, { httpOnly: true, maxAge: sessionTokenValidity, sameSite: 'None', secure: true })
            res.status(200).json(excludeSensitive(session));
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


// exports.getAllSessions = async (req, res) => {
//     try {
//         const sessions = await Session.find()//.populate('lastUpdatedBy', 'name email');
//         res.status(200).json(sessions);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// exports.updateSession = async (req, res) => {
//     try {
//         const updates = req.body;
//         console.log(updates._id.toString());
//         const updatedSession = await Session.findByIdAndUpdate(
//             req.body._id,
//             { ...updates, lastUpdatedBy: req.body.lastUpdatedBy },
//             { new: true }
//         );
//         if (!updatedSession) return res.status(404).json({ message: 'Session not found' });
//         res.status(200).json(updatedSession);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// exports.deleteSession = async (req, res) => {
//     try {
//         const deletedSession = await Session.findByIdAndDelete(req.body._id);
//         if (!deletedSession) return res.status(404).json({ message: 'Session not found' });
//         res.status(200).json({ message: `Session ${deletedSession._id} deleted successfully` });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// exports.saveSession = async (req, res) => {
//     try {
//         const ydoc = new Y.Doc();
//         const docMap = ydoc.getMap('documents');
//         console.log("docMap : ", docMap)////////////////////////////
//         const unsavedDocsMap = ydoc.getMap('unsavedDocs');

//         let unsavedFiles = Array.from(unsavedDocsMap.keys())
//         console.log("unsavedFiles : ", unsavedFiles)//////////////////////
//         unsavedFiles = unsavedFiles.filter(id => globalState.yjsCache.cache.keys().includes(id));
//         console.log("unsavedFiles : ", unsavedFiles)//////////////////////
//         if (unsavedFiles.length === 0) {
//             console.log("No unsaved files to save.");
//             res.status(200).send({ message: "No unsaved files to save." });
//             return
//         }

//         for (const fileId of unsavedFiles) {
//             const ytext = docMap.get(fileId);
//             if (ytext) {
//                 const fileContent = ytext.toString();
//                 await updateFile(fileId, null, fileContent, null);
//             } else {
//                 console.warn(`File with ID ${fileId} not found in Y.Map.`);
//             }
//         }

//         res.status(200).send({ message: "Files saved successfully" });
//     } catch (error) {
//         console.error("Error saving files:", error);
//         res.status(500).send("Failed to save files");
//     }
// };
