import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function ToDoList() {
    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    });
    const [newTask, setNewTask] = useState("");
    const prevTasksRef = useRef(tasks);
    const [activeTab, setActiveTab] = useState('todo'); // 'todo' or 'completed'

    // Add a function to change priority
    function changePriority(index, newPriority) {
        const updated = tasks.map((task, i) =>
            i === index ? { ...task, priority: newPriority } : task
        );
        setTasks(sortTasksByPriority(updated));
    }

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Removed confetti easter egg effect

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    // Helper to sort tasks by priority
    function sortTasksByPriority(tasks) {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return [...tasks].sort((a, b) => {
            const pa = priorityOrder[a.priority || 'Low'];
            const pb = priorityOrder[b.priority || 'Low'];
            return pa - pb;
        });
    }

    // Split tasks into to-do and completed
    const todoTasks = sortTasksByPriority(tasks.filter(t => !t.completed));
    const completedTasks = tasks.filter(t => t.completed);

    function onDragEnd(result) {
        if (!result.destination) return;
        // Only allow drag within the same list
        const sourceList = result.source.droppableId;
        const destList = result.destination.droppableId;
        if (sourceList !== destList) return;
        let updated;
        if (sourceList === 'todo-tasks') {
            const reordered = Array.from(todoTasks);
            const [removed] = reordered.splice(result.source.index, 1);
            reordered.splice(result.destination.index, 0, removed);
            // Merge with completed tasks
            updated = [...reordered, ...completedTasks];
        } else {
            const reordered = Array.from(completedTasks);
            const [removed] = reordered.splice(result.source.index, 1);
            reordered.splice(result.destination.index, 0, removed);
            // Merge with todo tasks
            updated = [...todoTasks, ...reordered];
        }
        setTasks(updated);
    }

    function addTask() {
        if(newTask.trim() !== ""){
            // Add new task at the top
            const updated = [{ text: newTask, completed: false, priority: 'Low' }, ...tasks];
            setTasks(sortTasksByPriority(updated));
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

    // Update toggleCompleted to move tasks between lists
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
            {/* Toggle buttons for To-Do and Completed */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', margin: '32px 0 24px 0' }}>
                <button
                    onClick={() => setActiveTab('todo')}
                    style={{
                        background: activeTab === 'todo' ? '#8276ea' : '#f0f0f7',
                        color: activeTab === 'todo' ? '#fff' : '#333',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 48px',
                        fontWeight: 700,
                        fontSize: '1.3rem',
                        boxShadow: '0 2px 8px rgba(130,118,234,0.08)',
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s'
                    }}
                >To-Do</button>
                <button
                    onClick={() => setActiveTab('completed')}
                    style={{
                        background: activeTab === 'completed' ? '#8276ea' : '#f0f0f7',
                        color: activeTab === 'completed' ? '#fff' : '#333',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 48px',
                        fontWeight: 700,
                        fontSize: '1.3rem',
                        boxShadow: '0 2px 8px rgba(130,118,234,0.08)',
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s'
                    }}
                >Completed</button>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {activeTab === 'todo' && (
                        <Droppable droppableId="todo-tasks">
                            {(provided) => (
                                <ol
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{ flex: 1, minWidth: '900px', maxWidth: '900px', background: 'none', padding: 0 }}
                                >
                                    {todoTasks.map((task, index) => (
                                        <Draggable key={index} draggableId={`todo-${index}`} index={index}>
                                            {(provided, snapshot) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        background: snapshot.isDragging ? '#e3e3ff' : '#f7f7fa',
                                                        border: snapshot.isDragging ? '2px solid #8276ea' : '2px solid #e0e0e0',
                                                        ...((provided.draggableProps && provided.draggableProps.style) || {})
                                                    }}
                                                >
                                                    <span 
                                                        className={`text${task.completed ? ' completed' : ''}`}
                                                        onClick={() => toggleCompleted(tasks.indexOf(task))}
                                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                                    >
                                                        {task.text}
                                                    </span>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', marginLeft: '16px' }}>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <button className="delete-button" onClick={() => deleteTask(tasks.indexOf(task))} title="Delete">
                                                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                            </button>
                                                            {/* Three priority buttons */}
                                                            <button
                                                                style={{
                                                                    background: 'green', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontWeight: 600, opacity: task.priority === 'Low' ? 1 : 0.5
                                                                }}
                                                                onClick={() => changePriority(tasks.indexOf(task), 'Low')}
                                                            >Low</button>
                                                            <button
                                                                style={{
                                                                    background: 'gold', color: '#333', border: 'none', borderRadius: '4px', padding: '4px 12px', fontWeight: 600, opacity: task.priority === 'Medium' ? 1 : 0.5
                                                                }}
                                                                onClick={() => changePriority(tasks.indexOf(task), 'Medium')}
                                                            >Medium</button>
                                                            <button
                                                                style={{
                                                                    background: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontWeight: 600, opacity: task.priority === 'High' ? 1 : 0.5
                                                                }}
                                                                onClick={() => changePriority(tasks.indexOf(task), 'High')}
                                                            >High</button>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ol>
                            )}
                        </Droppable>
                    )}
                    {activeTab === 'completed' && (
                        <Droppable droppableId="completed-tasks">
                            {(provided) => (
                                <ol
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{ flex: 1, minWidth: '900px', maxWidth: '900px', background: 'none', padding: 0 }}
                                >
                                    {completedTasks.map((task, index) => (
                                        <Draggable key={index} draggableId={`completed-${index}`} index={index}>
                                            {(provided, snapshot) => (
                                                <li
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        background: snapshot.isDragging ? '#e3e3ff' : '#f7f7fa',
                                                        border: snapshot.isDragging ? '2px solid #8276ea' : '2px solid #e0e0e0',
                                                        ...((provided.draggableProps && provided.draggableProps.style) || {})
                                                    }}
                                                >
                                                    <span
                                                        className={`text completed`}
                                                        onClick={() => toggleCompleted(tasks.indexOf(task))}
                                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                                    >
                                                        {task.text}
                                                    </span>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', marginLeft: '32px' }}>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <button className="delete-button" onClick={() => deleteTask(tasks.indexOf(task))} title="Delete">
                                                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                            </button>
                                                            {/* Single priority badge */}
                                                            <span style={{
                                                                background: task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'gold' : 'green',
                                                                color: task.priority === 'Medium' ? '#333' : 'white',
                                                                borderRadius: '4px',
                                                                padding: 0,
                                                                fontWeight: 600,
                                                                fontSize: '18px',
                                                                minWidth: '84px',
                                                                maxWidth: '84px',
                                                                height: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: 'none',
                                                                boxSizing: 'border-box',
                                                                overflow: 'hidden',
                                                            }}>{task.priority || 'Low'}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ol>
                            )}
                        </Droppable>
                    )}
                </div>
            </DragDropContext>
        </div>
    )
}
export default ToDoList;