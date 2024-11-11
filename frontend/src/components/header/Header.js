import React, { useState } from 'react';
import './Header.css'; 
import logo from '../../assets/logo.png';  
import { Button, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, Home as HomeIcon, Settings as SettingsIcon } from '@mui/icons-material'; 

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);

 
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };


  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className="header-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      
      <div className="header-title">
        <h1>Home</h1>
      </div>

      <div className="menu">

        <Button 
          variant="contained" 
          sx={{ backgroundColor: '#2f4f4f', color: 'white', '&:hover': { backgroundColor: '#4e6363' } }}
          onClick={handleClick}
          startIcon={<MenuIcon />}  
        >
          Meniu
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            <HomeIcon style={{ marginRight: 10 }} /> 
            Home
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <SettingsIcon style={{ marginRight: 10 }} />  
            Settings
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <HomeIcon style={{ marginRight: 10 }} />  
            Option 3
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
