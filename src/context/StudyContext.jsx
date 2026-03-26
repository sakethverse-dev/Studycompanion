import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const StudyContext = createContext(null);

const STORAGE_KEYS = {
  subjects: 'study_subjects',
  topics: 'study_topics',
  tasks: 'study_tasks',
  revisions: 'study_revisions',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Seed data ────────────────────────────────────────────────────────────────
const SEED_SUBJECTS = [
  { id: 's1', name: 'Data Structures', description: 'Arrays, linked lists, trees, graphs', color: '#6366f1' },
  { id: 's2', name: 'Algorithms', description: 'Sorting, searching, dynamic programming', color: '#22d3ee' },
  { id: 's3', name: 'Mathematics', description: 'Calculus, linear algebra, probability', color: '#34d399' },
];

const SEED_TOPICS = [
  { id: 't1', subjectId: 's1', name: 'Binary Trees', difficulty: 'Medium', status: 'In Progress', notes: 'Cover traversal types: inorder, preorder, postorder.' },
  { id: 't2', subjectId: 's1', name: 'Graph Algorithms', difficulty: 'Hard', status: 'Not Started', notes: '' },
  { id: 't3', subjectId: 's2', name: 'Dynamic Programming', difficulty: 'Hard', status: 'Needs Revision', notes: 'Focus on memoization vs tabulation.' },
  { id: 't4', subjectId: 's2', name: 'Sorting Algorithms', difficulty: 'Easy', status: 'Completed', notes: 'Merge sort and quicksort are critical.' },
  { id: 't5', subjectId: 's3', name: 'Linear Algebra', difficulty: 'Medium', status: 'In Progress', notes: 'Eigenvalues and eigenvectors.' },
];

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const SEED_TASKS = [
  { id: 'tk1', title: 'Solve 10 binary tree problems', subject: 's1', topic: 't1', deadline: fmt(addDays(today, 2)), priority: 'High', status: 'Pending' },
  { id: 'tk2', title: 'Revise Graph algorithms', subject: 's1', topic: 't2', deadline: fmt(addDays(today, 5)), priority: 'Medium', status: 'Pending' },
  { id: 'tk3', title: 'Complete DP sheet', subject: 's2', topic: 't3', deadline: fmt(addDays(today, -1)), priority: 'High', status: 'Pending' },
  { id: 'tk4', title: 'Review sorting quiz', subject: 's2', topic: 't4', deadline: fmt(addDays(today, -3)), priority: 'Low', status: 'Completed' },
  { id: 'tk5', title: 'Read linear algebra chapter 3', subject: 's3', topic: 't5', deadline: fmt(addDays(today, 7)), priority: 'Medium', status: 'Revision' },
];

const SEED_REVISIONS = [
  { id: 'r1', topicId: 't1', topicName: 'Binary Trees', subjectId: 's1', revisionDate: fmt(addDays(today, 3)), completed: false },
  { id: 'r2', topicId: 't3', topicName: 'Dynamic Programming', subjectId: 's2', revisionDate: fmt(addDays(today, 1)), completed: false },
];

// ─────────────────────────────────────────────────────────────────────────────

export function StudyProvider({ children }) {
  const [subjects, setSubjectsState]   = useState(() => load(STORAGE_KEYS.subjects,  SEED_SUBJECTS));
  const [topics,   setTopicsState]     = useState(() => load(STORAGE_KEYS.topics,    SEED_TOPICS));
  const [tasks,    setTasksState]      = useState(() => load(STORAGE_KEYS.tasks,     SEED_TASKS));
  const [revisions,setRevisionsState]  = useState(() => load(STORAGE_KEYS.revisions, SEED_REVISIONS));

  // Sync to localStorage
  useEffect(() => { save(STORAGE_KEYS.subjects,  subjects);  }, [subjects]);
  useEffect(() => { save(STORAGE_KEYS.topics,     topics);    }, [topics]);
  useEffect(() => { save(STORAGE_KEYS.tasks,      tasks);     }, [tasks]);
  useEffect(() => { save(STORAGE_KEYS.revisions,  revisions); }, [revisions]);

  // Subjects
  const addSubject    = useCallback((s) => setSubjectsState(p => [...p, { ...s, id: uuidv4() }]), []);
  const updateSubject = useCallback((id, s) => setSubjectsState(p => p.map(x => x.id === id ? { ...x, ...s } : x)), []);
  const deleteSubject = useCallback((id) => {
    setSubjectsState(p => p.filter(x => x.id !== id));
    setTopicsState(p => p.filter(x => x.subjectId !== id));
  }, []);

  // Topics
  const addTopic = useCallback((t) => setTopicsState(p => [...p, { ...t, id: uuidv4() }]), []);
  const updateTopic = useCallback((id, t) => setTopicsState(p => p.map(x => x.id === id ? { ...x, ...t } : x)), []);
  const deleteTopic = useCallback((id) => setTopicsState(p => p.filter(x => x.id !== id)), []);

  // Tasks
  const addTask    = useCallback((t) => setTasksState(p => [...p, { ...t, id: uuidv4() }]), []);
  const updateTask = useCallback((id, t) => setTasksState(p => p.map(x => x.id === id ? { ...x, ...t } : x)), []);
  const deleteTask = useCallback((id) => setTasksState(p => p.filter(x => x.id !== id)), []);

  // Revisions
  const addRevision    = useCallback((r) => setRevisionsState(p => [...p, { ...r, id: uuidv4() }]), []);
  const updateRevision = useCallback((id, r) => setRevisionsState(p => p.map(x => x.id === id ? { ...x, ...r } : x)), []);
  const deleteRevision = useCallback((id) => setRevisionsState(p => p.filter(x => x.id !== id)), []);

  const value = {
    subjects, addSubject, updateSubject, deleteSubject,
    topics,   addTopic,   updateTopic,   deleteTopic,
    tasks,    addTask,    updateTask,    deleteTask,
    revisions,addRevision,updateRevision,deleteRevision,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}
