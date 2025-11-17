import { useState, useEffect, useCallback, useRef } from 'react';

type Task = () => Promise<void>;

export const useTaskQueue = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use a ref to hold the tasks array to avoid stale closures in useEffect
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  useEffect(() => {
    if (isProcessing || tasksRef.current.length === 0) {
      return;
    }

    const processNextTask = async () => {
      setIsProcessing(true);
      
      // Dequeue the next task
      const nextTask = tasksRef.current[0];
      
      try {
        await nextTask();
      } catch (error) {
        console.error("Error processing task:", error);
      } finally {
        // Remove the completed task from the queue and allow the next one to start
        setTasks(prev => prev.slice(1));
        setIsProcessing(false);
      }
    };

    processNextTask();

  }, [tasks, isProcessing]);

  return { tasks, addTask, isProcessing };
};
