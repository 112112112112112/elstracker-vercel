import * as db from '@/services/db.js';
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

export default function ChallengeTracker({characters, checklist, setChecklist, tasks}) {
    const [challengeData, setChallengeData] = useState(null);
    const [currentWeek, setCurrentWeek] = useState('');
    const [viewDungeon, setViewDungeon] = useState(null);
    const challengeTask = tasks.find(t => t.title === 'Challenge Mode');

    useEffect(() => {
        async function load() {
            let challData = await db.getChallengeData();
            if (!challData || Object.keys(challData.characters).length === 0) {
                challData = { characters: {} };
                for (const c of characters) {
                    challData.characters[c.id] = {
                        rossoAura: 0,
                        bertheAura: 0,
                        resetTicketUsed: 0
                    };
                }
                localStorage.setItem('challengeData', JSON.stringify(challData));
            }
            
            setChallengeData(challData);

            const week = await db.getCurrentWeek();
            setCurrentWeek(week);
        }
        
        load();
    }, [characters]);

    const displayDungeon = viewDungeon || currentWeek;

    const renderDungeonTable = (dungeon) => {
        const getAura = (charData) => {
            return dungeon === 'Rosso' ? charData.rossoAura : charData.bertheAura;
        };

        const isActive = dungeon === currentWeek;

        return (
            <table className='text-center box'>
                <thead>
                    <tr>
                        <th colSpan={2}>Character</th>
                        <th><img src={`img/items/${dungeon.toLowerCase()}-aura.webp`} alt={`${dungeon} Aura`} /></th>
                        <th><img src={`img/items/${dungeon.toLowerCase()}-reset.webp`} alt={`${dungeon} Reset Tickets`} /></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map(c => {
                        const charData = challengeData?.characters?.[c.id] || {rossoAura: 0, bertheAura: 0, resetTicketUsed: 0};
                        const aura = getAura(charData);
                        const isCleared = checklist.some(cl => cl.character_id === c.id && cl.task_id === challengeTask?.id && cl.completed === 1);

                        return (
                            <tr key={c.id} className='character-row' style={{ backgroundColor: `${c.color}33`, outline: `2px solid ${c.color}` }}>
                                <td>
                                    <img src={`/img/classes/${c.class}.png`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                </td>
                                <td>{c.name}</td>
                                <td>{aura}</td>
                                <td>{charData.resetTicketUsed}/2</td>
                                <td>
                                    <div className="button-box d-flex justify-content-center">
                                        {isActive && !isCleared && (
                                            <Button
                                                size="sm"
                                                className="mx-2"
                                                variant="outline-light"
                                                onClick={async () => {
                                                    await db.updateAura(c.id, dungeon, 30);
                                                    await db.updateChecklist(c.id, challengeTask.id, 1);
                                                    const data = await db.getChallengeData();
                                                    setChallengeData(data);
                                                    const updatedChecklist = await db.getChecklist();
                                                    setChecklist(updatedChecklist);
                                                }}
                                            >
                                                Clear (+30 Aura)
                                            </Button>
                                        )}
                                        
                                        {/* exchanges, set & reset are always visible */}
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            disabled={aura < 90}
                                            onClick={async () => {
                                                await db.setAura(c.id, dungeon, aura - 90);
                                                const data = await db.getChallengeData();
                                                setChallengeData(data);
                                            }}
                                        >
                                            Exchange Suit (-90 Aura)
                                        </Button>
                                        
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            disabled={aura < 240}
                                            onClick={async () => {
                                                await db.setAura(c.id, dungeon, aura - 240);
                                                const data = await db.getChallengeData();
                                                setChallengeData(data);
                                            }}
                                        >
                                            Exchange Force (-240 Aura)
                                        </Button>
                                        
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            onClick={async () => {
                                                await db.resetAura(c.id, dungeon);
                                                const data = await db.getChallengeData();
                                                setChallengeData(data);
                                            }}
                                        >
                                            Reset Aura
                                        </Button>
                                        
                                        {isActive && isCleared && (
                                            <Button
                                                size="sm"
                                                className="mx-2"
                                                variant="outline-light"
                                                disabled={charData.resetTicketUsed >= 2}
                                                onClick={async () => {
                                                    const result = await db.useResetTicket(c.id);

                                                    if (result.error) {
                                                        alert(result.error);
                                                        return;
                                                    }

                                                    await db.updateChecklist(c.id, challengeTask.id, 0);
                                                    const data = await db.getChallengeData();
                                                    setChallengeData(data);

                                                    const updatedChecklist = await db.getChecklist();
                                                    setChecklist(updatedChecklist);
                                                }}
                                            >
                                                Reset Ticket ({charData.resetTicketUsed}/2)
                                            </Button>
                                        )}

                                        <div className="d-flex align-items-center">
                                            <Form.Control
                                                type="number"
                                                size="sm"
                                                className="mx-2"
                                                placeholder="Set aura to..."
                                                style={{ width: '9rem' }}
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        const value = parseInt(e.target.value);
                                                        if (!isNaN(value) && value >= 0) {
                                                            await db.setAura(c.id, dungeon, value);
                                                            const data = await db.getChallengeData();
                                                            setChallengeData(data);
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h2>
                    <img src={`/img/tasks/${displayDungeon.toLowerCase()}.webp`} alt={displayDungeon} width="60px"/>  {displayDungeon} Challenge Tracker
                </h2>
                <div className="d-flex gap-2">
                     {currentWeek !== 'Berthe' && (
                        <Button
                            variant={viewDungeon === 'Berthe' ? 'outline-active' : 'outline-light'}
                            size="sm"
                            onClick={() => setViewDungeon('Berthe')}
                        >
                            View Berthe
                        </Button>
                    )}
                    {currentWeek !== 'Rosso' && (
                        <Button
                            variant={viewDungeon === 'Rosso' ? 'outline-active' : 'outline-light'}
                            size="sm"
                            onClick={() => setViewDungeon('Rosso')}
                        >
                            View Rosso
                        </Button>
                    )}
                    <Button
                        variant={viewDungeon === null ? 'outline-active' : 'outline-light'}
                        size="sm"
                        onClick={() => setViewDungeon(null)}
                    >
                        Current Week ({currentWeek})
                    </Button>
                </div>
            </div>
            {renderDungeonTable(displayDungeon)}
        </>
    );
}