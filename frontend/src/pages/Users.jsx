import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd, Lock } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'vendedor' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    }
  };

  const handleOpen = () => {
    setForm({ name: '', email: '', password: '', role: 'vendedor' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Usuario creado exitosamente');
      setOpen(false);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/auth/users/${user.id}/toggle`);
      toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado');
      loadUsers();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const roleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'vendedor': return 'primary';
      case 'almacenero': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Usuarios del Sistema
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PersonAdd />}
          onClick={handleOpen}
          sx={{ fontWeight: 600 }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell><strong>{user.name}</strong></TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={roleColor(user.role)}
                    size="small"
                    sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={user.active ? 'Activo' : 'Inactivo'}
                    color={user.active ? 'success' : 'default'}
                    size="small"
                    variant={user.active ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('es-GT')}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => { setResetUser(user); setNewPassword(''); setOpenReset(true); }}
                    sx={{ mr: 1 }}
                  >
                    <Lock fontSize="small" />
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color={user.active ? 'error' : 'success'}
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.active ? 'Desactivar' : 'Activar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear usuario */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Nombre completo" margin="normal" required autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Juan Pérez"
          />
          <TextField
            fullWidth label="Correo electrónico" margin="normal" required type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="usuario@correo.com"
          />
          <TextField
            fullWidth label="Contraseña" margin="normal" required type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            helperText="Mínimo 6 caracteres"
          />
          <TextField
            fullWidth select label="Rol" margin="normal" required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <MenuItem value="vendedor">Vendedor — Puede crear ventas</MenuItem>
            <MenuItem value="almacenero">Almacenero — Puede manejar inventario y compras</MenuItem>
            <MenuItem value="admin">Administrador — Acceso total</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSave} disabled={loading}>
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para resetear contraseña */}
      <Dialog open={openReset} onClose={() => setOpenReset(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 500 }}>
          Cambiar Contraseña — {resetUser?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Establece una nueva contraseña para este usuario.
          </Typography>
          <TextField
            fullWidth label="Nueva contraseña" type="password" required autoFocus
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Mínimo 6 caracteres"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenReset(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={newPassword.length < 6}
            onClick={async () => {
              try {
                await api.put(`/auth/users/${resetUser.id}/reset-password`, { newPassword });
                toast.success(`Contraseña de ${resetUser.name} actualizada`);
                setOpenReset(false);
              } catch (error) {
                toast.error('Error al cambiar contraseña');
              }
            }}
          >
            Guardar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
