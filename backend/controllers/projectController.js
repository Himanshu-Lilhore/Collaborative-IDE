const Project = require('../models/projectModel');
const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const Y = require('yjs');
const globalState = require('../utils/state');
const { readFileLocally } = require('../services/fileService');
const { defaultFileTree } = require('../utils/constants')
const { updateFile } = require('../controllers/explorerController');


exports.createProject = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.body;
        const savedProject = await Project.create({ name, description, isPrivate, fileTree: defaultFileTree })
        await User.findByIdAndUpdate(req.user._id, { projects: [...req.user.projects, savedProject._id] })
        res.status(200).json(savedProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.body._id)//.populate('lastUpdatedBy', 'name email');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()//.populate('lastUpdatedBy', 'name email');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateProject = async (req, res) => {
    try {
        const updates = req.body;
        console.log(updates._id.toString());
        const updatedProject = await Project.findByIdAndUpdate(
            req.body._id,
            { ...updates, lastUpdatedBy: req.body.lastUpdatedBy },
            { new: true }
        );
        if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.body._id);
        if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json({ message: `Project ${deletedProject._id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


saveFilesRecursively = async (tree) => {
    for (const node of tree) {
        if (node.children) {
            await saveFilesRecursively(node.children);
        } else {
            let updateSuccess = false;
            if (node.children === null && !node.isSaved) {
                const data = await readFileLocally(node);
                if(data) updateSuccess = await updateFile({ fileId: node.id, content: data, fileName: node.name });
                else console.log(`Failed to read file ${node.name} (from local).`);
                if (updateSuccess) {
                    node.isSaved = true;
                    console.log(`File ${node.name} updated successfully (to DB).`);
                } else {
                    console.error(`Failed to update file ${node.name} (to DB).`);
                }
            } else {
                console.log(`File ${node.name} is already saved.`);
                // return true;
            }
        }
    }
}


exports.saveProject = async (req, res) => {
    try {
        // const ydoc = new Y.Doc();
        // const docMap = ydoc.getMap('documents');
        // console.log("docMap : ", docMap)////////////////////////////
        // const unsavedDocsMap = ydoc.getMap('unsavedDocs');

        // let unsavedFiles = Array.from(unsavedDocsMap.keys())
        await saveFilesRecursively(globalState.sessionFileTree);

        await Session.findByIdAndUpdate(globalState.sessionId, { sessionFileTree: globalState.sessionFileTree })
        globalState.io.emit('filetree', globalState.sessionFileTree);

        res.status(200).send({ message: "Files saved successfully" });
    } catch (error) {
        console.error("Error saving files:", error);
        res.status(500).send("Failed to save files");
    }
};
