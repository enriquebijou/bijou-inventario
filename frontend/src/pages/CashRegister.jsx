import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { LockOpen, Lock, Add, Remove, History } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney } from '../utils/format';

export default function CashRegisterPage() {
  const [register, setRegister] = useState(null);
  const [openAmount, setOpenAmount] = useState('');
  const [closeDialog, setCloseDialog] = useState(false);
  const [actualAmount, setActualAmount] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [movDialog, setMovDialog] = useState(false);
  const [movType, setMovType] = useState('retiro');
  const [movAmount, setMovAmount] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadCurrent();
  }, []);

  const loadCurrent = async () => {
    try {
      const { data } = await api.get('/cash/current');
      setRegister(data.register);
    } catch (error) {
      console.error('Error cargando caja');
    }
  };

  const handleOpen = async () => {
    try {
      await api.post('/cash/open', { openingAmount: parseFloat(openAmount) || 0 });
      toast.success('Caja abierta');
      setOpenAmount('');
      loadCurrent();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al abrir caja');
    }
  };

  const handleClose = async () => {
    try {
      const { data } = await api.post('/cash/close', {
        actualAmount: parseFloat(actualAmount) || 0,
        notes: closeNotes
      });
      toast.success('Caja cerrada');
      setCloseDialog(false);
      setActualAmount('');
      setCloseNotes('');
      setRegister(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cerrar caja');
    }
  };

  const handleMovement = async () => {
    if (!movAmount || parseFloat(movAmount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    try {
      await api.post('/cash/movement', {
        type: movType,
        amount: parseFloat(movAmount),
        description: movDesc
      });
      toast.success(movType === 'retiro' ? 'Retiro registrado' : 'Ingreso registrado');
      setMovDialog(false);
      setMovAmount('');
      setMovDesc('');
      loadCurrent();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/cash/history');
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      toast.error('Error al cargar historial');
    }
  };

  // Si no hay caja abierta, mostrar opción de abrir
  if (!register) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#0a1628' }}>
          Control de Caja
        </Typography>

        <Card sx={{ maxWidth: 500 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LockOpen color="primary" />
              <Typography variant="h6">Abrir Caja</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No hay caja abierta. Ingresa el monto con el que inicias el día.
            </Typography>
            <TextField
              fullWidth
              label="Monto de apertura (Q)"
              type="number"
              value={openAmount}
              onChange={(e) => setOpenAmount(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="secondary" onClick={handleOpen}>
                Abrir Caja
              </Button>
              <Button variant="outlined" startIcon={<History />} onClick={loadHistory}>
                Ver Historial
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Historial */}
        {showHistory && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Historial de Cajas</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha Apertura</TableCell>
                    <TableCell>Abrió</TableCell>
                    <TableCell align="right">Apertura</TableCell>
                    <TableCell align="right">Ventas</TableCell>
                    <TableCell align="right">Retiros</TableCell>
                    <TableCell align="right">Esperado</TableCell>
                    <TableCell align="right">Real</TableCell>
                    <TableCell align="right">Diferencia</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map(h => (
                    <TableRow key={h.id}>
                      <TableCell>{new Date(h.createdAt).toLocaleDateString('es-GT')}</TableCell>
                      <TableCell>{h.openedByUser?.name}</TableCell>
                      <TableCell align="right">{formatMoney(h.openingAmount)}</TableCell>
                      <TableCell align="right">{formatMoney(h.salesTotal)}</TableCell>
                      <TableCell align="right">{formatMoney(h.withdrawals)}</TableCell>
                      <TableCell align="right">{formatMoney(h.expectedAmount)}</TableCell>
                      <TableCell align="right">{formatMoney(h.actualAmount)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={formatMoney(h.difference)}
                          size="small"
                          color={parseFloat(h.difference) >= 0 ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    );
  }

  // Caja abierta - mostrar estado
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#0a1628' }}>
        Control de Caja
      </Typography>

      {/* Resumen de caja */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #0a1628' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Apertura</Typography>
              <Typography variant="h5" fontWeight={500}>{formatMoney(register.openingAmount)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #1b5e20' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Ventas</Typography>
              <Typography variant="h5" fontWeight={500} color="success.main">
                {formatMoney(register.salesTotal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #b71c1c' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Retiros</Typography>
              <Typography variant="h5" fontWeight={500} color="error.main">
                {formatMoney(register.withdrawals)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ borderLeft: '4px solid #d4a017' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">En Caja (esperado)</Typography>
              <Typography variant="h5" fontWeight={500}>
                {formatMoney(register.expectedAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Acciones */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Remove />}
          onClick={() => { setMovType('retiro'); setMovDialog(true); }}
        >
          Registrar Retiro
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<Add />}
          onClick={() => { setMovType('ingreso'); setMovDialog(true); }}
        >
          Registrar Ingreso
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<Lock />}
          onClick={() => setCloseDialog(true)}
        >
          Cerrar Caja
        </Button>
      </Box>

      {/* Movimientos del día */}
      <Typography variant="h6" gutterBottom sx={{ color: '#0a1628' }}>
        Movimientos de esta caja
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Hora</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Usuario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {register.movements?.map(mov => (
              <TableRow key={mov.id}>
                <TableCell>
                  {new Date(mov.createdAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={mov.type}
                    size="small"
                    color={mov.type === 'venta' ? 'success' : mov.type === 'retiro' ? 'error' : 'info'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={500}>
                    {mov.type === 'retiro' ? '-' : '+'}{formatMoney(mov.amount)}
                  </Typography>
                </TableCell>
                <TableCell>{mov.description || '-'}</TableCell>
                <TableCell>{mov.User?.name || '-'}</TableCell>
              </TableRow>
            ))}
            {(!register.movements || register.movements.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No hay movimientos aún
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog cerrar caja */}
      <Dialog open={closeDialog} onClose={() => setCloseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cerrar Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Monto esperado en caja: <strong>{formatMoney(register.expectedAmount)}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Monto real contado (Q)"
            type="number"
            value={actualAmount}
            onChange={(e) => setActualAmount(e.target.value)}
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
            required
          />
          <TextField
            fullWidth multiline rows={2}
            label="Notas (opcional)"
            value={closeNotes}
            onChange={(e) => setCloseNotes(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog movimiento */}
      <Dialog open={movDialog} onClose={() => setMovDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {movType === 'retiro' ? 'Registrar Retiro de Efectivo' : 'Registrar Ingreso de Efectivo'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Monto (Q)"
            type="number"
            value={movAmount}
            onChange={(e) => setMovAmount(e.target.value)}
            margin="normal"
            inputProps={{ min: 0.01, step: 0.01 }}
            required
          />
          <TextField
            fullWidth
            label="Descripción / Razón"
            value={movDesc}
            onChange={(e) => setMovDesc(e.target.value)}
            margin="normal"
            placeholder={movType === 'retiro' ? 'Ej: Pago de proveedor, gasto...' : 'Ej: Cambio adicional...'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMovDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color={movType === 'retiro' ? 'error' : 'success'}
            onClick={handleMovement}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
