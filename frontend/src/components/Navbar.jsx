import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Focus Flow</div>
      <div className="navbar-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/timer" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Timer & Sessions
        </NavLink>
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Task Board
        </NavLink>
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Analytics
        </NavLink>
      </div>
    </nav>
  );
}