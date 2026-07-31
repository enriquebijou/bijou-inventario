import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleOpen = (category = null) => {
    if (category) {
      setEditing(category);
      setForm({ name: category.name, description: category.description || '' });
    } else {
      setEditing(null);
      setForm({ name: '', description: '' });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
        toast.success('Categoría actualizada');
      } else {
        await api.post('/categories', form);
        toast.success('Categoría creada');
      }
      setOpen(false);
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoría eliminada');
      loadCategories();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Categorías</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nueva Categoría
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell><strong>{cat.name}</strong></TableCell>
                <TableCell>{cat.description || '-'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(cat)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(cat.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Nombre" margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required autoFocus
          />
          <TextField
            fullWidth label="Descripción" margin="normal" multiline rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
