import * as db from '@/services/db.js';
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

export default function ChallengeTracker({characters, checklist, setChecklist, tasks}) {
    const [challengeData, setChallengeData] = useState(null);
    const [currentWeek, setCurrentWeek] = useState('');
    const challengeTask = tasks.find(t => t.title === 'Challenge Mode');
    console.log('🔍 Challenge Task:', challengeTask);


    useEffect(() => {
        async function load() {
            let challData = await db.getChallengeData();
            console.log('chall data: ', challData);
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
                console.log('SAVED CHALL DATA: ', challData);
            }
            
            setChallengeData(challData);

            const week = await db.getCurrentWeek();
            setCurrentWeek(week);
        }
        
        load();
    }, [characters]);

    return (
        <>
            <h2><img src={`/img/tasks/${currentWeek.toLowerCase()}.webp`} alt={currentWeek} width="60px"/> Challenge Tracker</h2>
            <table className='text-center box'>
                <thead>
                    <tr>
                        <th colSpan={2}>Character</th>
                        <th><img src={`img/items/${currentWeek.toLowerCase()}-aura.webp`} alt={`${currentWeek} Aura`} /></th>
                        <th><img src={`img/items/${currentWeek.toLowerCase()}-reset.webp`} alt={`${currentWeek} Reset Tickets`} /></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map(c => {
                        const charData = challengeData?.characters?.[c.id] || {rossoAura: 0, bertheAura: 0, resetTicketUsed: 0};
                        const aura = currentWeek === 'Rosso' ? charData.rossoAura : charData.bertheAura;
                        const isCleared = checklist.some(cl => cl.character_id === c.id && cl.task_id === challengeTask?.id && cl.completed === 1);

                        console.log('challengeTask:', challengeTask);
                        console.log('isCleared:', isCleared);
                        console.log('checklist:', checklist);
                        return (
                            <tr key={c.id} className='character-row' style={{ backgroundColor: `${c.color}33`, outline: `2px solid ${c.color}` }}>
                                <td>
                                    <img src={`/img/classes/${c.class}.png`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                </td>
                                <td>
                                    {c.name}
                                </td>
                                <td>{aura}</td>
                                <td>{charData.resetTicketUsed}/2</td>
                                <td>
                                    <div className="button-box d-flex justify-content-center">
                                        {!isCleared ? (
                                            <Button
                                                size="sm"
                                                className="mx-2"
                                                variant="outline-light"
                                                onClick={async () => {
                                                    await db.updateAura(c.id, currentWeek, 30);
                                                    await db.updateChecklist(c.id, challengeTask.id, 1);
                                                    const data = await db.getChallengeData();

                                                    setChallengeData(data);
                                                    const updatedChecklist = await db.getChecklist();
                                                    setChecklist(updatedChecklist);
                                                }}
                                            >
                                                Clear (+30 Aura)
                                                </Button>
                                        ) : (
                                            <></>
                                        )}
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            disabled={aura < 90}
                                            onClick={async () => {
                                                await db.setAura(c.id, currentWeek, aura -90);
                                                const charData = await db.getChallengeData();
                                                setChallengeData(charData);
                                            }}
                                        >
                                            Exchange Suit (-90 Aura)
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            disabled = {aura < 240}
                                            onClick={async () => {
                                                await db.setAura(c.id, currentWeek, aura -240);
                                                const charData = await db.getChallengeData();
                                                setChallengeData(charData);
                                            }}
                                        >
                                            Exchange Force (-240 Aura)
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="mx-2"
                                            variant="outline-light"
                                            onClick={async () => {
                                                await db.resetAura(c.id, currentWeek);
                                                const charData = await db.getChallengeData();
                                                setChallengeData(charData);
                                            }}
                                        >
                                            Reset Aura
                                        </Button>
                                        {isCleared && (
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
                                                    const charData = await db.getChallengeData();
                                                    setChallengeData(charData);

                                                    const updatedChecklist = await db.getChecklist();
                                                    setChecklist(updatedChecklist);
                                                }}
                                            >
                                                Reset Ticket ({charData.resetTicketUsed}/2)
                                            </Button>
                                        )}


                                        <div className="d-flex align-items-center">
                                            <Form.Control
                                                // autoFocus
                                                type="number"
                                                size="sm"
                                                className="mx-2"
                                                placeholder="Set aura to..."
                                                style={{ width: '9rem' }}
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        const value = parseInt(e.target.value);
                                                        if (!isNaN(value) && value >= 0) {
                                                            await db.setAura(c.id, currentWeek, value);
                                                            const charData = await db.getChallengeData();
                                                            setChallengeData(charData);
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
        </>
    );
}