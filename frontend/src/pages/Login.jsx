import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState('BIJOU');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL || '';
    fetch(`${baseURL}/api/public/store-info`)
      .then(r => r.json())
      .then(data => setStoreName(data.storeName))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0a1628 0%, #0d1b3e 40%, #1a237e 100%)'
      }}
    >
      <Card sx={{ 
        maxWidth: 400, width: '100%', mx: 2, borderRadius: 3, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Header dorado/negro */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #0a1628 0%, #1a237e 100%)', 
          py: 4, px: 4, textAlign: 'center',
          borderBottom: '2px solid #d4a017'
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 500, color: '#d4a017', letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            {storeName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, letterSpacing: '0.1em', fontSize: '0.7rem' }}>
            SISTEMA DE INVENTARIO Y FACTURACIÓN
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{ 
                mt: 3, py: 1.5,
                background: 'linear-gradient(135deg, #d4a017 0%, #b8860b 100%)',
                color: '#0a1628',
                fontWeight: 500,
                letterSpacing: '0.05em',
                '&:hover': {
                  background: 'linear-gradient(135deg, #e6c347 0%, #d4a017 100%)'
                }
              }}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
