import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { MdAdd, MdClose, MdFilterList, MdSort } from 'react-icons/md';
import TaskCard from '../components/TaskCard';
import SearchBar from '../components/SearchBar';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import { useDebounce } from '../hooks/useDebounce';
import { isOverdue, sortTasks } from '../utils/helpers';
import './Tasks.css';

const TABS = ['All', 'Pending', 'Completed', 'Overdue', 'Revision'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES_TASK = ['Pending', 'In Progress', 'Completed', 'Revision'];

const taskSchema = yup.object({
    title: yup.string().required('Title is required'),
    subject: yup.string(),
    topic: yup.string(),
    deadline: yup.string(),
    priority: yup.string().required(),
    status: yup.string().required(),
});

export default function Tasks() {
    const { tasks, addTask, updateTask, deleteTask } = useTasks();
    const { subjects, topics } = useSubjects();
    const [activeTab, setActiveTab] = useState('All');
    const [query, setQuery] = useState('');
    const dq = useDebounce(query);
    const [filterSubj, setFilterSubj] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [sortBy, setSortBy] = useState('deadline');
    const [showModal, setShowModal] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const form = useForm({ resolver: yupResolver(taskSchema), defaultValues: { priority: 'Medium', status: 'Pending' } });
    const watchSubject = form.watch('subject');

    const filteredTopics = topics.filter(t => t.subjectId === watchSubject);

    const displayed = useMemo(() => {
        let list = [...tasks];
        // Tab filter
        if (activeTab === 'Pending') list = list.filter(t => t.status === 'Pending' || t.status === 'In Progress');
        if (activeTab === 'Completed') list = list.filter(t => t.status === 'Completed');
        if (activeTab === 'Overdue') list = list.filter(t => t.status !== 'Completed' && isOverdue(t.deadline));
        if (activeTab === 'Revision') list = list.filter(t => t.status === 'Revision');
        // Search
        if (dq) list = list.filter(t => t.title.toLowerCase().includes(dq.toLowerCase()));
        // Filters
        if (filterSubj) list = list.filter(t => t.subject === filterSubj);
        if (filterPriority) list = list.filter(t => t.priority === filterPriority);
        // Sort
        return sortTasks(list, sortBy);
    }, [tasks, activeTab, dq, filterSubj, filterPriority, sortBy]);

    const tabCount = (tab) => {
        if (tab === 'All') return tasks.length;
        if (tab === 'Pending') return tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
        if (tab === 'Completed') return tasks.filter(t => t.status === 'Completed').length;
        if (tab === 'Overdue') return tasks.filter(t => t.status !== 'Completed' && isOverdue(t.deadline)).length;
        if (tab === 'Revision') return tasks.filter(t => t.status === 'Revision').length;
    };

    const openAdd = () => { setEditTask(null); form.reset({ priority: 'Medium', status: 'Pending', subject: '', topic: '', title: '', deadline: '' }); setShowModal(true); };
    const openEdit = (t) => { setEditTask(t); form.reset(t); setShowModal(true); };

    const onSubmit = (data) => {
        if (editTask) { updateTask(editTask.id, data); toast.success('Task updated!'); }
        else { addTask(data); toast.success('Task created!'); }
        setShowModal(false);
    };

    const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || '';
    const getTopicName = (id) => topics.find(t => t.id === id)?.name || '';

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>📋 Tasks</h1>
                <p>Manage your study tasks and track completion</p>
            </div>

            {/* Tabs */}
            <div className="tasks-tabs-row">
                <div className="tabs" style={{ flexWrap: 'wrap' }}>
                    {TABS.map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab} <span className="tab-count">{tabCount(tab)}</span>
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd /> Add Task</button>
            </div>

            {/* Toolbar */}
            <div className="tasks-toolbar">
                <SearchBar value={query} onChange={setQuery} placeholder="Search tasks..." />
                <button className={`btn btn-secondary ${showFilters ? 'active-btn' : ''}`} onClick={() => setShowFilters(p => !p)}>
                    <MdFilterList /> Filters
                </button>
                <select className="select" style={{ maxWidth: 160 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="deadline">Sort: Due Date</option>
                    <option value="priority">Sort: Priority</option>
                    <option value="subject">Sort: Subject</option>
                </select>
            </div>

            {/* Filter panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div className="filter-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <select className="select" style={{ maxWidth: 200 }} value={filterSubj} onChange={e => setFilterSubj(e.target.value)}>
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select className="select" style={{ maxWidth: 180 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                            <option value="">All Priorities</option>
                            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                        </select>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setFilterSubj(''); setFilterPriority(''); }}>Clear</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task list */}
            {displayed.length === 0 ? (
                <div className="empty-state">
                    <h3>No tasks found</h3>
                    <p>Try adjusting your filters or add a new task</p>
                </div>
            ) : (
                <motion.div className="tasks-grid" layout>
                    <AnimatePresence mode="popLayout">
                        {displayed.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                subjectName={getSubjectName(task.subject)}
                                topicName={getTopicName(task.topic)}
                                onEdit={() => openEdit(task)}
                                onDelete={() => { deleteTask(task.id); toast.info('Task deleted'); }}
                                onStatusChange={status => updateTask(task.id, { status })}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
                        <motion.div className="modal" initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
                                <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
                            </div>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="form-group" style={{ marginBottom: 14 }}>
                                    <label>Title *</label>
                                    <input className="input" placeholder="e.g. Solve 10 binary tree problems" {...form.register('title')} />
                                    {form.formState.errors.title && <span className="form-error">{form.formState.errors.title.message}</span>}
                                </div>
                                <div className="grid-2" style={{ marginBottom: 14 }}>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <select className="select" {...form.register('subject')}>
                                            <option value="">None</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Topic</label>
                                        <select className="select" {...form.register('topic')}>
                                            <option value="">None</option>
                                            {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-2" style={{ marginBottom: 14 }}>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select className="select" {...form.register('priority')}>
                                            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select className="select" {...form.register('status')}>
                                            {STATUSES_TASK.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 14 }}>
                                    <label>Deadline</label>
                                    <input type="date" className="input" {...form.register('deadline')} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editTask ? 'Update' : 'Create Task'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
