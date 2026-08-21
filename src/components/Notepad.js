import * as db from '@/services/db.js';
console.log('db:', db);
console.log('db.loadNotes:', db.loadNotes);
import { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

export default function Notepad() {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        async function loadNotes() {
            const saved = await db.loadNotes();
            setNotes(saved || '');
        }

        loadNotes();
    }, []);

    const saveNotes = async (text) => {
        await db.saveNotes(text);
    };

    return (
        <Form.Control
            id='notepad'
            as="textarea"
            rows={8}
            value={notes}
            style={{ marginTop: '2rem' }}
            onChange={(e) => {
                setNotes(e.target.value);
                saveNotes(e.target.value);
            }}
        />
    )
}


