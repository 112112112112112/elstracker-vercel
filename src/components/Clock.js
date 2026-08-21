import * as db from '@/services/db.js';
import { useEffect, useState } from "react";
import { ClockHistory } from "react-bootstrap-icons";

export default function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, [])

    // fills with 0s to look good
    const hours = String(time.getUTCHours()).padStart(2, '0');
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(time.getUTCSeconds()).padStart(2, '0');

    const utcTime = `${hours}:${minutes}:${seconds}`;

    const now = time.getTime();
    const reset = new Date(time);
    reset.setUTCHours(0, 0, 0, 0);
    reset.setUTCDate(reset.getUTCDate() + 1);
    const diff = reset - now;

    const hoursLeft = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minsLeft = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const secLeft = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    return (
        <>
            <h2 className='text-center' suppressHydrationWarning><ClockHistory /> Server Time: <span className="clock-digits">{utcTime}</span><br /></h2>
            <h2 className='text-center' suppressHydrationWarning><ClockHistory /> Reset is in <span className="clock-digits">{hoursLeft}h {minsLeft}min {secLeft}s</span></h2>
        </>
    );
}