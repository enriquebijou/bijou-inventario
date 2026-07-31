import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DiscountConfig() {
  const [discountTypes, setDiscountTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', percentage: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await api.get('/discounts/discount-types');
      setDiscountTypes(data);
    } catch (error) {
      toast.error('Error al cargar descuentos');
    }
  };

  const handleOpen = (dt = null) => {
    if (dt) {
      setEditing(dt);
      setForm({ name: dt.name, percentage: dt.percentage });
    } else {
      setEditing(null);
      setForm({ name: '', percentage: '' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || form.percentage === '') {
      toast.error('Completa nombre y porcentaje');
      return;
    }
    try {
      if (editing) {
        await api.put(`/discounts/discount-types/${editing.id}`, {
          name: form.name,
          percentage: form.percentage,
          customerTypeId: editing.customerTypeId || 1
        });
        toast.success('Descuento actualizado');
      } else {
        await api.post('/discounts/discount-types', {
          name: form.name,
          percentage: form.percentage,
          customerTypeId: 1
        });
        toast.success('Descuento creado');
      }
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este tipo de descuento?')) return;
    try {
      await api.delete(`/discounts/discount-types/${id}`);
      toast.success('Descuento eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#0a1628' }}>
          Tipos de Descuento
        </Typography>
        <Button variant="contained" color="secondary" startIcon={<Add />} onClick={() => handleOpen()}>
          Nuevo Descuento
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Configura los tipos de descuento que se pueden aplicar al momento de una venta. 
            Puedes modificar el nombre y porcentaje en cualquier momento.
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre del Descuento</TableCell>
              <TableCell align="center">Porcentaje</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discountTypes.map(dt => (
              <TableRow key={dt.id} hover>
                <TableCell><strong>{dt.name}</strong></TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${dt.percentage}%`}
                    sx={{ 
                      bgcolor: '#0a1628', color: '#d4a017', 
                      fontWeight: 500, fontSize: '0.85rem', minWidth: 60 
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="primary" onClick={() => handleOpen(dt)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(dt.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {discountTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No hay tipos de descuento configurados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 500 }}>
          {editing ? 'Editar Descuento' : 'Nuevo Tipo de Descuento'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Nombre del Descuento" margin="normal" required autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Mayorista, Empleado, Promo 10%"
          />
          <TextField
            fullWidth label="Porcentaje (%)" margin="normal" required
            type="number"
            inputProps={{ min: 0, max: 100, step: 0.5 }}
            value={form.percentage}
            onChange={(e) => setForm({ ...form, percentage: e.target.value })}
            helperText="Porcentaje de descuento que se aplicará (0-100)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
