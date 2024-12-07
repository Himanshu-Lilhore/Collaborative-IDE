const Project = require('../models/projectModel');
const Y = require('yjs');
const globalState = require('../utils/state');
const { updateFile } = require('../services/fileService')


exports.createProject = async (req, res) => {
    try {
        const { name, description, githubLink, liveLink, lastUpdatedBy, fileTree } = req.body;
        const newProject = new Project({ name, description, githubLink, liveLink, lastUpdatedBy, fileTree });
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
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
        const updatedProject = await Project.findByIdAndUpdate(
            req.body._id,
            { ...updates, lastUpdatedBy: req.body.lastUpdatedBy },
            { new: true, runValidators: true }
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


exports.saveProject = async (req, res) => {
    try {
        const ydoc = new Y.Doc();
        const docMap = ydoc.getMap('documents');
        console.log("docMap : ", docMap)////////////////////////////
        const unsavedDocsMap = ydoc.getMap('unsavedDocs');

        let unsavedFiles = Array.from(unsavedDocsMap.keys())
        console.log("unsavedFiles : ", unsavedFiles)//////////////////////
        unsavedFiles = unsavedFiles.filter(id => globalState.yjsCache.cache.keys().includes(id));
        console.log("unsavedFiles : ", unsavedFiles)//////////////////////
        if (unsavedFiles.length === 0) {
            console.log("No unsaved files to save.");
            res.status(200).send({ message: "No unsaved files to save." });
            return
        }

        for (const fileId of unsavedFiles) {
            const ytext = docMap.get(fileId);
            if (ytext) {
                const fileContent = ytext.toString();
                await updateFile(fileId, null, fileContent, null);
            } else {
                console.warn(`File with ID ${fileId} not found in Y.Map.`);
            }
        }

        res.status(200).send({ message: "Files saved successfully" });
    } catch (error) {
        console.error("Error saving files:", error);
        res.status(500).send("Failed to save files");
    }
};
