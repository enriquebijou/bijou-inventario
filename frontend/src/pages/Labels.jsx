import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, TextField, InputAdornment, Card, CardContent
} from '@mui/material';
import { Print, Search, SelectAll } from '@mui/icons-material';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Labels() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [copies, setCopies] = useState(1);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);

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

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(p => p.id));
    }
  };

  const handleGenerate = async () => {
    if (selected.length === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/labels/generate', {
        productIds: selected,
        copies: parseInt(copies) || 1
      }, { responseType: 'blob' });

      // Descargar PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'etiquetas.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF de etiquetas generado');
    } catch (error) {
      toast.error('Error al generar etiquetas');
    } finally {
      setGenerating(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Imprimir Etiquetas de Código de Barras
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selecciona los productos y genera un PDF con etiquetas de 4cm × 1.5cm listas para imprimir.
            Cada etiqueta incluye el nombre del producto, código de barras y precio.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <TextField
              label="Copias por producto"
              type="number"
              size="small"
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              inputProps={{ min: 1, max: 100 }}
              sx={{ width: 160 }}
            />
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handleGenerate}
              disabled={generating || selected.length === 0}
            >
              {generating ? 'Generando...' : `Generar PDF (${selected.length} productos)`}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <TextField
        fullWidth
        placeholder="Buscar producto por nombre o código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filtered.length}
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onChange={toggleAll}
                />
              </TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Código de Barras</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Vista Previa</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id} selected={selected.includes(product.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>Q{parseFloat(product.price).toFixed(2)}</TableCell>
                <TableCell>
                  <img
                    src={`/api/labels/single/${product.id}`}
                    alt="barcode"
                    style={{ height: 30 }}
                    onError={(e) => { e.target.style.display = 'none'; }}
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
