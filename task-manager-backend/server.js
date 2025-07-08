const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');
const archiveJob = require('./jobs/archiveJob');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//connect db
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

//routes
app.use('/api/tasks', taskRoutes);

//middleware
app.use(errorHandler);

//start cron job for automated archiving every 5 min using this doc https://www.npmjs.com/package/node-cron
cron.schedule('*/5 * * * *', () => {
  console.log('Running automated archiving job...');
  archiveJob.archiveCompletedTasks();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});