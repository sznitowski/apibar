import React, { useState } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Asegúrate de tener un archivo CSS para el estilo

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <Button onClick={toggleSidebar} className="hamburger">
        {collapsed ? '☰' : '✖'}
      </Button>
      <Nav className={`flex-column`}>
        {/* Otros enlaces si es necesario */}
        <div className="products-container">
          <Nav.Link as={Link} to="/Productos">Productos</Nav.Link>
          <Nav.Link as={Link} to="/Mesas">Mesas</Nav.Link>
        </div>
      </Nav>
    </div>
  );
};

export default Sidebar;
