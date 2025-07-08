import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

function ToDoList() {
    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    });
    const [newTask, setNewTask] = useState("");
    const prevTasksRef = useRef(tasks);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Confetti easter egg for 'Make Raul proud'
    useEffect(() => {
        const prevTasks = prevTasksRef.current;
        const prevRaul = prevTasks.find(
            t => t.text.trim().toLowerCase() === 'make raul proud'
        );
        const currRaul = tasks.find(
            t => t.text.trim().toLowerCase() === 'make raul proud'
        );
        if (currRaul && currRaul.completed && (!prevRaul || !prevRaul.completed)) {
            // LOTS of confetti, multiple bursts
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    confetti({
                        particleCount: 250,
                        spread: 120,
                        startVelocity: 60,
                        origin: { y: 0.6 },
                        zIndex: 9999
                    });
                }, i * 200);
            }
        }
        prevTasksRef.current = tasks;
    }, [tasks]);

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    function addTask() {
        if(newTask.trim() !== ""){
            setTasks(t => [...t, { text: newTask, completed: false }]);
            setNewTask("");
        }
    }

    function deleteTask(index){
        const updatedTasks = tasks.filter((_ , i) => i !== index);
        setTasks(updatedTasks);
    }

    function moveTaskUp(index){
        if (index > 0){
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index - 1]] = [updatedTasks[index - 1], updatedTasks[index]];
            setTasks(updatedTasks);
        }
    }

    function moveTaskDown(index){
        if (index < tasks.length - 1){
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
            setTasks(updatedTasks);
        }   
    }

    function toggleCompleted(index) {
        setTasks(tasks => tasks.map((task, i) =>
            i === index ? { ...task, completed: !task.completed } : task
        ));
    }

    return (
        <div className="to-do-list">
            <h1>To-Do-List</h1>

            <div className="input-row">
                <input 
                    type="text" 
                    placeholder="Enter a task" 
                    value={newTask}
                    onChange={handleInputChange}
                    onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
                />
                <button 
                    className="add-button" 
                    onClick={addTask}>Add</button>
            </div>

            <ol>
                {tasks.map((task, index) => (
                    <li key={index}>
                        <span 
                            className={`text${task.completed ? ' completed' : ''}`}
                            onClick={() => toggleCompleted(index)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                            {task.text}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                            <button className="delete-button" onClick={() => deleteTask(index)} title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                            <button className="up-button" onClick={() => moveTaskUp(index)}>Up</button>
                            <button className="down-button" onClick={() => moveTaskDown(index)}>Down</button>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    )
}
export default ToDoList;