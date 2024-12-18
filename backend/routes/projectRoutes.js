const express = require('express');
const router = express.Router();
const {authCheck} = require('../middlewares/authCheck')
const {createProject, getProject, getAllProjects, updateProject, deleteProject, saveProject} = require('../controllers/projectController');


router.post('/create', authCheck, createProject);

router.post('/get', getProject);
router.get('/getAll', getAllProjects);

router.post('/update', authCheck, updateProject);

router.delete('/delete', authCheck, deleteProject);

router.post('/save', saveProject);

module.exports = router;
