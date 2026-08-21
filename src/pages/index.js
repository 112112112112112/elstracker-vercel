import * as db from '@/services/db.js';
import {initDB} from '@/services/db.js';
import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AccountTracker from '../components/AccountTracker';
import AddCharacterForm from '../components/AddCharacterForm';
import AddTaskForm from '../components/AddTaskForm';
import ChallengeTracker from '../components/ChallengeTracker';
import CharacterTracker from '../components/CharacterTracker';
import Clock from '../components/Clock';
import PityTracker from '../components/PityTracker';
import Settings from '../components/Settings';
import { CardChecklist, Gear, GearFill, ListCheck, ListStars, PatchPlus } from 'react-bootstrap-icons';

export default function IndexPage() {
    const [tasks, setTasks] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [classes, setClasses] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [currentWeek, setCurrentWeek] = useState('');

    const [newIcon, setNewIcon] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newReset, setNewReset] = useState('daily');
    const [newBound, setNewBound] = useState('account');

    const [error, setError] = useState('');
    
    const [newCharName, setNewCharName] = useState('');
    const [newCharClass, setNewCharClass] = useState('');
    const [newCharColor, setNewCharColor] = useState('');

    const [pityRefresh, setPityRefresh] = useState(0);

    const [theme, setTheme] = useState('luciel');

    const [viewMode, setViewMode] = useState('both');


    useEffect(() => {
        async function load() {
            await initDB();
            const allTasks = await db.getTasks();
            setTasks(allTasks);
            
            const allCharacters = await db.getCharacters();
            setCharacters(allCharacters);

            const allClasses = await db.getClasses();
            setClasses(allClasses || []);

            const allChecklist = await db.getChecklist();
            setChecklist(allChecklist);

            const currentWeek = await db.getCurrentWeek();
            setCurrentWeek(currentWeek);
        }
        load();
    }, [])

    const validateName = (name) => {
        if (!name.trim()) {
            return "Name can't be empty";
        }
        if (!name.match(/^[a-zA-Z0-9]+$/)) {
            return 'Name contains invalid characters';
        }
        if (name.length > 12 || name.length < 2) {
            return 'Name must be between 2 and 12 characters';
        }
        return null;
    };

    const handleAddCharacter = async() => {
        const errorMsg = validateName(newCharName);

        if (errorMsg) {
            setError(errorMsg);
            setNewCharName('');
            return;
        }
        
        if (!newCharClass) {
            return;
        }
        
        setError('')

        await db.addCharacter(newCharName, newCharClass, newCharColor);

        const newChar = await db.getCharacters();
        setCharacters(newChar);
        
        const newChecklist = await db.getChecklist();
        setChecklist(newChecklist);

        setNewCharName('');
        setNewCharClass('');
        setNewCharColor('');
    };

    const handleEditCharacter = async(characterId, editCharName, editCharClass, editCharColor) => {
        await db.editCharacter(characterId, editCharName, editCharClass, editCharColor);
        const updatedCharacters = await db.getCharacters();
        setCharacters(updatedCharacters);
    }

    const handleDeleteCharacter = async(characterId) => {
        const confirmDelete = confirm('Are you sure you want to delete this character?');
        if (confirmDelete) {
            await db.deleteCharacter(characterId);
            const updatedCharacters = await db.getCharacters();
            setCharacters(updatedCharacters);

            const updatedChecklist = await db.getChecklist();
            setChecklist(updatedChecklist);
        }
    }

    const handleAddTask = async() => {
        if (!newTitle.trim()) {
            return;
        }

        await db.addTask(newIcon || null, newTitle, newReset, newBound);

        const newTask = await db.getTasks();
        setTasks(newTask);

        const newChecklist = await db.getChecklist();
        setChecklist(newChecklist);

        setNewIcon('');
        setNewTitle('');
        setNewReset('daily');
        setNewBound('account');
    };

    const handleDeleteTask = async(taskId) => {
        const confirmDelete = confirm('Are you sure you want to delete this task?');
        if (confirmDelete) {
            await db.deleteTask(taskId);
            const updatedTasks = await db.getTasks();
            setTasks(updatedTasks);
        }
    }

    const refreshPity = () => {
        setPityRefresh(prev => prev + 1);
    }

    const toggleTask = async(characterId, taskId, currentStatus) => {
        const newStatus = currentStatus ? 0 : 1;

        const task = tasks.find(t => t.id === taskId);
        const isPityTask = task && (task.title === 'Serpentium' || task.title === 'Doom Aporia');

        await db.updateChecklist(characterId, taskId, newStatus);
        console.log('Toggled:', { characterId, taskId, newStatus });


        if (isPityTask) {
            if (newStatus === 1) {
                await db.addRun(characterId, taskId);
            } else {
                await db.removeRun(characterId, taskId);
            }
            refreshPity();
        }

        setChecklist(checklist => checklist.map(row =>
            row.character_id === characterId && row.task_id === taskId ? {...row, completed: newStatus} : row
        ));
    }

    const toggleTaskEnabled = async(characterId, taskId, currentEnabled) => {
        const newEnabled = currentEnabled ? 0 : 1;
        await db.toggleTaskEnabled(characterId, taskId, newEnabled);

        setChecklist(checklist => checklist.map(row =>
            row.character_id === characterId && row.task_id === taskId ? {...row, enabled: newEnabled} : row
        ));
    }

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const savedViewMode = localStorage.getItem('viewMode');

        if (savedTheme) setTheme(savedTheme);
        if (savedViewMode) setViewMode(savedViewMode);
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('viewMode', viewMode);
    }, [viewMode]);

    return (
        <div id='body' className={`min-vh-100 text-white theme-${theme}`}>
            <Container className='mx-auto pt-4 pb-4'>
                <h1 className='text-center'>ElsTracker</h1>
                <Clock />
                <h2><ListCheck /> Checklist</h2>
                <AccountTracker
                    tasks={tasks}
                    checklist={checklist}
                    toggleTask={toggleTask}
                    theme={theme}
                />

                <Row className='my-5'>
                    <Col>
                        <h2><CardChecklist /> Character Tracker</h2>
                        <CharacterTracker 
                            characters={characters}
                            tasks={tasks}
                            checklist={checklist}
                            toggleTask={toggleTask}
                            handleDeleteCharacter={handleDeleteCharacter}
                            handleEditCharacter={handleEditCharacter}
                            classes={classes}
                            validateName={validateName}
                            currentWeek={currentWeek}
                            viewMode={viewMode}
                        />
                    </Col>
                </Row>
                <Row className='my-5'>
                    <Col>
                        <ChallengeTracker
                            characters={characters}
                            checklist={checklist}
                            setChecklist={setChecklist}
                            tasks={tasks}
                        />
                    </Col>
                </Row>
                <Row className='my-5'>
                    <Col>
                        <h2><ListStars /> Pity Tracker</h2>
                        <PityTracker
                            characters={characters}
                            tasks={tasks}
                            key={pityRefresh}
                        />
                    </Col>
                </Row>
                <Row className='my-5'>
                    <Col>
                        <h2><PatchPlus /> Add a character</h2>
                        <AddCharacterForm 
                            newCharName={newCharName}
                            setNewCharName={setNewCharName}
                            newCharClass={newCharClass}
                            setNewCharClass={setNewCharClass}
                            newCharColor={newCharColor}
                            setNewCharColor={setNewCharColor}
                            classes={classes}
                            handleAddCharacter={handleAddCharacter}
                            error={error}
                            setError={setError}
                            />
                    </Col>
                </Row>

                <Row className='my-5'>
                    <Col>
                        <h2><PatchPlus /> Create a task</h2>
                        <AddTaskForm
                            newIcon={newIcon}
                            setNewIcon={setNewIcon}
                            newTitle={newTitle}
                            setNewTitle={setNewTitle}
                            newReset={newReset}
                            setNewReset={setNewReset}
                            newBound={newBound}
                            setNewBound={setNewBound}
                            handleAddTask={handleAddTask}
                        />
                    </Col>
                </Row>
                <Settings
                    checklist={checklist}
                    tasks={tasks}
                    characters={characters}
                    toggleTaskEnabled={toggleTaskEnabled}
                    handleDeleteTask={handleDeleteTask}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    theme={theme}
                    setTheme={setTheme}
                    validateName={validateName}
                    handleEditCharacter={handleEditCharacter}
                    classes={classes}
                    handleDeleteCharacter={handleDeleteCharacter}
                    setCharacters={setCharacters}
                />
            </Container>
        </div>
    )
}

console.log('db exports:', Object.keys(db));
