import * as db from '@/services/db.js';
import { Button, Dropdown, Form } from "react-bootstrap";
import ThemePicker from "./ThemePicker";
import { useEffect, useState } from "react";
import { Check, X, Floppy, Trash, Gear } from "react-bootstrap-icons";

export default function Settings({ tasks, checklist, characters, toggleTaskEnabled, handleDeleteTask, viewMode, setViewMode, theme, setTheme, validateName,
    handleEditCharacter, classes, handleDeleteCharacter, setCharacters }) {
    const accTasks = tasks.filter(t => t.bound === 'account');
    const charTasks = tasks.filter(t => t.bound === 'character' && t.title !== 'Challenge Mode');

    return (
        <details className="mt-4">
            <summary className="h2" style={{ cursor: 'pointer' }}>
                <Gear /> Settings
            </summary>

            <details className="p-3 rounded mt-2">
                <summary className="h4" style={{ cursor: 'pointer' }}>
                    Edit character
                </summary>
                <table className='text-center box'>
                    <thead>
                        <tr>
                            <th>Character</th>
                            <th>Class</th>
                            <th>Color</th>
                            <th colSpan={2}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {characters.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <Form.Control
                                        type="text"
                                        value={c.name}
                                        onChange={(e) => {
                                            const updated = characters.map(char =>
                                                char.id === c.id ? { ...char, name: e.target.value } : char
                                            );
                                            setCharacters(updated);
                                        }}
                                    />
                                </td>
                                <td>
                                    <Dropdown drop='up'>
                                        <Dropdown.Toggle variant='outline-secondary' size='sm' className="form-dropdown">
                                            <img src={`/img/classes/${c.class}.png`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu renderOnMount popperConfig={{ strategy: 'fixed' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
                                                {classes.map(img => {
                                                    const className = img.replace(/^\d+[-_]/, '');
                                                    const defaultColors = [
                                                        '#DB2F2F', '#9400D3', '#41D941', '#333333', '#FF93AE',
                                                        '#99CCFF', '#EF8D2D', '#9B111E', '#9F81F7', '#1953B4',
                                                        '#E9C92C', '#19D2A8', '#DB4183', '#414482', '#3AA370'
                                                    ];
                                                    return (
                                                        <Dropdown.Item
                                                            key={img}
                                                            onClick={() => {
                                                                const index = classes.indexOf(img);
                                                                const groupIndex = Math.floor(index / 4) % defaultColors.length;
                                                                const updated = characters.map(char =>
                                                                    char.id === c.id ? { 
                                                                        ...char, 
                                                                        class: img,
                                                                        color: defaultColors[groupIndex] 
                                                                    } : char
                                                                );
                                                                setCharacters(updated);
                                                            }}
                                                        >
                                                            <img src={`/img/classes/${img}.png`} alt={className} style={{ width: '63px', height: '63px', objectFit: 'contain' }} />
                                                        </Dropdown.Item>
                                                    );
                                                })}
                                            </div>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                                <td>
                                    <Form.Control
                                        type="color"
                                        value={c.color}
                                        onChange={(e) => {
                                            const updated = characters.map(char =>
                                                char.id === c.id ? { ...char, color: e.target.value } : char
                                            );
                                            setCharacters(updated);
                                        }}
                                    />
                                </td>
                                <td className="d-flex justify-content-evenly">
                                    <Button variant='outline-light' size='sm' onClick={() => {
                                        handleEditCharacter(c.id, c.name, c.class, c.color);
                                    }}>
                                        <Floppy />
                                    </Button>
                                    <Button variant='outline-light' size='sm' onClick={() => {
                                        handleDeleteCharacter(c.id);
                                    }}>
                                        <Trash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>

            <details className="p-3 rounded mt-2">
                <summary className="h4" style={{ cursor: 'pointer' }}>
                Delete tasks
                </summary>
                <span>Only tasks created by you can be deleted.</span>
                    <table className='text-center box mt-3'>
                        <thead>
                            <tr>
                                <th colSpan={2}>Task</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.filter(task => !task.system).map(task => {
                                return (
                                    <tr key={task.id}>
                                        <td>
                                            {task.icon && (
                                                <img src={`/img/tasks/${task.icon}`} style={{ maxWidth: '80px', maxHeight: '80px'}} />
                                            )}
                                        </td>
                                        <td>
                                            {task.title}
                                        </td>
                                        <td>
                                            <Button
                                                variant='outline-danger'
                                                size='sm'
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
            </details>

            <details className="p-3 rounded mt-2">
                <summary className="h4" style={{ cursor: 'pointer' }}>
                Account settings
                </summary>
                <div className="p-3 rounded mt-2">
                    <table className='text-center box'>
                        <thead>
                            <tr>
                                <th colSpan={2}>Task</th>
                                <th>Enabled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accTasks.map(task => {
                                const row = checklist.find(cl => cl.character_id === 0 && cl.task_id === task.id) || {enabled: 1};
                                return (
                                    <tr key={task.id}>
                                        <td>
                                            {task.icon && (
                                                <img src={`/img/tasks/${task.icon}`} style={{ maxWidth: '80px', maxHeight: '80px'}} />
                                            )}
                                        </td>
                                        <td>
                                            {task.title}
                                        </td>
                                        <td
                                            onClick={(e) => {
                                                toggleTaskEnabled(0, task.id, row.enabled);
                                            }}
                                            role='button'
                                        >
                                            {row.enabled ? <Check /> : <X />}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </details>
            <details className="p-3 rounded mt-2">
                <summary className="h4" style={{ cursor: 'pointer' }}>
                Character settings
                </summary>
                <div className="p-3 rounded mt-2 scroll-wrapper">
                    <table className='text-center box'>
                        <thead>
                            <tr>
                                <th colSpan={2}>Character</th>
                                {charTasks.map(task => (
                                    <th key={task.id}>
                                        {task.icon && (
                                                <img src={`/img/tasks/${task.icon}`} style={{ maxWidth: '80px', maxHeight: '80px'}} />
                                            )}
                                        {task.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {characters.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <img src={`/img/classes/${c.class}.png`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                    </td>
                                    <td>
                                        {c.name}
                                    </td>
                                    {charTasks.map(task => {
                                        const row = checklist.find(cl => cl.character_id === c.id && cl.task_id === task.id) || {enabled: 1};
                                        return (
                                            <td key={task.id}>
                                                <span onClick={() => toggleTaskEnabled(c.id, task.id, row.enabled)} role='button'>
                                                    {row.enabled ? <Check /> : <X />}
                                                </span>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
             <details className="p-3 rounded mt-2">
                <summary className="h4" style={{ cursor: 'pointer' }}>
                App Appearance
                </summary>
                <div className="p-3 rounded mt-2">
                    <ThemePicker theme={theme} setTheme={setTheme} />
                </div>
                <div className="p-3 rounded mt-2">
                    <h4>View Mode</h4>
                    <Form.Select
                        className="form-select"
                        size="sm"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        style={{width: 'auto'}}
                    >
                        <option value="both">Show Icons & Titles</option>
                        <option value="titles">Show Titles Only</option>
                        <option value="icons">Show Icons Only</option>
                    </Form.Select>
                </div>
            </details>
        </details>
    )
}