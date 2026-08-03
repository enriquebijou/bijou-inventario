import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Autocomplete, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Grid, Button
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney, formatNumber } from '../utils/format';

export default function Kardex() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [kardexData, setKardexData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadProducts();
    // Fechas por defecto: mes actual
    const now = new Date();
    setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos');
    }
  };

  const loadKardex = async (productId) => {
    try {
      let url = `/kardex/${productId}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await api.get(url);
      setKardexData(data);
    } catch (error) {
      toast.error('Error al cargar kardex');
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product) {
      loadKardex(product.id);
    } else {
      setKardexData(null);
    }
  };

  const handleFilter = () => {
    if (selectedProduct) {
      loadKardex(selectedProduct.id);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedProduct) return;
    try {
      let url = `/kardex/${selectedProduct.id}/pdf`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await api.get(url, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `kardex_${selectedProduct.name.replace(/\s/g, '_')}_${startDate}_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      toast.success('PDF exportado');
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  const typeLabel = (type) => {
    switch (type) {
      case 'entrada': return { label: 'ENTRADA', color: 'success' };
      case 'salida': return { label: 'SALIDA', color: 'error' };
      case 'ajuste': return { label: 'AJUSTE', color: 'warning' };
      default: return { label: type, color: 'default' };
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#0a1628' }}>
        Kardex de Producto
      </Typography>

      {/* Selector de producto y filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona un producto y rango de fechas para ver su historial de movimientos.
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.name} | ${option.barcode}`}
                onChange={(_, product) => handleSelectProduct(product)}
                renderInput={(params) => (
                  <TextField {...params} label="Buscar producto" size="small" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                fullWidth type="date" label="Desde" size="small"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                fullWidth type="date" label="Hasta" size="small"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <Button variant="contained" fullWidth onClick={handleFilter} disabled={!selectedProduct}>
                Filtrar
              </Button>
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <Button
                variant="outlined" color="error" fullWidth
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                disabled={!kardexData}
              >
                PDF
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Info del producto */}
      {kardexData && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderLeft: '4px solid #0a1628' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Producto</Typography>
                  <Typography variant="h6" fontWeight={500}>{kardexData.product.name}</Typography>
                  <Typography variant="caption">{kardexData.product.barcode}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderLeft: '4px solid #d4a017' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Stock Actual</Typography>
                  <Typography variant="h5" fontWeight={500}>
                    {formatNumber(kardexData.product.currentStock)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderLeft: '4px solid #1b5e20' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Costo Promedio</Typography>
                  <Typography variant="h5" fontWeight={500}>
                    {formatMoney(kardexData.product.cost)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de movimientos */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="center">Stock Anterior</TableCell>
                  <TableCell align="center">Stock Nuevo</TableCell>
                  <TableCell>Razón</TableCell>
                  <TableCell>Usuario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kardexData.movements.map((mov) => {
                  const { label, color } = typeLabel(mov.type);
                  return (
                    <TableRow key={mov.id} hover>
                      <TableCell>
                        {new Date(mov.date).toLocaleString('es-GT', { 
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip label={label} color={color} size="small" sx={{ fontWeight: 500 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={500}>
                          {mov.type === 'entrada' ? '+' : '-'}{mov.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{mov.previousStock}</TableCell>
                      <TableCell align="center"><strong>{mov.newStock}</strong></TableCell>
                      <TableCell>{mov.reason || '-'}</TableCell>
                      <TableCell>{mov.user}</TableCell>
                    </TableRow>
                  );
                })}
                {kardexData.movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No hay movimientos en este rango de fechas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
