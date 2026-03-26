import { useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { isOverdue } from '../utils/helpers';

export function useProgress() {
    const { tasks, subjects, topics } = useStudy();

    return useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const pending = tasks.filter(t => t.status === 'Pending').length;
        const revision = tasks.filter(t => t.status === 'Revision').length;
        const overdue = tasks.filter(t => t.status !== 'Completed' && isOverdue(t.deadline)).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Per-subject stats
        const subjectStats = subjects.map(s => {
            const sTasks = tasks.filter(t => t.subject === s.id);
            const sDone = sTasks.filter(t => t.status === 'Completed').length;
            const sTotal = sTasks.length;
            const sPct = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;
            const sTopics = topics.filter(t => t.subjectId === s.id);
            const topicsDone = sTopics.filter(t => t.status === 'Completed').length;
            return { id: s.id, name: s.name, color: s.color, total: sTotal, completed: sDone, pct: sPct, topicsTotal: sTopics.length, topicsDone };
        });

        // Weekly data (last 7 days)
        const weekly = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const label = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = d.toISOString().split('T')[0];
            const count = tasks.filter(t => t.status === 'Completed' && t.deadline === dateStr).length;
            return { label, count };
        });

        return { total, completed, pending, revision, overdue, pct, subjectStats, weekly };
    }, [tasks, subjects, topics]);
}
