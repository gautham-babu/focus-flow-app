import PomodoroTimer from '../components/PomodoroTimer';
import SessionLogger from '../components/SessionLogger';

export default function TimerPage() {
    return (
        <div>
            <PomodoroTimer />
            <SessionLogger />
        </div>
    );
}