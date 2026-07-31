import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Typography, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search, QrCode } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney, formatNumber } from '../utils/format';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      toast.error('Error al cargar productos');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto eliminado');
      loadProducts();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#0a1628' }}>
          Productos
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Add />}
          onClick={() => navigate('/products/new')}
        >
          Nuevo Producto
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar por nombre o código de barras..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código de Barras</TableCell>
              <TableCell align="right">Costo</TableCell>
              <TableCell align="right">Precio Venta</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell><strong>{product.name}</strong></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <QrCode fontSize="small" color="primary" />
                    <Typography variant="body2">{product.barcode}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{formatMoney(product.cost || 0)}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={500} color="secondary.dark">
                    {formatMoney(product.price)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={formatNumber(product.stock)}
                    color={product.stock <= product.minStock ? 'error' : 'success'}
                    size="small"
                    sx={{ fontWeight: 500, minWidth: 40 }}
                  />
                </TableCell>
                <TableCell>{product.Category?.name || '-'}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => navigate(`/products/${product.id}/edit`)} color="primary" size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.id)} color="error" size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
