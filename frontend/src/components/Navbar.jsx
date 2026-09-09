import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">Focus Flow</div>
            <div className="navbar-links">
                <Link to="/" className="nav-link">Dashboard</Link>
                <Link to="/timer" className="nav-link">Timer & Sessions</Link>
                <Link to="/tasks" className="nav-link">Task Board</Link>
                <Link to="/analytics" className="nav-link">Analytics</Link>
            </div>
        </nav>
    );
}