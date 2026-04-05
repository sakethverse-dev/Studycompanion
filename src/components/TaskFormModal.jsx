import Modal from './Modal';

export default function TaskFormModal({ 
    show, 
    onClose, 
    onSubmit, 
    editTask, 
    form, 
    subjects, 
    filteredTopics, 
    priorities, 
    statuses 
}) {
    return (
        <Modal 
            show={show} 
            onClose={onClose} 
            title={editTask ? 'Edit Task' : 'New Task'}
        >
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label>Title *</label>
                    <input 
                        className="input" 
                        placeholder="e.g. Solve 10 binary tree problems" 
                        {...form.register('title')} 
                    />
                    {form.formState.errors.title && (
                        <span className="form-error">{form.formState.errors.title.message}</span>
                    )}
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
                            {priorities.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select className="select" {...form.register('status')}>
                            {statuses.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label>Deadline</label>
                    <input type="date" className="input" {...form.register('deadline')} />
                </div>
                
                <div className="modal-footer" style={{ padding: 0, marginTop: 20 }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editTask ? 'Update' : 'Create Task'}</button>
                </div>
            </form>
        </Modal>
    );
}

