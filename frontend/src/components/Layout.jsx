import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, Divider, Avatar, Menu, MenuItem,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Inventory, PointOfSale, Receipt,
  Category, Discount, QrCode, Person, ShoppingCart, Settings,
  Assessment, ExpandLess, ExpandMore, BarChart, Summarize, People, Lock,
  AccountBalance, ListAlt
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const drawerWidth = 250;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [storeName, setStoreName] = useState('Inventario');
  const [reportsOpen, setReportsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => { if (data.storeName) setStoreName(data.storeName); })
      .catch(() => {});
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const allMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['admin', 'almacenero'] },
    { text: 'Productos', icon: <Inventory />, path: '/products', roles: ['admin', 'almacenero'] },
    { text: 'Nueva Venta', icon: <PointOfSale />, path: '/sales', roles: ['admin', 'vendedor'] },
    { text: 'Facturas', icon: <Receipt />, path: '/invoices', roles: ['admin', 'vendedor'] },
    { text: 'Caja', icon: <AccountBalance />, path: '/cash', roles: ['admin', 'vendedor'] },
    { text: 'Compras', icon: <ShoppingCart />, path: '/purchases', roles: ['admin', 'almacenero'] },
    { text: 'Kardex', icon: <ListAlt />, path: '/kardex', roles: ['admin', 'almacenero'] },
    { text: 'Categorías', icon: <Category />, path: '/categories', roles: ['admin'] },
    { text: 'Descuentos', icon: <Discount />, path: '/discounts', roles: ['admin'] },
    { text: 'Etiquetas', icon: <QrCode />, path: '/labels', roles: ['admin', 'almacenero'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));
  const isAdmin = user?.role === 'admin';

  const itemStyle = {
    borderRadius: 2,
    mb: 0.3,
    '&.Mui-selected': {
      backgroundColor: 'rgba(212, 160, 23, 0.15)',
      borderLeft: '3px solid #d4a017',
      '& .MuiListItemIcon-root': { color: '#d4a017' },
      '& .MuiListItemText-primary': { color: '#d4a017', fontWeight: 500 }
    },
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
    '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.6)', minWidth: 38 },
    '& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', fontWeight: 300 }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ py: 2.5 }}>
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography variant="h5" noWrap sx={{ fontWeight: 500, color: '#d4a017', letterSpacing: '0.1em' }}>
            {storeName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', fontSize: '0.65rem' }}>
            {user?.role === 'vendedor' ? 'PUNTO DE VENTA' : 'INVENTARIO & FACTURACIÓN'}
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(212, 160, 23, 0.15)', mx: 2 }} />
      <List sx={{ px: 1.5, pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={itemStyle}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {isAdmin && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setReportsOpen(!reportsOpen)} sx={itemStyle}>
                <ListItemIcon><Assessment /></ListItemIcon>
                <ListItemText primary="Reportes" />
                {reportsOpen ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.4)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.4)' }} />}
              </ListItemButton>
            </ListItem>
            <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{ ...itemStyle, pl: 4 }}
                    selected={location.pathname === '/reports/inventory'}
                    onClick={() => { navigate('/reports/inventory'); setMobileOpen(false); }}
                  >
                    <ListItemIcon><Summarize /></ListItemIcon>
                    <ListItemText primary="Inventario" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{ ...itemStyle, pl: 4 }}
                    selected={location.pathname === '/reports/sales'}
                    onClick={() => { navigate('/reports/sales'); setMobileOpen(false); }}
                  >
                    <ListItemIcon><BarChart /></ListItemIcon>
                    <ListItemText primary="Ventas" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

            <Divider sx={{ my: 1.5, borderColor: 'rgba(212, 160, 23, 0.1)', mx: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === '/users'}
                onClick={() => { navigate('/users'); setMobileOpen(false); }}
                sx={itemStyle}
              >
                <ListItemIcon><People /></ListItemIcon>
                <ListItemText primary="Usuarios" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === '/settings'}
                onClick={() => { navigate('/settings'); setMobileOpen(false); }}
                sx={itemStyle}
              >
                <ListItemIcon><Settings /></ListItemIcon>
                <ListItemText primary="Configuración" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 400, letterSpacing: '0.05em' }}>
            <span style={{ color: '#d4a017' }}>{storeName}</span>
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ 
              width: 34, height: 34, 
              bgcolor: '#d4a017', color: '#0a1628', 
              fontWeight: 500, fontSize: '0.9rem'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Person sx={{ mr: 1 }} /> {user?.name} ({user?.role})
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/change-password'); }}>
              <Lock sx={{ mr: 1, fontSize: 18 }} /> Cambiar Contraseña
            </MenuItem>
            <MenuItem onClick={() => { logout(); navigate('/login'); }}>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
