import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Card, CardContent, Grid, TextField, Button, Chip,
  LinearProgress
} from '@mui/material';
import { Download, Person } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney, formatNumber } from '../utils/format';

export default function ReportSales() {
  const [invoices, setInvoices] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      let url = '/invoices';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await api.get(url);
      setInvoices(data);
      setLoaded(true);
    } catch (error) {
      toast.error('Error al cargar ventas');
    }
  };

  const completedInvoices = invoices.filter(inv => inv.status === 'completada');
  const cancelledInvoices = invoices.filter(inv => inv.status === 'anulada');

  const totalSales = completedInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const totalDiscount = completedInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalDiscount), 0);
  const totalSubtotal = completedInvoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal), 0);
  const avgTicket = completedInvoices.length > 0 ? totalSales / completedInvoices.length : 0;

  // Agrupar ventas por día
  const salesByDay = {};
  completedInvoices.forEach(inv => {
    const day = new Date(inv.createdAt).toLocaleDateString('es-GT');
    if (!salesByDay[day]) {
      salesByDay[day] = { count: 0, total: 0 };
    }
    salesByDay[day].count += 1;
    salesByDay[day].total += parseFloat(inv.total);
  });

  // Agrupar ventas por usuario/vendedor
  const salesByUser = {};
  completedInvoices.forEach(inv => {
    const sellerName = inv.seller?.name || 'Sin vendedor';
    if (!salesByUser[sellerName]) {
      salesByUser[sellerName] = { count: 0, total: 0, discount: 0 };
    }
    salesByUser[sellerName].count += 1;
    salesByUser[sellerName].total += parseFloat(inv.total);
    salesByUser[sellerName].discount += parseFloat(inv.totalDiscount);
  });

  // Ordenar usuarios por total de ventas (mayor a menor)
  const sortedUserSales = Object.entries(salesByUser).sort((a, b) => b[1].total - a[1].total);
  const topSellerTotal = sortedUserSales.length > 0 ? sortedUserSales[0][1].total : 1;

  const handleExportCSV = () => {
    const headers = 'Fecha,Nº Factura,Cliente,Vendedor,Subtotal,Descuento,Total,Estado\n';
    const rows = invoices.map(inv => {
      const date = new Date(inv.createdAt).toLocaleString('es-GT');
      return `"${date}",${inv.invoiceNumber},"${inv.customerName}","${inv.seller?.name || ''}",${parseFloat(inv.subtotal).toFixed(2)},${parseFloat(inv.totalDiscount).toFixed(2)},${parseFloat(inv.total).toFixed(2)},${inv.status}`;
    }).join('\n');

    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_ventas_${startDate}_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
        Reporte de Ventas
      </Typography>

      {/* Filtros de fecha */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth type="date" label="Desde"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth type="date" label="Hasta"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" onClick={loadInvoices} fullWidth>
                Buscar
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="outlined" startIcon={<Download />} onClick={handleExportCSV} fullWidth>
                Exportar CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resumen general */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #2e7d32' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Ventas</Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatMoney(totalSales)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #1a237e' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Facturas Emitidas</Typography>
              <Typography variant="h5" fontWeight="bold">{completedInvoices.length}</Typography>
              {cancelledInvoices.length > 0 && (
                <Typography variant="caption" color="error">
                  {cancelledInvoices.length} anuladas
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #f9a825' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Ticket Promedio</Typography>
              <Typography variant="h5" fontWeight="bold">{formatMoney(avgTicket)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #e65100' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Descuentos</Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {formatMoney(totalDiscount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ventas por Usuario */}
      {sortedUserSales.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Person color="primary" />
              <Typography variant="h6" sx={{ color: '#1a237e' }}>Ventas por Vendedor</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vendedor</TableCell>
                    <TableCell align="center">Facturas</TableCell>
                    <TableCell align="right">Descuentos</TableCell>
                    <TableCell align="right">Total Vendido</TableCell>
                    <TableCell sx={{ width: '25%' }}>Participación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUserSales.map(([name, data]) => {
                    const percentage = totalSales > 0 ? (data.total / totalSales) * 100 : 0;
                    return (
                      <TableRow key={name} hover>
                        <TableCell><strong>{name}</strong></TableCell>
                        <TableCell align="center">{data.count}</TableCell>
                        <TableCell align="right">{formatMoney(data.discount)}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">{formatMoney(data.total)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{
                                flexGrow: 1, height: 8, borderRadius: 4,
                                bgcolor: '#e8eaf6',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #1a237e, #f9a825)',
                                  borderRadius: 4
                                }
                              }}
                            />
                            <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 40 }}>
                              {percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Total */}
                  <TableRow sx={{ bgcolor: '#e8eaf6' }}>
                    <TableCell><strong>TOTAL</strong></TableCell>
                    <TableCell align="center"><strong>{completedInvoices.length}</strong></TableCell>
                    <TableCell align="right"><strong>{formatMoney(totalDiscount)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatMoney(totalSales)}</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Ventas por día */}
      {Object.keys(salesByDay).length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>Resumen por Día</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="center">Facturas</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(salesByDay).map(([day, data]) => (
                    <TableRow key={day}>
                      <TableCell>{day}</TableCell>
                      <TableCell align="center">{data.count}</TableCell>
                      <TableCell align="right"><strong>{formatMoney(data.total)}</strong></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Detalle de facturas */}
      <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>Detalle de Facturas</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Nº Factura</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="right">Descuento</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} sx={inv.status === 'anulada' ? { opacity: 0.5 } : {}}>
                <TableCell>{new Date(inv.createdAt).toLocaleDateString('es-GT')}</TableCell>
                <TableCell><strong>{inv.invoiceNumber}</strong></TableCell>
                <TableCell>{inv.customerName}</TableCell>
                <TableCell>{inv.seller?.name || '-'}</TableCell>
                <TableCell align="right">{formatMoney(inv.subtotal)}</TableCell>
                <TableCell align="right">{formatMoney(inv.totalDiscount)}</TableCell>
                <TableCell align="right"><strong>{formatMoney(inv.total)}</strong></TableCell>
                <TableCell>
                  <Chip
                    label={inv.status}
                    size="small"
                    color={inv.status === 'completada' ? 'success' : 'error'}
                  />
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  {loaded ? 'No hay facturas en este período' : 'Cargando...'}
                </TableCell>
              </TableRow>
            )}
            {/* Total */}
            {completedInvoices.length > 0 && (
              <TableRow sx={{ bgcolor: '#e8eaf6' }}>
                <TableCell colSpan={4}><strong>TOTALES (completadas)</strong></TableCell>
                <TableCell align="right"><strong>{formatMoney(totalSubtotal)}</strong></TableCell>
                <TableCell align="right"><strong>{formatMoney(totalDiscount)}</strong></TableCell>
                <TableCell align="right"><strong>{formatMoney(totalSales)}</strong></TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
