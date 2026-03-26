import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MdAdd, MdClose, MdSchedule } from 'react-icons/md';
import RevisionList from '../components/RevisionList';
import { useStudy } from '../context/StudyContext';
import { formatDate } from '../utils/helpers';
import { format } from 'date-fns';
import './Revision.css';

const revSchema = yup.object({
    topicId: yup.string().required('Select a topic'),
    revisionDate: yup.string().required('Select a date'),
});

export default function Revision() {
    const { revisions, addRevision, updateRevision, deleteRevision, topics, subjects } = useStudy();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);

    const form = useForm({ resolver: yupResolver(revSchema) });
    const watchTopic = form.watch('topicId');

    // Dates that have revisions
    const revisionDates = new Set(revisions.filter(r => !r.completed).map(r => r.revisionDate));

    const tileClassName = ({ date }) => {
        const s = format(date, 'yyyy-MM-dd');
        return revisionDates.has(s) ? 'has-revision' : null;
    };

    const dayRevisions = revisions.filter(r => {
        const s = format(selectedDate, 'yyyy-MM-dd');
        return r.revisionDate === s;
    });

    const upcoming = revisions.filter(r => !r.completed).sort((a, b) => a.revisionDate.localeCompare(b.revisionDate));

    const onSubmit = (data) => {
        const topic = topics.find(t => t.id === data.topicId);
        const subject = subjects.find(s => s.id === topic?.subjectId);
        addRevision({
            topicId: topic?.id,
            topicName: topic?.name || 'Unknown Topic',
            subjectId: subject?.id,
            revisionDate: data.revisionDate,
            completed: false,
        });
        toast.success('Revision scheduled!');
        setShowModal(false);
        form.reset();
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <h1>🗓️ Revision Planner</h1>
                <p>Schedule and track your revision sessions</p>
            </div>

            <div className="revision-layout">
                {/* Calendar */}
                <div className="card revision-calendar-section">
                    <div className="section-header">
                        <h3>Study Calendar</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => { form.reset({ revisionDate: format(selectedDate, 'yyyy-MM-dd') }); setShowModal(true); }}>
                            <MdAdd /> Schedule
                        </button>
                    </div>
                    <Calendar
                        value={selectedDate}
                        onChange={setSelectedDate}
                        tileClassName={tileClassName}
                    />
                    {/* Day revisions */}
                    {dayRevisions.length > 0 && (
                        <div className="day-revisions">
                            <p className="day-rev-label">Revisions on {formatDate(format(selectedDate, 'yyyy-MM-dd'))}</p>
                            {dayRevisions.map(r => (
                                <div key={r.id} className={`day-rev-item ${r.completed ? 'rev-done' : ''}`}>
                                    <MdSchedule className="rev-icon" />
                                    <span>{r.topicName}</span>
                                    {r.completed && <span className="badge badge-green">Done</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming revisions */}
                <div className="revision-upcoming">
                    <div className="card">
                        <h3 style={{ marginBottom: 16, fontSize: '.95rem', fontWeight: 700 }}>Upcoming Revisions</h3>
                        <RevisionList
                            revisions={upcoming}
                            subjects={subjects}
                            onComplete={id => { updateRevision(id, { completed: true }); toast.success('Marked complete!'); }}
                            onDelete={id => { deleteRevision(id); toast.info('Revision removed'); }}
                        />
                    </div>

                    {/* Stats */}
                    <div className="card revision-stats">
                        <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>Revision Stats</h3>
                        <div className="rev-stat-row">
                            <span className="rev-stat-label">Total Scheduled</span>
                            <span className="rev-stat-val">{revisions.length}</span>
                        </div>
                        <div className="rev-stat-row">
                            <span className="rev-stat-label">Completed</span>
                            <span className="rev-stat-val text-green">{revisions.filter(r => r.completed).length}</span>
                        </div>
                        <div className="rev-stat-row">
                            <span className="rev-stat-label">Pending</span>
                            <span className="rev-stat-val text-yellow">{revisions.filter(r => !r.completed).length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
                        <motion.div className="modal" initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Schedule Revision</h2>
                                <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><MdClose /></button>
                            </div>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="form-group" style={{ marginBottom: 14 }}>
                                    <label>Topic *</label>
                                    <select className="select" {...form.register('topicId')}>
                                        <option value="">Select topic</option>
                                        {topics.map(t => {
                                            const s = subjects.find(s => s.id === t.subjectId);
                                            return <option key={t.id} value={t.id}>{s ? `${s.name} → ` : ''}{t.name}</option>;
                                        })}
                                    </select>
                                    {form.formState.errors.topicId && <span className="form-error">{form.formState.errors.topicId.message}</span>}
                                </div>
                                <div className="form-group" style={{ marginBottom: 14 }}>
                                    <label>Revision Date *</label>
                                    <input type="date" className="input" {...form.register('revisionDate')} />
                                    {form.formState.errors.revisionDate && <span className="form-error">{form.formState.errors.revisionDate.message}</span>}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Schedule</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
