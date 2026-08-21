import * as db from '@/services/db.js';

import { Col, Row } from "react-bootstrap";
import Notepad from "./Notepad";
import { Check, X } from "react-bootstrap-icons";

export default function AccountTracker({ tasks, checklist, toggleTask, theme }) {
    const accTasks = tasks.filter(t => t.bound === 'account');

    const dailyTasks = accTasks.filter(t => t.reset === 'daily');
    const weeklyTasks = accTasks.filter(t => t.reset === 'weekly');

    const enabledDailies = dailyTasks.filter(task => {
        const row = checklist.find(cl => cl.character_id === 0 && cl.task_id === task.id);
        return row?.enabled !== 0;
    });
    
    const enabledWeeklies = weeklyTasks.filter(task => {
        const row = checklist.find(cl => cl.character_id === 0 && cl.task_id === task.id);
        return row?.enabled !== 0;
    });

    return (
        <>
        <Row className="my-5">
            <Col className="col-notepad">
                <Notepad />
            </Col>
        </Row>
        <Row className='my-5'>
            <Col>
                <div className="text-center my-3">
                    <img 
                        src={`/img/chibi/${theme}-chibi.png`} 
                        style={{ width: '250px', objectFit: 'contain' }}
                    />
                </div>
            </Col>
            {enabledDailies.length > 0 && (
            <Col style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem'}}>
                <table className='text-center box'>
                    <thead>
                        <tr>
                            <th colSpan={2}>Daily</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enabledDailies.map(task => {
                            const row = checklist.find(cl => cl.character_id === 0 && cl.task_id === task.id) || {completed: 0, enabled: 1};
                            return (
                                <tr key={task.id}>
                                    <td><img src={`/img/tasks/${task.icon}`} style={{ maxWidth: '80px', maxHeight: '80px'}} /></td>
                                    <td>{task.title}</td>
                                    <td
                                        onClick={() => toggleTask(0, task.id, row.completed)}
                                        role='button'
                                    >
                                        {row?.completed ? <Check /> : <X />}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Col>
            )}
        </Row>
        <Row className="my-5">
        {enabledDailies.length > 0 && (
            <Col>
                <table className='text-center box'>
                    <thead>
                        <tr>
                            <th colSpan={2}>Weekly</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enabledWeeklies.map(task => {
                            const row = checklist.find(cl => cl.character_id === 0 && cl.task_id === task.id) || {completed: 0, enabled: 1};
                            return (
                                <tr key={task.id}>
                                    <td><img src={`/img/tasks/${task.icon}`} style={{ maxWidth: '80px', maxHeight: '80px'}} /></td>
                                    <td>{task.title}</td>
                                    <td
                                        onClick={() => {toggleTask(0, task.id, row.completed)}}
                                        role='button'
                                    >
                                        {row?.completed ? <Check /> : <X />}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Col>
            )}
        </Row>
        </>
    )
}