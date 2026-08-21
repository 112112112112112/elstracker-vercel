import * as db from '@/services/db';
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Plus, Dash } from "react-bootstrap-icons";

export default function PityTracker({ characters, tasks }) {
    const serpTask = tasks.find(t => t.title === 'Serpentium');
    const doomTask = tasks.find(t => t.title === 'Doom Aporia');

    const [pityData, setPityData] = useState({});

    const getPity = (characterId, task) => {
        const data = pityData[characterId];

        if (!data) return {runs: 0, percent: 0};

        const percent = task?.id === serpTask?.id ? data.serpPercent : data.doomPercent;
        const rate = task?.id === serpTask?.id ? 12.5 : 11.12;
        const safePercent = typeof percent === 'object' ? percent?.percent || 0 : percent || 0;
        const runs = Math.floor(safePercent / rate);

        return {runs: runs, percent: safePercent};
    };

    useEffect(() => {
        async function loadPity() {
            const newData = {};
            for (const c of characters) {
                const serpPercent = await db.getPity(c.id, serpTask?.id);
                const doomPercent = await db.getPity(c.id, doomTask?.id);
                newData[c.id] = { serpPercent: serpPercent?.percent || 0, doomPercent: doomPercent?.percent || 0 };
            }

            setPityData(newData);
        }
        if (characters.length > 0) {
            loadPity();
        }
    }, [characters, serpTask, doomTask]);

    const addRun = async(characterId, taskId, type) => {
        await db.addRun(characterId, taskId, type);

        const serpPercent = await db.getPity(characterId, serpTask?.id);
        const doomPercent = await db.getPity(characterId, doomTask?.id);

        setPityData(prev => ({...prev, [characterId]: {serpPercent, doomPercent}}));
    }

    const removeRun = async(characterId, taskId, type) => {
        await db.removeRun(characterId, taskId, type);

        const serpPercent = await db.getPity(characterId, serpTask?.id);
        const doomPercent = await db.getPity(characterId, doomTask?.id);

        setPityData(prev => ({...prev, [characterId]: {serpPercent, doomPercent}}));
    }

    const setPercent = async(characterId, taskId, percent) => {
        await db.setPercent(characterId, taskId, percent);

        const serpPercent = await db.getPity(characterId, serpTask?.id);
        const doomPercent = await db.getPity(characterId, doomTask?.id);

        setPityData(prev => ({...prev, [characterId]: {serpPercent, doomPercent}}));
    }
   
    return (
        <>
            <table className='text-center box'>
                <thead>
                    <tr>
                        <th colSpan={2}>Character</th>
                        <th colSpan={2}>Serpentium</th>
                        <th colSpan={2}>Doom</th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map(c => {
                        const serp = getPity(c.id, serpTask);
                        const doom = getPity(c.id, doomTask);

                        return (
                            <tr key={c.id} className='character-row' style={{ backgroundColor: `${c.color}33`, outline: `2px solid ${c.color}` }}>
                                <td>
                                    <img src={`/img/classes/${c.class}.png`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                </td>
                                <td>
                                    {c.name}
                                </td>
                                <td>
                                    <div className="d-flex justify-content-center">
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            onClick={() => removeRun(c.id, serpTask?.id, 'serpentium')}
                                        >
                                        <Dash />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-light"
                                            className="mx-2"
                                            onClick={() => addRun(c.id, serpTask?.id, 'serpentium')}
                                        >
                                        <Plus />
                                        </Button>
                                        <Form.Control
                                            // autoFocus
                                            type="number"
                                            size="sm"
                                            className="mx-2"
                                            style={{ width: '4rem' }}
                                            max={100}
                                            defaultValue={serp.runs}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    const value = parseInt(e.target.value)
                                                    if (!isNaN(value) && value >= 0 && value <= 100) {
                                                        await setPercent(c.id, serpTask?.id, value);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </td>
                                <td style={{ width: '16rem' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="pity-wrapper">
                                            <div className="pity-bar" style={{
                                                width: `${serp.percent}%`,
                                                background: 'linear-gradient(90deg,rgba(190, 230, 80, 1) 0%, rgba(95, 230, 80, 1) 100%)'
                                            }} />
                                            <span className="pity-text">
                                                {Math.floor(serp.percent)}%
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex justify-content-center">
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            onClick={() => removeRun(c.id, doomTask?.id, 'doom')}
                                        >
                                        <Dash />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            onClick={() => addRun(c.id, doomTask?.id, 'doom')}
                                        >
                                        <Plus />
                                        </Button>
                                        <Form.Control
                                            // autoFocus
                                            type="number"
                                            size="sm"
                                            className="mx-2"
                                            style={{ width: '4rem' }}
                                            max={100}
                                            defaultValue={doom.runs}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    const value = parseInt(e.target.value)
                                                    if (!isNaN(value) && value >= 0 && value <= 100) {
                                                        await setPercent(c.id, doomTask?.id, value);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </td>
                                <td style={{ width: '16rem' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="pity-wrapper">
                                            <div className="pity-bar" style={{
                                                width: `${doom.percent}%`,
                                                background: 'linear-gradient(90deg,rgba(110, 86, 243, 1) 0%, rgba(86, 149, 243, 1) 100%)'
                                            }} />
                                            <span className="pity-text">
                                                {Math.floor(doom.percent)}%
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}