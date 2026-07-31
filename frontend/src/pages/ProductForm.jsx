import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, TextField, Button, Grid, Typography, MenuItem, Card, CardContent
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    minStock: '5',
    categoryId: '',
    unit: 'unidad'
  });

  const [categories, setCategories] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEdit) loadProduct();
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías');
    }
  };

  const loadProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setForm({
        name: data.name,
        description: data.description || '',
        price: data.price,
        minStock: data.minStock,
        categoryId: data.categoryId || '',
        unit: data.unit || 'unidad'
      });
      setBarcode(data.barcode);
    } catch (error) {
      toast.error('Error al cargar producto');
      navigate('/products');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, form);
        toast.success('Producto actualizado');
      } else {
        const { data } = await api.post('/products', { ...form, stock: 0 });
        toast.success(`Producto creado. Código de barras: ${data.barcode}`);
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/products')}>
          Volver
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </Typography>
      </Box>

      {isEdit && barcode && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={`/api/products/${id}/barcode-image`}
              alt="Código de barras"
              style={{ height: 60 }}
            />
            <Box>
              <Typography variant="body1">Código de Barras: <strong>{barcode}</strong></Typography>
              <Typography variant="caption" color="text.secondary">
                Generado automáticamente al crear el producto
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {!isEdit && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              💡 El <strong>código de barras</strong> se genera automáticamente al crear el producto. 
              El <strong>stock</strong> se ingresa mediante el módulo de Compras y el <strong>costo</strong> se calcula por promedio ponderado.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth required
                  label="Nombre del Producto"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Camisa Polo, Arroz 5lb, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={2}
                  label="Descripción (opcional)"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth required
                  label="Precio de Venta (Q)"
                  name="price"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.price}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Stock Mínimo (para alertas)"
                  name="minStock"
                  type="number"
                  inputProps={{ min: '0' }}
                  value={form.minStock}
                  onChange={handleChange}
                  helperText="Se alerta cuando el stock baje de este número"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth select
                  label="Unidad de Medida"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                >
                  <MenuItem value="unidad">Unidad</MenuItem>
                  <MenuItem value="kg">Kilogramo</MenuItem>
                  <MenuItem value="litro">Litro</MenuItem>
                  <MenuItem value="metro">Metro</MenuItem>
                  <MenuItem value="caja">Caja</MenuItem>
                  <MenuItem value="par">Par</MenuItem>
                  <MenuItem value="docena">Docena</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth select
                  label="Categoría"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <MenuItem value="">Sin categoría</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{ px: 4 }}
                >
                  {loading ? 'Guardando...' : (isEdit ? 'Actualizar Producto' : 'Crear Producto')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
