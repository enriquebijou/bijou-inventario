import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Button, Alert } from '@mui/material';
import { CameraAlt, Stop } from '@mui/icons-material';

export default function BarcodeScanner({ onScan, onError }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  const startScanning = async () => {
    try {
      setError('');
      const html5QrCode = new Html5Qrcode('barcode-scanner');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Cámara trasera
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.777
        },
        (decodedText) => {
          // Código encontrado
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Silenciar errores de escaneo continuo
        }
      );

      setScanning(true);
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      if (onError) onError(err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignorar errores al detener
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {!scanning ? (
          <Button
            variant="contained"
            startIcon={<CameraAlt />}
            onClick={startScanning}
            color="primary"
          >
            Escanear Código de Barras
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Stop />}
            onClick={stopScanning}
            color="error"
          >
            Detener Escáner
          </Button>
        )}
      </Box>

      <Box
        id="barcode-scanner"
        ref={containerRef}
        sx={{
          width: '100%',
          maxWidth: 400,
          minHeight: scanning ? 250 : 0,
          border: scanning ? '2px solid #1976d2' : 'none',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />
    </Box>
  );
}
