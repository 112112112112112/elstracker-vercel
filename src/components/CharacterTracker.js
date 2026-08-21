import * as db from '@/services/db.js';
import { Button } from "react-bootstrap";
import { Check, X } from "react-bootstrap-icons";

export default function CharacterTracker({ characters, tasks, checklist, toggleTask, handleDeleteCharacter, currentWeek, viewMode }) {
    const allTasks = tasks.filter(t => t.bound === 'character' && t.title !== 'Challenge Mode');

    const enabledTasks = allTasks.filter(task => {
        return characters.some(c => {
            const row = checklist.find(cl => cl.character_id === c.id && cl.task_id === task.id);
            return row?.enabled === 1;
        })
    })

    return (
        <>
        <div className="scroll-wrapper">
            <table key={checklist.length} className='text-center box box-character mb-3'>
                <thead>
                    <tr>
                        <th colSpan={2}>Character</th>
                        {enabledTasks.map(t => {
                            let icon = t.icon ? `img/tasks/${t.icon}` : null;
                            if (t.title === 'Challenge Mode' && currentWeek) {
                                icon = currentWeek === 'Rosso' ? '/img/tasks/rosso.webp' : '/img/tasks/berthe.webp';
                            }
                            return (
                            <th key={t.id}>
                                {(viewMode === 'both' || viewMode === 'icons') && icon && (
                                    <img src={icon} style={{ maxWidth: '80px', maxHeight: '80px'}} />
                                )}
                                {(viewMode === 'both' || viewMode === 'titles') && t.title}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {characters.map(c => {
                        return (
                            <tr key={c.id} className='character-row' style={{ backgroundColor: `${c.color}33`, outline: `2px solid ${c.color}` }}>
                                <td>
                                    <img src={`/img/classes/${c.class}.png`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                </td>
                                <td>
                                    {c.name}
                                </td>
                                {enabledTasks.map(task => {
                                    const row = checklist.find(cl => cl.character_id === c.id && cl.task_id === task.id) || {completed: 0};
                                    if (row.enabled === 0) {
                                        return (
                                            <td key={task.id} className='text-muted cell-disabled'
                                            >
                                                N/A
                                            </td>
                                        )
                                    }
                                    return <td
                                        key={task.id}
                                        onClick={() => toggleTask(c.id, task.id, row.completed)}
                                        role='button'
                                    >
                                        {row?.completed ? <Check /> : <X />}
                                    </td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        </>
    );
}