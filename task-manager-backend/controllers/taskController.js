const Task = require('../models/Task');


exports.getActiveTasks = async (req, res, next) => {
  try {
    //pagination logic
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ archived: false })
      .populate('parentTask', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments({ archived: false });

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.getArchivedTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ archived: true })
      .populate('parentTask', 'title')
      .sort({ archivedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments({ archived: true });

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


exports.getTaskTree = async (req, res, next) => {
  try {
    const archived = req.query.archived === 'true';
    const tasks = await Task.find({ archived, parentTask: null })
      .populate('parentTask', 'title')
      .sort({ createdAt: -1 });

    const buildTree = async (parentTasks) => {
      const result = [];
      for (const task of parentTasks) {
        const subtasks = await Task.find({ parentTask: task._id, archived })
          .populate('parentTask', 'title')
          .sort({ createdAt: -1 });
        
        result.push({
          ...task.toObject(),
          subtasks: subtasks.length > 0 ? await buildTree(subtasks) : []
        });
      }
      return result;
    };

    const tree = await buildTree(tasks);
    res.json(tree);
  } catch (error) {
    next(error);
  }
};

// new task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, parentTask } = req.body;

    //validate parent task if selected
    if (parentTask) {
      const parent = await Task.findById(parentTask);
      if (!parent) {
        return res.status(400).json({ error: 'Parent task not found' });
      }
      if (parent.archived) {
        return res.status(400).json({ error: 'Cannot add subtask to archived task' });
      }
    }

    const task = new Task({
      title,
      description,
      parentTask: parentTask || null
    });

    await task.save();
    await task.populate('parentTask', 'title');

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};


exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.archived) {
      return res.status(400).json({ error: 'Cannot update archived task' });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.completed = completed !== undefined ? completed : task.completed;

    await task.save();
    await task.populate('parentTask', 'title');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

//move task to different parent
exports.moveTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parentTask } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.archived) {
      return res.status(400).json({ error: 'Cannot move archived task' });
    }

    //validate new parent task if provided
    if (parentTask) {
      const parent = await Task.findById(parentTask);
      if (!parent) {
        return res.status(400).json({ error: 'Parent task not found' });
      }
      if (parent.archived) {
        return res.status(400).json({ error: 'Cannot move task to archived parent' });
      }
    }

    task.parentTask = parentTask || null;
    await task.save();
    await task.populate('parentTask', 'title');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Delete task with cascade
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.cascadeDelete(id);
    res.json({ message: 'Task and all subtasks deleted successfully' });
  } catch (error) {
    next(error);
  }
};


exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate('parentTask', 'title');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};