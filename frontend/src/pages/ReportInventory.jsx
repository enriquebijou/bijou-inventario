import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Card, CardContent, Grid, Chip, TextField,
  InputAdornment, Button, ButtonGroup
} from '@mui/material';
import { Search, Download, PictureAsPdf } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney, formatNumber } from '../utils/format';

export default function ReportInventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  const totalCostInventory = filtered.reduce(
    (sum, p) => sum + (parseFloat(p.cost || 0) * p.stock), 0
  );
  const totalItems = filtered.reduce((sum, p) => sum + p.stock, 0);

  const handleExportCSV = () => {
    const headers = 'Producto,Código,Categoría,Stock,Costo Unit.,Valor Costo\n';
    const rows = filtered.map(p => {
      const cost = parseFloat(p.cost || 0);
      return `"${p.name}",${p.barcode},"${p.Category?.name || 'Sin categoría'}",${p.stock},${cost.toFixed(2)},${(cost * p.stock).toFixed(2)}`;
    }).join('\n');

    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const handleExportPDF = async () => {
    try {
      const productIds = filtered.map(p => p.id);
      const response = await api.post('/reports/inventory-pdf', { productIds }, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_inventario_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF exportado');
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
        Reporte de Inventario
      </Typography>

      {/* Resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #1a237e' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Productos</Typography>
              <Typography variant="h5" fontWeight="bold">{formatNumber(filtered.length)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #f9a825' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Unidades</Typography>
              <Typography variant="h5" fontWeight="bold">{formatNumber(totalItems)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #e65100' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Valor Total al Costo</Typography>
              <Typography variant="h5" fontWeight="bold">{formatMoney(totalCostInventory)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          sx={{ flexGrow: 1 }}
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
          }}
        />
        <ButtonGroup variant="outlined">
          <Button startIcon={<Download />} onClick={handleExportCSV}>
            CSV
          </Button>
          <Button startIcon={<PictureAsPdf />} onClick={handleExportPDF} color="error">
            PDF
          </Button>
        </ButtonGroup>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="right">Costo Unit.</TableCell>
              <TableCell align="right">Valor Costo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((product) => {
              const cost = parseFloat(product.cost || 0);
              const valueCost = cost * product.stock;

              return (
                <TableRow key={product.id} hover>
                  <TableCell><strong>{product.name}</strong></TableCell>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>{product.Category?.name || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={product.stock}
                      size="small"
                      color={product.stock <= product.minStock ? 'error' : 'success'}
                      sx={{ fontWeight: 'bold', minWidth: 40 }}
                    />
                  </TableCell>
                  <TableCell align="right">{formatMoney(cost)}</TableCell>
                  <TableCell align="right">{formatMoney(valueCost)}</TableCell>
                </TableRow>
              );
            })}
            {/* Totales */}
            <TableRow sx={{ bgcolor: '#e8eaf6' }}>
              <TableCell colSpan={3}><strong>TOTALES</strong></TableCell>
              <TableCell align="center"><strong>{formatNumber(totalItems)}</strong></TableCell>
              <TableCell></TableCell>
              <TableCell align="right"><strong>{formatMoney(totalCostInventory)}</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
