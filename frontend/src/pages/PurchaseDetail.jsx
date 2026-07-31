import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Chip, Grid, Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../services/api';

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    loadPurchase();
  }, [id]);

  const loadPurchase = async () => {
    try {
      const { data } = await api.get(`/purchases/${id}`);
      setPurchase(data);
    } catch (error) {
      navigate('/purchases');
    }
  };

  if (!purchase) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/purchases')}>
          Volver
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Compra {purchase.purchaseNumber}
        </Typography>
        <Chip
          label={purchase.status}
          color={purchase.status === 'completada' ? 'success' : 'error'}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Información</Typography>
              <Typography>Proveedor: <strong>{purchase.supplier}</strong></Typography>
              <Typography>Registrado por: {purchase.registeredBy?.name}</Typography>
              <Typography>Fecha: {new Date(purchase.createdAt).toLocaleString('es-GT')}</Typography>
              {purchase.notes && <Typography>Notas: {purchase.notes}</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Q{parseFloat(purchase.total).toFixed(2)}
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
              <TableCell>Cantidad</TableCell>
              <TableCell>Costo Unitario</TableCell>
              <TableCell>Total Línea</TableCell>
              <TableCell>Nuevo Costo Prom.</TableCell>
              <TableCell>Stock Actual</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchase.details?.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>{detail.Product?.name}</TableCell>
                <TableCell>{detail.Product?.barcode}</TableCell>
                <TableCell>{detail.quantity}</TableCell>
                <TableCell>Q{parseFloat(detail.unitCost).toFixed(2)}</TableCell>
                <TableCell><strong>Q{parseFloat(detail.lineTotal).toFixed(2)}</strong></TableCell>
                <TableCell>Q{parseFloat(detail.Product?.cost || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={detail.Product?.stock}
                    color="success"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
