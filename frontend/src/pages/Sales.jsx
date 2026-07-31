import { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Grid, Typography, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, MenuItem, Divider, InputAdornment, Autocomplete
} from '@mui/material';
import { Delete, PointOfSale, Search } from '@mui/icons-material';
import BarcodeScanner from '../components/BarcodeScanner';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoney } from '../utils/format';

export default function Sales() {
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [discountTypes, setDiscountTypes] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadDiscountTypes();
    loadAllProducts();
  }, []);

  const loadDiscountTypes = async () => {
    try {
      const { data } = await api.get('/discounts/discount-types');
      setDiscountTypes(data);
    } catch (error) {
      console.error('Error cargando descuentos');
    }
  };

  const loadAllProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setAllProducts(data);
    } catch (error) {
      console.error('Error cargando productos');
    }
  };

  const addProduct = (product) => {
    if (!product) return;

    const existingIndex = items.findIndex(item => item.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      recalculateLine(updated, existingIndex);
      setItems(updated);
    } else {
      const newItem = {
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        unitPrice: parseFloat(product.price),
        quantity: 1,
        discountTypeId: '',
        discountPercentage: 0,
        lineTotal: parseFloat(product.price),
        stock: product.stock
      };
      setItems([...items, newItem]);
    }
    toast.success(`Agregado: ${product.name}`);
  };

  const addProductByBarcode = async (barcode) => {
    try {
      const { data: product } = await api.get(`/products/barcode/${barcode}`);
      addProduct(product);
    } catch (error) {
      toast.error('Producto no encontrado con ese código');
    }
  };

  const handleScan = (barcode) => {
    addProductByBarcode(barcode);
  };

  const recalculateLine = (itemsList, index) => {
    const item = itemsList[index];
    const subtotal = item.unitPrice * item.quantity;
    const discount = (subtotal * item.discountPercentage) / 100;
    item.lineTotal = subtotal - discount;
  };

  const updateQuantity = (index, quantity) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, parseInt(quantity) || 1);
    recalculateLine(updated, index);
    setItems(updated);
  };

  const updateDiscount = (index, discountTypeId) => {
    const updated = [...items];
    updated[index].discountTypeId = discountTypeId;
    
    if (discountTypeId) {
      const discount = discountTypes.find(d => d.id === parseInt(discountTypeId));
      updated[index].discountPercentage = discount ? parseFloat(discount.percentage) : 0;
    } else {
      updated[index].discountPercentage = 0;
    }
    
    recalculateLine(updated, index);
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getSubtotal = () => items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const getTotalDiscount = () => items.reduce((sum, item) => {
    const subtotal = item.unitPrice * item.quantity;
    return sum + (subtotal * item.discountPercentage / 100);
  }, 0);
  const getTotal = () => getSubtotal() - getTotalDiscount();

  const handleCreateInvoice = async () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        customerName: customerName || 'Cliente General',
        customerTypeId: null,
        notes,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discountTypeId: item.discountTypeId || null
        }))
      };

      const { data } = await api.post('/invoices', payload);
      toast.success(`Factura ${data.invoiceNumber} creada`);
      
      setItems([]);
      setCustomerName('');
      setNotes('');
      loadAllProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear factura');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#0a1628' }}>
        Nueva Venta
      </Typography>

      <Grid container spacing={3}>
        {/* Cliente y escáner */}
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cliente</Typography>
              <TextField
                fullWidth
                label="Nombre del Cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Cliente General"
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Agregar Producto</Typography>
              
              <BarcodeScanner onScan={handleScan} />

              <Divider sx={{ my: 2 }}>o buscar por nombre / código</Divider>

              <Autocomplete
                options={allProducts}
                getOptionLabel={(option) => `${option.name} | ${option.barcode} | ${formatMoney(option.price)}`}
                filterOptions={(options, { inputValue }) => {
                  const term = inputValue.toLowerCase();
                  return options.filter(p =>
                    p.name.toLowerCase().includes(term) ||
                    p.barcode.includes(term)
                  ).slice(0, 10);
                }}
                onChange={(_, product) => { if (product) addProduct(product); }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" fontWeight={500}>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Código: {option.barcode} | Precio: {formatMoney(option.price)} | Stock: {option.stock}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar por nombre o código"
                    placeholder="Escribe al menos 2 letras..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start"><Search /></InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                value={null}
                blurOnSelect
                clearOnBlur
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
                  <TableCell>Precio Unit.</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Descuento</TableCell>
                  <TableCell>Total Línea</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.barcode} | Stock: {item.stock}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatMoney(item.unitPrice)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                        inputProps={{ min: 1, max: item.stock }}
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={item.discountTypeId}
                        onChange={(e) => updateDiscount(index, e.target.value)}
                        sx={{ width: 150 }}
                      >
                        <MenuItem value="">Sin descuento</MenuItem>
                        {discountTypes.map(d => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.name} ({d.percentage}%)
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {formatMoney(item.lineTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => removeItem(index)} size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      Escanea o busca productos para agregarlos a la venta
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Totales y acciones */}
        {items.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth multiline rows={2}
                      label="Notas (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography>Subtotal: <strong>{formatMoney(getSubtotal())}</strong></Typography>
                    <Typography color="error">
                      Descuento: -{formatMoney(getTotalDiscount())}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                      Total: {formatMoney(getTotal())}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      color="secondary"
                      startIcon={<PointOfSale />}
                      onClick={handleCreateInvoice}
                      disabled={processing}
                      sx={{ py: 1.5 }}
                    >
                      {processing ? 'Procesando...' : 'Facturar Venta'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
