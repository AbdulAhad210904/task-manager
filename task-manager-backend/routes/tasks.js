const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');


router.get('/active', taskController.getActiveTasks); // get active tasks
router.get('/archived', taskController.getArchivedTasks); // get archived tasks
router.get('/tree', taskController.getTaskTree); // get task tree
router.get('/:id', taskController.getTaskById); // get task by id
router.post('/', taskController.createTask); // create new task
router.put('/:id', taskController.updateTask); // update task
router.patch('/:id/move', taskController.moveTask); // mpove task
router.delete('/:id', taskController.deleteTask); //delete task with cascade

module.exports = router;