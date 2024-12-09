const express = require('express');
const router = express.Router();
const {createProject, getProject, getAllProjects, updateProject, deleteProject} = require('../controllers/projectController');


router.post('/create', createProject);

router.get('/get', getProject);
router.get('/getAll', getAllProjects);

router.post('/update', updateProject);

router.delete('/delete', deleteProject);

module.exports = router;
