import mongoose from 'mongoose';
import setupTestDB from '../../../utils/setupTestDB';
import paginate from '../../../../src/models/plugins/paginate.plugin';
import type { QueryResult } from '../../../../src/models/plugins/paginate.plugin';

const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.plugin(paginate);
const Project = mongoose.model('Project', projectSchema);

const taskSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Project',
    required: true,
  },
});

taskSchema.plugin(paginate);
const Task = mongoose.model('Task', taskSchema);

setupTestDB();

describe('paginate plugin', () => {
  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const taskPages = (await (Task as unknown as { paginate: (...args: unknown[]) => Promise<QueryResult> }).paginate(
        { _id: task._id },
        { populate: 'project' }
      )) as QueryResult;

      expect((taskPages.results[0] as unknown as { project: { _id: unknown } }).project).toHaveProperty('_id', project._id);
    });

    test('should populate nested fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const projectPages = (await (
        Project as unknown as { paginate: (...args: unknown[]) => Promise<QueryResult> }
      ).paginate({ _id: project._id }, { populate: 'tasks.project' })) as QueryResult;
      const { tasks } = projectPages.results[0] as unknown as {
        tasks: Array<{ _id: unknown; project: { _id: unknown } }>;
      };

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toHaveProperty('_id', task._id);
      expect(tasks[0].project).toHaveProperty('_id', project._id);
    });
  });
});
