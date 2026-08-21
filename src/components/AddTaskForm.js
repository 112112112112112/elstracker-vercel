import * as db from '@/services/db.js';
import { Button, Form } from "react-bootstrap";
import { useRef } from "react";

export default function AddTaskForm({
    newIcon, setNewIcon, newTitle, setNewTitle, newReset, setNewReset, newBound, setNewBound, handleAddTask
}) {
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewIcon(file.name);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <table className='text-center box'>
            <tbody>
                <tr>
                    <td className='text-center align-middle'>
                        <Form.Control
                            // autoFocus
                            type="text"
                            placeholder={'Icon filename'}
                            value={newIcon}
                            onChange={(e) => setNewIcon(e.target.value)}
                        />
                    </td>
                    <td className='text-center align-middle'>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{display: 'none'}}
                            accept="image/*"
                        />
                        <button
                            className="button-confirm"
                            size="sm"
                            onClick={handleButtonClick}
                        >
                            Select file
                        </button>
                    </td>
                    <td className='text-center align-middle'>
                        <div className='d-flex flex-column align-items-center'>
                            <Form.Control
                                // autoFocus
                                type="text"
                                placeholder={'Task title'}
                                minLength={1}
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                style={{ width: '24rem' }}
                            />
                        </div>
                    </td>
                    <td className='text-center align-middle'>
                        <div className='d-flex justify-content-center'>
                            <Form.Select
                                // autoFocus
                                value={newReset}
                                onChange={(e) => setNewReset(e.target.value)}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </Form.Select>
                        </div>
                    </td>
                    <td className='text-center align-middle'>
                        <div className='d-flex justify-content-center'>
                            <Form.Select
                                // autoFocus
                                value={newBound}
                                onChange={(e) => setNewBound(e.target.value)}
                            >
                                <option value="account">Account</option>
                                <option value="character">Character</option>
                            </Form.Select>
                        </div>
                    </td>
                    <td className='text-center align-middle'>
                        <button
                            className="button-confirm"
                            onClick={handleAddTask}
                        >
                            Add Task
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}