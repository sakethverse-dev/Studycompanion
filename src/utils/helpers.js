import { isPast, parseISO, format, addDays } from 'date-fns';

export function isOverdue(deadline) {
    if (!deadline) return false;
    try { return isPast(parseISO(deadline + 'T23:59:59')); }
    catch { return false; }
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    try { return format(parseISO(dateStr), 'MMM d, yyyy'); }
    catch { return dateStr; }
}

export function daysUntil(dateStr) {
    if (!dateStr) return null;
    try {
        const d = parseISO(dateStr);
        const now = new Date();
        const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        return diff;
    } catch { return null; }
}

export function getRevisionDate(completionDate, days = 3) {
    try { return format(addDays(parseISO(completionDate), days), 'yyyy-MM-dd'); }
    catch { return null; }
}

export function sortTasks(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
        if (sortBy === 'deadline') return (a.deadline || '').localeCompare(b.deadline || '');
        if (sortBy === 'priority') {
            const order = { High: 0, Medium: 1, Low: 2 };
            return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
        }
        if (sortBy === 'subject') return (a.subject || '').localeCompare(b.subject || '');
        return 0;
    });
}

export function priorityColor(priority) {
    return { High: 'red', Medium: 'yellow', Low: 'green' }[priority] || 'gray';
}

export function statusColor(status) {
    return {
        'Completed': 'green',
        'In Progress': 'cyan',
        'Pending': 'yellow',
        'Revision': 'indigo',
        'Needs Revision': 'orange',
        'Not Started': 'gray',
        'Overdue': 'red',
    }[status] || 'gray';
}

export function difficultyColor(d) {
    return { Easy: 'green', Medium: 'yellow', Hard: 'red' }[d] || 'gray';
}
