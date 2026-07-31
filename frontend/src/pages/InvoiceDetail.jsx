import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Chip, Grid, Divider
} from '@mui/material';
import { ArrowBack, Print } from '@mui/icons-material';
import api from '../services/api';
import { formatMoney } from '../utils/format';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
    } catch (error) {
      navigate('/invoices');
    }
  };

  if (!invoice) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/invoices')}>
          Volver
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Factura {invoice.invoiceNumber}
        </Typography>
        <Chip
          label={invoice.status}
          color={invoice.status === 'completada' ? 'success' : 'error'}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Información General</Typography>
              <Typography>Cliente: <strong>{invoice.customerName}</strong></Typography>
              <Typography>Vendedor: {invoice.seller?.name}</Typography>
              <Typography>
                Fecha: {new Date(invoice.createdAt).toLocaleString('es-GT')}
              </Typography>
              {invoice.notes && <Typography>Notas: {invoice.notes}</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Totales</Typography>
              <Typography>Subtotal: {formatMoney(invoice.subtotal)}</Typography>
              <Typography color="error">
                Descuento: -{formatMoney(invoice.totalDiscount)}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                Total: {formatMoney(invoice.total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Código</TableCell>
              <TableCell align="right">Precio Unit.</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell>Descuento</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.details?.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>{detail.Product?.name}</TableCell>
                <TableCell>{detail.Product?.barcode}</TableCell>
                <TableCell align="right">{formatMoney(detail.unitPrice)}</TableCell>
                <TableCell align="center">{detail.quantity}</TableCell>
                <TableCell>
                  {detail.DiscountType ? (
                    <Chip
                      label={`${detail.DiscountType.name} (${detail.discountPercentage}%)`}
                      size="small"
                      color="warning"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell align="right"><strong>{formatMoney(detail.lineTotal)}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
          Imprimir
        </Button>
      </Box>
    </Box>
  );
}
