import * as db from '@/services/db.js';
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

export default function FragmentTracker({ characters }) {
    const [fragmentData, setFragmentData] = useState(null);
    const [viewFragment, setViewFragment] = useState('atma');

    useEffect(() => {
        async function load() {
            const data = await db.getAllFragments();
            setFragmentData(data);
        }
        load();
    }, [characters]);

    const fragmentImages = {
        atma: 'atma',
        henir: 'highentropy',
    }

    const clearFragments = {
        atma: 10,
        henir: 40,
    }

    const substractFragments = {
        atma: 45,
        henir: 40,
    }

    const getFragments = (charData, type) => {
        return type === 'atma'
            ? (charData?.atma || 0)
            : (charData?.henir || 0);
    };

    const handleUpdate = async (characterId, fragmentType, amount) => {
        await db.updateFragments(characterId, fragmentType, amount);
        const data = await db.getAllFragments();
        setFragmentData(data);
    };

    const handleSet = async (characterId, fragmentType, value) => {
        await db.setFragments(characterId, fragmentType, value);
        const data = await db.getAllFragments();
        setFragmentData(data);
    };

    const handleReset = async (characterId, fragmentType) => {
        await db.resetFragments(characterId, fragmentType);
        const data = await db.getAllFragments();
        setFragmentData(data);
    };

    const renderFragmentTable = (fragmentType) => {
        const fragmentName = fragmentType === 'atma' ? 'Atma' : 'High Entropy';

        return (
            <table className='text-center box'>
                <thead>
                    <tr>
                        <th colSpan={2}>Character</th>
                        <th><img src={`/img/items/${viewFragment}-fragment.webp`} alt={fragmentName} /></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map(c => {
                        const charData = fragmentData?.characters?.[c.id] || { atma: 0, henir: 0 };
                        const fragments = getFragments(charData, fragmentType);

                        return (
                            <tr key={c.id} className='character-row' style={{ backgroundColor: `${c.color}33`, outline: `2px solid ${c.color}` }}>
                                <td>
                                    <img src={`/img/classes/${c.class}.png`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                </td>
                                <td>{c.name}</td>
                                <td>{fragments}</td>
                                <td>
                                    <div className="button-box d-flex justify-content-center align-items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline-light"
                                            onClick={() => handleUpdate(c.id, fragmentType, clearFragments[fragmentType])}
                                        >
                                            Clear (+{clearFragments[fragmentType]})
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-light"
                                            disabled={fragments < substractFragments[fragmentType]}
                                            onClick={() => handleUpdate(c.id, fragmentType, -substractFragments[fragmentType])}
                                        >
                                            Substract (-{substractFragments[fragmentType]})
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-light"
                                            onClick={() => handleReset(c.id, fragmentType)}
                                        >
                                            Reset
                                        </Button>
                                        <Form.Control
                                            type="number"
                                            size="sm"
                                            placeholder="Set fragments to..."
                                            style={{ width: '10rem' }}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                    const value = parseInt(e.target.value);
                                                    if (!isNaN(value) && value >= 0) {
                                                        await handleSet(c.id, fragmentType, value);
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
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
                    <img
                        src={`/img/tasks/${fragmentImages[viewFragment]}.webp`}
                        alt={viewFragment}
                        width="60px"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                      {viewFragment === 'atma' ? 'Atma' : 'High Entropy'} Fragment Tracker
                </h2>
                <div className="d-flex gap-2">
                    <Button
                        variant={viewFragment === 'atma' ? 'outline-active' : 'outline-light'}
                        size="sm"
                        onClick={() => setViewFragment('atma')}
                    >
                        Atma
                    </Button>
                    <Button
                        variant={viewFragment === 'henir' ? 'outline-active' : 'outline-light'}
                        size="sm"
                        onClick={() => setViewFragment('henir')}
                    >
                        High Entropy
                    </Button>
                </div>
            </div>
            {renderFragmentTable(viewFragment)}
        </>
    );
}