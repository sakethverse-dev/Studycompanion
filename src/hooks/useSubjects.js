import { useStudy } from '../context/StudyContext';

export function useSubjects() {
    const { subjects, addSubject, updateSubject, deleteSubject, topics, addTopic, updateTopic, deleteTopic } = useStudy();
    return { subjects, addSubject, updateSubject, deleteSubject, topics, addTopic, updateTopic, deleteTopic };
}
