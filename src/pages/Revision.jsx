import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MdAdd, MdSchedule } from 'react-icons/md';

import RevisionList from '../components/RevisionList';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

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
            <PageHeader 
                title="Revision Planner" 
                subtitle="Schedule and track your revision sessions"
                icon="🗓️"
            />

            <div className="revision-layout">
                {/* Calendar Section */}
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
                    
                    {dayRevisions.length > 0 && (
                        <DayRevisionList revisions={dayRevisions} date={selectedDate} />
                    )}
                </div>

                {/* Upcoming & Stats Section */}
                <div className="revision-upcoming">
                    <div className="card">
                        <h3 className="section-title">Upcoming Revisions</h3>
                        <RevisionList
                            revisions={upcoming}
                            subjects={subjects}
                            onComplete={id => { updateRevision(id, { completed: true }); toast.success('Marked complete!'); }}
                            onDelete={id => { deleteRevision(id); toast.info('Revision removed'); }}
                        />
                    </div>

                    <RevisionStats revisions={revisions} />
                </div>
            </div>

            {/* Schedule Modal */}
            <Modal 
                show={showModal} 
                onClose={() => setShowModal(false)} 
                title="Schedule Revision"
            >
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label>Topic *</label>
                        <select className="select" {...form.register('topicId')}>
                            <option value="">Select topic</option>
                            {topics.map(t => {
                                const s = subjects.find(sub => sub.id === t.subjectId);
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
                    <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Schedule</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function DayRevisionList({ revisions, date }) {
    return (
        <div className="day-revisions">
            <p className="day-rev-label">Revisions on {formatDate(format(date, 'yyyy-MM-dd'))}</p>
            {revisions.map(r => (
                <div key={r.id} className={`day-rev-item ${r.completed ? 'rev-done' : ''}`}>
                    <MdSchedule className="rev-icon" />
                    <span>{r.topicName}</span>
                    {r.completed && <span className="badge badge-green">Done</span>}
                </div>
            ))}
        </div>
    );
}

function RevisionStats({ revisions }) {
    const total = revisions.length;
    const completed = revisions.filter(r => r.completed).length;
    const pending = total - completed;

    return (
        <div className="card revision-stats">
            <h3 className="section-title">Revision Stats</h3>
            <div className="rev-stat-row">
                <span className="rev-stat-label">Total Scheduled</span>
                <span className="rev-stat-val">{total}</span>
            </div>
            <div className="rev-stat-row">
                <span className="rev-stat-label">Completed</span>
                <span className="rev-stat-val text-green">{completed}</span>
            </div>
            <div className="rev-stat-row">
                <span className="rev-stat-label">Pending</span>
                <span className="rev-stat-val text-yellow">{pending}</span>
            </div>
        </div>
    );
}

