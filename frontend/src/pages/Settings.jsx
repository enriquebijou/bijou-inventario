import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid, Alert
} from '@mui/material';
import { Save, Store } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [form, setForm] = useState({
    storeName: '',
    address: '',
    phone: '',
    currency: 'Q'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setForm({
        storeName: data.storeName || '',
        address: data.address || '',
        phone: data.phone || '',
        currency: data.currency || 'Q'
      });
    } catch (error) {
      console.error('Error cargando configuración');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings', form);
      toast.success('Configuración guardada. El nombre se mostrará en el login.');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Configuración de la Tienda
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Store color="primary" />
                <Typography variant="h6">Datos de la Tienda</Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                El nombre de la tienda se muestra en la pantalla de login y en las facturas.
              </Alert>

              <TextField
                fullWidth
                label="Nombre de la Tienda"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                margin="normal"
                required
                placeholder="Ej: BIJOU, Mi Tienda, etc."
              />
              <TextField
                fullWidth
                label="Dirección"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                margin="normal"
                placeholder="Dirección de la tienda"
              />
              <TextField
                fullWidth
                label="Teléfono"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                margin="normal"
                placeholder="Número de teléfono"
              />
              <TextField
                fullWidth
                label="Símbolo de Moneda"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                margin="normal"
                helperText="Q para Quetzales, $ para Dólares, etc."
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
