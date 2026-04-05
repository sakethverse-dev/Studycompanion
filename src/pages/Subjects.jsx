import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { MdAdd } from 'react-icons/md';

import SubjectCard from '../components/SubjectCard';
import TopicCard from '../components/TopicCard';
import SearchBar from '../components/SearchBar';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

import { useSubjects } from '../hooks/useSubjects';
import { useDebounce } from '../hooks/useDebounce';
import './Subjects.css';

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#fb923c', '#a78bfa', '#ec4899'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['Not Started', 'In Progress', 'Completed', 'Needs Revision'];

const subjectSchema = yup.object({ 
    name: yup.string().required('Name is required'), 
    description: yup.string(), 
    color: yup.string() 
});

const topicSchema = yup.object({
    name: yup.string().required('Topic name is required'),
    difficulty: yup.string().required(),
    status: yup.string().required(),
    notes: yup.string(),
});

export default function Subjects() {
    const { subjects, addSubject, updateSubject, deleteSubject, topics, addTopic, updateTopic, deleteTopic } = useSubjects();
    const [query, setQuery] = useState('');
    const dq = useDebounce(query);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [editSubject, setEditSubject] = useState(null);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [editTopic, setEditTopic] = useState(null);
    const [activeSub, setActiveSub] = useState(null);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const sForm = useForm({ resolver: yupResolver(subjectSchema) });
    const tForm = useForm({ resolver: yupResolver(topicSchema), defaultValues: { difficulty: 'Medium', status: 'Not Started' } });

    const filtered = subjects.filter(s => s.name.toLowerCase().includes(dq.toLowerCase()));

    // Subject modal
    const openAddSubject = () => { 
        setEditSubject(null); 
        setSelectedColor(COLORS[0]); 
        sForm.reset({ name: '', description: '', color: COLORS[0] }); 
        setShowSubjectModal(true); 
    };

    const openEditSubject = (s) => { 
        setEditSubject(s); 
        setSelectedColor(s.color); 
        sForm.reset({ name: s.name, description: s.description, color: s.color }); 
        setShowSubjectModal(true); 
    };

    const onSubjectSubmit = (data) => {
        const payload = { ...data, color: selectedColor };
        if (editSubject) { 
            updateSubject(editSubject.id, payload); 
            toast.success('Subject updated!'); 
        } else { 
            addSubject(payload); 
            toast.success('Subject added!'); 
        }
        setShowSubjectModal(false);
    };

    // Topic modal
    const openAddTopic = (subjectId) => { 
        setEditTopic(null); 
        tForm.reset({ name: '', difficulty: 'Medium', status: 'Not Started', notes: '', subjectId }); 
        setShowTopicModal(true); 
    };

    const openEditTopic = (t) => { 
        setEditTopic(t); 
        tForm.reset(t); 
        setShowTopicModal(true); 
    };

    const onTopicSubmit = (data) => {
        if (editTopic) { 
            updateTopic(editTopic.id, data); 
            toast.success('Topic updated!'); 
        } else { 
            addTopic(data); 
            toast.success('Topic added!'); 
        }
        setShowTopicModal(false);
    };

    return (
        <div className="page-wrapper">
            <PageHeader 
                title="Subjects" 
                subtitle="Organize your subjects and manage topics"
                icon="📚"
                actions={<button className="btn btn-primary" onClick={openAddSubject}><MdAdd /> Add Subject</button>}
            />

            <div className="subjects-toolbar">
                <SearchBar value={query} onChange={setQuery} placeholder="Search subjects..." />
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <h3>No subjects yet</h3>
                    <p>Click "Add Subject" to create your first subject</p>
                </div>
            ) : (
                <div className="subjects-grid">
                    {filtered.map(s => {
                        const subTopics = topics.filter(t => t.subjectId === s.id);
                        const isOpen = activeSub === s.id;
                        return (
                            <motion.div key={s.id} layout className="subject-section">
                                <SubjectCard
                                    subject={s}
                                    topicCount={subTopics.length}
                                    onEdit={() => openEditSubject(s)}
                                    onDelete={() => { if (confirm(`Delete "${s.name}" and all its topics?`)) { deleteSubject(s.id); toast.info('Subject deleted'); } }}
                                    onClick={() => setActiveSub(isOpen ? null : s.id)}
                                />

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            className="topics-panel"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <div className="topics-header">
                                                <span className="topics-label">Topics ({subTopics.length})</span>
                                                <button className="btn btn-sm btn-secondary" onClick={() => openAddTopic(s.id)}><MdAdd /> Add Topic</button>
                                            </div>
                                            {subTopics.length === 0 ? (
                                                <p className="no-topics">No topics yet. Add your first topic.</p>
                                            ) : (
                                                <div className="topics-grid">
                                                    {subTopics.map(t => (
                                                        <TopicCard
                                                            key={t.id}
                                                            topic={t}
                                                            onEdit={() => openEditTopic(t)}
                                                            onDelete={() => { deleteTopic(t.id); toast.info('Topic deleted'); }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Subject Modal */}
            <Modal 
                show={showSubjectModal} 
                onClose={() => setShowSubjectModal(false)} 
                title={editSubject ? 'Edit Subject' : 'New Subject'}
            >
                <form onSubmit={sForm.handleSubmit(onSubjectSubmit)}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label>Subject Name *</label>
                        <input className="input" placeholder="e.g. Data Structures" {...sForm.register('name')} />
                        {sForm.formState.errors.name && <span className="form-error">{sForm.formState.errors.name.message}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label>Description</label>
                        <textarea className="textarea" placeholder="Brief description..." {...sForm.register('description')} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label>Color Label</label>
                        <div className="color-picker">
                            {COLORS.map(c => (
                                <button type="button" key={c} className={`color-swatch ${selectedColor === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setSelectedColor(c)} />
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{editSubject ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>

            {/* Topic Modal */}
            <Modal 
                show={showTopicModal} 
                onClose={() => setShowTopicModal(false)} 
                title={editTopic ? 'Edit Topic' : 'New Topic'}
            >
                <form onSubmit={tForm.handleSubmit(onTopicSubmit)}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label>Topic Name *</label>
                        <input className="input" placeholder="e.g. Binary Trees" {...tForm.register('name')} />
                        {tForm.formState.errors.name && <span className="form-error">{tForm.formState.errors.name.message}</span>}
                    </div>
                    <div className="grid-2" style={{ marginBottom: 16 }}>
                        <div className="form-group">
                            <label>Difficulty</label>
                            <select className="select" {...tForm.register('difficulty')}>
                                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select className="select" {...tForm.register('status')}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label>Notes</label>
                        <textarea className="textarea" placeholder="Study notes..." {...tForm.register('notes')} />
                    </div>
                    <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowTopicModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{editTopic ? 'Update' : 'Add Topic'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

