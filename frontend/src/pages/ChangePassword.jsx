import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Alert
} from '@mui/material';
import { Lock, Save } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      toast.success('Contraseña actualizada correctamente');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#0a1628' }}>
        Cambiar Contraseña
      </Typography>

      <Card sx={{ maxWidth: 500 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Lock color="primary" />
            <Box>
              <Typography variant="h6">Actualizar tu contraseña</Typography>
              <Typography variant="body2" color="text.secondary">
                Usuario: {user?.name} ({user?.email})
              </Typography>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Contraseña actual"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Nueva contraseña"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              margin="normal"
              required
              helperText="Mínimo 6 caracteres"
            />
            <TextField
              fullWidth
              label="Confirmar nueva contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<Save />}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
