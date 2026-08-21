import * as db from '@/services/db.js';
import { useEffect, useState } from "react";
import { Dropdown, Form } from "react-bootstrap";

export default function ThemePicker({ theme, setTheme }) {
    const themes = [
        // { id: '04-GS', name: 'Genesis', img: '/img/classes/04-GS.png' },
        // { id: '08-LA', name: 'Lord Azoth', img: '/img/classes/08-LA.png' },
        // { id: '11-TW', name: 'Twilight', img: '/img/classes/11-TW.png' },
        // { id: '13-FB', name: 'Furious Blade', img: '/img/classes/13-FB.png' },
        // { id: '19-CS', name: 'Code Sariel', img: '/img/classes/19-CS.png' },
        // { id: '24-DA', name: 'Dius Aer', img: '/img/classes/24-DA.png' },
        // { id: '26-Devi', name: 'Devi', img: '/img/classes/26-Devi.png' },
        // { id: '32-AD', name: 'Adrestia', img: '/img/classes/32-AD.png' },
        // { id: '33-DB', name: 'Doom Bringer', img: '/img/classes/33-DB.png' },
        // { id: '40-DeM', name: 'Demersio', img: '/img/classes/40-DeM.png' },
        // { id: '43-MN', name: 'Minerva', img: '/img/classes/43-MN.png' },
        // { id: '47-HR', name: 'Herrscher', img: '/img/classes/47-HR.png' },
        // { id: '50-RaS', name: 'Radiant Soul', img: '/img/classes/50-RaS.png' },
        // { id: '54-CL', name: 'Celestia', img: '/img/classes/54-CL.png' },
        // { id: '60-MC', name: 'Mischief', img: '/img/classes/60-MC.png' },
        { id: 'elboy', name: 'Elboy', img: '/img/chibi/elboy.png' },
        { id: 'aisha', name: 'Aisha', img: '/img/chibi/aisha.png' },
        { id: 'rena', name: 'Rena', img: '/img/chibi/rena.png' },
        { id: 'raven', name: 'Raven', img: '/img/chibi/raven.png' },
        { id: 'eve', name: 'Eve', img: '/img/chibi/eve.png' },
        { id: 'chung', name: 'Chung', img: '/img/chibi/chung.png' },
        { id: 'ara', name: 'Ara', img: '/img/chibi/ara.png' },
        { id: 'elesis', name: 'Elesis', img: '/img/chibi/elesis.png' },
        { id: 'add', name: 'Add', img: '/img/chibi/add.png' },
        { id: 'luciel', name: 'Luciel', img: '/img/chibi/luciel.png' },
        { id: 'rose', name: 'Rose', img: '/img/chibi/rose.png' },
        { id: 'ain', name: 'Ain', img: '/img/chibi/ain.png' },
        { id: 'laby', name: 'Laby', img: '/img/chibi/laby.png' },
        { id: 'noah', name: 'Noah', img: '/img/chibi/noah.png' },
        { id: 'lithia', name: 'Lithia', img: '/img/chibi/lithia.png' },
    ];

    const currentTheme = themes.find(t => t.id === theme);

     return (
        <>
            <Dropdown drop="end">
                <Dropdown.Toggle variant='outline-secondary' size='sm'>
                    {currentTheme ? (
                        <>
                            <img src={`${currentTheme.img}`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                            <span>Select theme</span>
                        </>
                    ) : (
                        'Select theme'
                    )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', padding: '8px' }}>
                        {themes.map(t => (
                            <Dropdown.Item key={t.id} onClick={() => setTheme(t.id)} style={{ padding: '2px' }}>
                                <img src={`${t.img}`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                            </Dropdown.Item>
                        ))}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </>
    );

}