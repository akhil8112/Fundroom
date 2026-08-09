import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineUsers, HiOutlineCube, HiOutlineArchiveBox, HiOutlineDocumentText, HiBars3, HiXMark } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { path: '/customers', label: 'Customers', icon: HiOutlineUsers, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { path: '/products', label: 'Products', icon: HiOutlineCube, roles: ['ADMIN', 'WAREHOUSE'] },
    { path: '/stock/log', label: 'Stock', icon: HiOutlineArchiveBox, roles: ['ADMIN', 'WAREHOUSE'] },
    { path: '/challans', label: 'Challans', icon: HiOutlineDocumentText, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  ];

  return (
    <>
      <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
      </div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="gradient-text">ERP Portal</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems
            .filter(item => hasRole(item.roles as any))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="badge badge-info user-role">{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
