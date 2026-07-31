import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Button
} from '@mui/material';
import { Visibility, Cancel, Add } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney } from '../utils/format';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const { data } = await api.get('/purchases');
      setPurchases(data);
    } catch (error) {
      toast.error('Error al cargar compras');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Anular esta compra? Se descontará el stock ingresado.')) return;
    try {
      await api.post(`/purchases/${id}/cancel`);
      toast.success('Compra anulada');
      loadPurchases();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al anular');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Compras / Ingreso de Mercadería</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/purchases/new')}
        >
          Nueva Compra
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº Compra</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Registrado por</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell><strong>{purchase.purchaseNumber}</strong></TableCell>
                <TableCell>{purchase.supplier}</TableCell>
                <TableCell>{purchase.registeredBy?.name || '-'}</TableCell>
                <TableCell>{formatMoney(purchase.total)}</TableCell>
                <TableCell>
                  <Chip
                    label={purchase.status}
                    color={purchase.status === 'completada' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(purchase.createdAt).toLocaleDateString('es-GT')}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => navigate(`/purchases/${purchase.id}`)}>
                    <Visibility />
                  </IconButton>
                  {purchase.status === 'completada' && (
                    <IconButton color="error" onClick={() => handleCancel(purchase.id)}>
                      <Cancel />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay compras registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
