import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Typography, Box, Alert, AlertTitle,
  List, ListItem, ListItemText, Chip, Button
} from '@mui/material';
import { Inventory, Receipt, Warning, TrendingUp, ShoppingCart } from '@mui/icons-material';
import api from '../services/api';
import { formatMoney, formatNumber } from '../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    todayInvoices: 0,
    todaySales: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadAlerts();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, lowStockRes, invoicesRes] = await Promise.all([
        api.get('/products'),
        api.get('/products?lowStock=true'),
        api.get('/invoices')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayInvoices = invoicesRes.data.filter(
        inv => inv.createdAt.startsWith(today) && inv.status === 'completada'
      );

      setStats({
        totalProducts: productsRes.data.length,
        lowStockProducts: lowStockRes.data.length,
        todayInvoices: todayInvoices.length,
        todaySales: todayInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0)
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data } = await api.get('/settings/alerts/low-stock');
      setLowStockItems(data.products || []);
    } catch (error) {
      console.error('Error cargando alertas');
    }
  };

  const cards = [
    { title: 'Productos', value: formatNumber(stats.totalProducts), icon: <Inventory sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #0a1628 0%, #1a237e 100%)' },
    { title: 'Stock Bajo', value: formatNumber(stats.lowStockProducts), icon: <Warning sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)' },
    { title: 'Ventas Hoy', value: formatNumber(stats.todayInvoices), icon: <Receipt sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' },
    { title: 'Total Hoy', value: formatMoney(stats.todaySales), icon: <TrendingUp sx={{ fontSize: 28 }} />, gradient: 'linear-gradient(135deg, #9e7700 0%, #d4a017 100%)' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#0a1628' }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card sx={{ 
              background: card.gradient,
              color: '#fff',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 1.2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Alertas de stock bajo */}
        {lowStockItems.length > 0 && (
          <Grid item xs={12}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2, 
                borderLeft: '4px solid #d4a017',
                '& .MuiAlert-icon': { color: '#d4a017' }
              }}
            >
              <AlertTitle sx={{ fontWeight: 500 }}>
                Alerta de Stock Bajo ({lowStockItems.length} productos)
              </AlertTitle>
              Los siguientes productos necesitan reabastecimiento
            </Alert>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#0a1628' }}>
                    Productos con Stock Bajo
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<ShoppingCart />}
                    onClick={() => navigate('/purchases/new')}
                  >
                    Registrar Compra
                  </Button>
                </Box>
                <List dense>
                  {lowStockItems.slice(0, 10).map((item) => (
                    <ListItem key={item.id} divider sx={{ py: 1 }}>
                      <ListItemText
                        primary={<Typography fontWeight={500}>{item.name}</Typography>}
                        secondary={`Categoría: ${item.category} | Código: ${item.barcode}`}
                      />
                      <Chip
                        label={item.urgency === 'agotado' ? 'AGOTADO' : `Stock: ${item.stock}`}
                        color={item.urgency === 'agotado' ? 'error' : 'warning'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Mín: {item.minStock}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
