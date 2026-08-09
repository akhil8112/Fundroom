import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiArrowRightOnRectangle, HiMagnifyingGlass } from 'react-icons/hi2';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/customers')) return 'Customers';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/stock')) return 'Stock Management';
    if (path.includes('/challans')) return 'Challans';
    return '';
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{getPageTitle()}</h1>
      </div>
      <div className="header-right">
        <div className="search-wrapper">
          <HiMagnifyingGlass className="search-icon" />
          <input type="text" placeholder="Search..." className="header-search" />
        </div>
        <div className="header-user">
          <button className="btn btn-ghost" onClick={logout} title="Logout">
            <HiArrowRightOnRectangle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
