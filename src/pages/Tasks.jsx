import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { MdAdd } from 'react-icons/md';

import TaskCard from '../components/TaskCard';
import PageHeader from '../components/PageHeader';
import TaskTabs from '../components/TaskTabs';
import TaskToolbar from '../components/TaskToolbar';
import TaskFilters from '../components/TaskFilters';
import TaskFormModal from '../components/TaskFormModal';

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

    const openAdd = () => { 
        setEditTask(null); 
        form.reset({ priority: 'Medium', status: 'Pending', subject: '', topic: '', title: '', deadline: '' }); 
        setShowModal(true); 
    };

    const openEdit = (t) => { 
        setEditTask(t); 
        form.reset(t); 
        setShowModal(true); 
    };

    const onSubmit = (data) => {
        if (editTask) { 
            updateTask(editTask.id, data); 
            toast.success('Task updated!'); 
        } else { 
            addTask(data); 
            toast.success('Task created!'); 
        }
        setShowModal(false);
    };

    const getSubjectName = (id) => subjects.find(s => s.id === id)?.name || '';
    const getTopicName = (id) => topics.find(t => t.id === id)?.name || '';

    return (
        <div className="page-wrapper">
            <PageHeader 
                title="Tasks" 
                subtitle="Manage your study tasks and track completion"
                icon="📋"
                actions={<button className="btn btn-primary" onClick={openAdd}><MdAdd /> Add Task</button>}
            />

            <div className="tasks-tabs-row">
                <TaskTabs 
                    tabs={TABS} 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                    getCount={tabCount} 
                />
            </div>

            <TaskToolbar 
                query={query} 
                onQueryChange={setQuery} 
                showFilters={showFilters} 
                onToggleFilters={() => setShowFilters(p => !p)} 
                sortBy={sortBy} 
                onSortChange={setSortBy} 
            />

            <AnimatePresence>
                {showFilters && (
                    <TaskFilters 
                        subjects={subjects} 
                        filterSubj={filterSubj} 
                        setFilterSubj={setFilterSubj} 
                        filterPriority={filterPriority} 
                        setFilterPriority={setFilterPriority} 
                        priorities={PRIORITIES} 
                        onClear={() => { setFilterSubj(''); setFilterPriority(''); }} 
                    />
                )}
            </AnimatePresence>

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

            <TaskFormModal 
                show={showModal} 
                onClose={() => setShowModal(false)} 
                onSubmit={onSubmit} 
                editTask={editTask} 
                form={form} 
                subjects={subjects} 
                filteredTopics={filteredTopics} 
                priorities={PRIORITIES} 
                statuses={STATUSES_TASK} 
            />
        </div>
    );
}

