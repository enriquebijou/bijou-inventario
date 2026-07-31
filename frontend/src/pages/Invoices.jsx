import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, TextField, Grid, Button
} from '@mui/material';
import { Visibility, Cancel } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney } from '../utils/format';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      let url = '/invoices';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const { data } = await api.get(url);
      setInvoices(data);
    } catch (error) {
      toast.error('Error al cargar facturas');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Anular esta factura? Se devolverá el stock.')) return;
    try {
      await api.post(`/invoices/${id}/cancel`);
      toast.success('Factura anulada');
      loadInvoices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al anular');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#0a1628' }}>
        Facturas
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth type="date" label="Desde"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth type="date" label="Hasta"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button variant="contained" onClick={loadInvoices} fullWidth>
            Filtrar
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº Factura</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell><strong>{inv.invoiceNumber}</strong></TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell>{inv.seller?.name || '-'}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={500}>{formatMoney(inv.total)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={inv.status}
                    color={inv.status === 'completada' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(inv.createdAt).toLocaleDateString('es-GT')}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => navigate(`/invoices/${inv.id}`)} size="small">
                    <Visibility />
                  </IconButton>
                  {inv.status === 'completada' && (
                    <IconButton color="error" onClick={() => handleCancel(inv.id)} size="small">
                      <Cancel />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
