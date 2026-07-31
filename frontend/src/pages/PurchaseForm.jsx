import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Grid, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Divider, InputAdornment, Autocomplete
} from '@mui/material';
import { Delete, Add, Save, ArrowBack, Search } from '@mui/icons-material';
import BarcodeScanner from '../components/BarcodeScanner';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PurchaseForm() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [products, setProducts] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos');
    }
  };

  const addProductByBarcode = async (barcode) => {
    try {
      const { data: product } = await api.get(`/products/barcode/${barcode}`);
      addProductToList(product);
      setSearchCode('');
    } catch (error) {
      toast.error('Producto no encontrado con ese código');
    }
  };

  const addProductToList = (product) => {
    const existingIndex = items.findIndex(item => item.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].lineTotal = updated[existingIndex].quantity * updated[existingIndex].unitCost;
      setItems(updated);
    } else {
      setItems([...items, {
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        currentStock: product.stock,
        currentCost: parseFloat(product.cost) || 0,
        quantity: 1,
        unitCost: parseFloat(product.cost) || 0,
        lineTotal: parseFloat(product.cost) || 0
      }]);
    }
    toast.success(`Agregado: ${product.name}`);
  };

  const handleScan = (barcode) => {
    addProductByBarcode(barcode);
  };

  const handleManualSearch = () => {
    if (searchCode.trim()) {
      addProductByBarcode(searchCode.trim());
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = parseFloat(value) || 0;
    updated[index].lineTotal = updated[index].quantity * updated[index].unitCost;
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getTotal = () => items.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    // Validar que todos tengan costo
    const invalidItems = items.filter(item => item.unitCost <= 0);
    if (invalidItems.length > 0) {
      toast.error('Todos los productos deben tener un costo mayor a 0');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        supplier: supplier || 'Proveedor General',
        notes,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
        }))
      };

      const { data } = await api.post('/purchases', payload);
      toast.success(`Compra ${data.purchaseNumber} registrada. Stock actualizado.`);
      navigate('/purchases');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar compra');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/purchases')}>
          Volver
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Registrar Compra / Ingreso de Mercadería
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Datos del proveedor */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Datos del Proveedor</Typography>
              <TextField
                fullWidth
                label="Nombre del Proveedor"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Proveedor General"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth multiline rows={2}
                label="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Agregar productos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Agregar Producto</Typography>
              
              <BarcodeScanner onScan={handleScan} />

              <Divider sx={{ my: 2 }}>o buscar por código</Divider>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Código de barras"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                  }}
                />
                <Button variant="contained" onClick={handleManualSearch}>
                  <Add />
                </Button>
              </Box>

              <Divider sx={{ my: 2 }}>o seleccionar de la lista</Divider>

              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.name} (${option.barcode})`}
                onChange={(_, product) => { if (product) addProductToList(product); }}
                renderInput={(params) => <TextField {...params} label="Buscar producto por nombre" />}
                value={null}
                blurOnSelect
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de productos */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Stock Actual</TableCell>
                  <TableCell>Costo Actual</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Costo Unitario (Q)</TableCell>
                  <TableCell>Total Línea</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.barcode}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>Q{item.currentCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        inputProps={{ min: 1 }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                        inputProps={{ min: 0.01, step: 0.01 }}
                        sx={{ width: 100 }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">Q</InputAdornment>
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Q{item.lineTotal.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => removeItem(index)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      Agrega productos escaneando o buscando
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Total y botón */}
        {items.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    El costo de cada producto se actualizará automáticamente con el promedio ponderado.
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Total Compra: Q{getTotal().toFixed(2)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSubmit}
                  disabled={processing}
                >
                  {processing ? 'Registrando...' : 'Registrar Compra'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
