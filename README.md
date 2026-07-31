# Sistema de Inventario y Facturación - BIJOU

Sistema web multiusuario para gestión de inventario, facturación con descuentos configurables, lectura de código de barras desde el teléfono e impresión de etiquetas.

## Estructura del Proyecto

```
BIJOU/
├── backend/          # API Node.js + Express + Sequelize
│   └── src/
│       ├── config/         # Configuración de base de datos
│       ├── controllers/    # Lógica de negocio
│       ├── middleware/     # Autenticación JWT
│       ├── models/         # Modelos Sequelize (PostgreSQL)
│       ├── routes/         # Definición de rutas API
│       └── seeds/          # Datos iniciales
├── frontend/         # React + Vite + Material UI
│   └── src/
│       ├── components/     # Componentes reutilizables (Layout, BarcodeScanner)
│       ├── context/        # Estado global (Auth)
│       ├── pages/          # Páginas de la aplicación
│       └── services/       # Cliente HTTP (Axios)
└── README.md
```

## Requisitos Previos

- **Node.js** 18+ (https://nodejs.org)
- **PostgreSQL** 14+ (local o Supabase/Neon gratuito)
- **npm** (viene con Node.js)

## Instalación

### 1. Clonar y configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```bash
copy .env.example .env
```

Editar `.env` con tus datos de PostgreSQL:
```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_billing
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
JWT_SECRET=un_secreto_largo_y_seguro
JWT_EXPIRES_IN=24h
```

### 2. Crear la base de datos

En PostgreSQL:
```sql
CREATE DATABASE inventory_billing;
```

### 3. Ejecutar seed (datos iniciales)

```bash
cd backend
node src/seeds/initialSeed.js
```

Esto crea:
- Usuario admin: `admin@sistema.com` / `admin123`
- Tipos de cliente: Minorista, Mayorista, Empleado
- Descuentos de ejemplo: 10%, 15%, 20%
- Categorías base

### 4. Iniciar el Backend

```bash
cd backend
npm run dev
```

El API corre en `http://localhost:3001`

### 5. Instalar y ejecutar el Frontend

```bash
cd frontend
npm install
npm run dev
```

La app corre en `http://localhost:3000`

## Funcionalidades

### ✅ Inventario
- CRUD de productos con generación automática de código de barras EAN-13
- Categorías configurables
- Alertas de stock bajo
- Movimientos de inventario registrados

### ✅ Facturación (Ventas)
- Escanear código de barras desde la cámara del teléfono
- Buscar productos manualmente por código
- Aplicar descuentos por tipo de cliente
- Descuento stock automáticamente
- Historial de facturas con detalle

### ✅ Descuentos Configurables
- Crear/editar tipos de cliente (Mayorista, Empleado, VIP, etc.)
- Crear/editar tipos de descuento con nombre y porcentaje
- Asignar descuentos a tipos de cliente
- Aplicar al momento de la venta

### ✅ Etiquetas de Código de Barras
- Tamaño: 4cm ancho × 1.5cm alto
- Incluyen: nombre del producto, código de barras EAN-13, precio
- Generar PDF con múltiples etiquetas
- Seleccionar productos y cantidad de copias
- Listas para imprimir en papel adhesivo

### ✅ Multiusuario
- Roles: Admin, Vendedor, Almacenero
- Autenticación JWT
- Permisos por rol

## Lectura de Código de Barras (Teléfono)

1. Abrir la app desde el navegador del teléfono
2. Ir a "Nueva Venta"
3. Tocar "Escanear Código de Barras"
4. Apuntar la cámara al código
5. El producto se agrega automáticamente

**Requisito:** HTTPS en producción (Vercel/Netlify lo proveen gratis) o localhost para desarrollo.

## Deploy Gratuito

| Servicio | Uso |
|----------|-----|
| **Vercel** | Frontend (gratis) |
| **Render** | Backend API (gratis) |
| **Neon** o **Supabase** | PostgreSQL (gratis hasta 500MB) |

## API Endpoints

```
POST   /api/auth/login              Login
POST   /api/auth/register           Registrar usuario (admin)
GET    /api/products                Listar productos
POST   /api/products                Crear producto (genera barcode)
GET    /api/products/barcode/:code  Buscar por código de barras
GET    /api/products/:id/barcode-image  Imagen del código de barras
POST   /api/products/:id/adjust-stock   Ajustar stock
GET    /api/categories              Listar categorías
POST   /api/categories              Crear categoría
GET    /api/discounts/customer-types     Tipos de cliente
POST   /api/discounts/customer-types     Crear tipo de cliente
GET    /api/discounts/discount-types     Tipos de descuento
POST   /api/discounts/discount-types     Crear tipo de descuento
GET    /api/invoices                Listar facturas
POST   /api/invoices                Crear factura (venta)
POST   /api/invoices/:id/cancel     Anular factura
POST   /api/labels/generate         Generar PDF de etiquetas
GET    /api/labels/single/:id       Etiqueta individual (PNG)
```
