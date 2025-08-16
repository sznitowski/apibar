# apibar

# ------------------ Estructura del Backend ------------------

<server/>
├── node_modules/
├── src/
│   ├── controllers/
│   ├      mesaController.ts
│   ├      productoController.ts
│   ├      pedidoController.ts
│   ├      facturaController.ts
│   ├── Models/
│   ├      mesaModel.ts
│   ├      productoModel.ts
│   ├      pedidoModel.ts
│   ├      facturaModel.ts
│   ├── routes/
│   ├      mesaRoutes.ts
│   ├      productoRoutes.ts
│   ├      pedidoRoutes.ts
│   ├      facturaRoutes.ts
│   ├── config/
│   ├      database.ts
│   ├      logger.ts
│   ├── app.ts
├── .env
├── package.json
├── tsconfig.json

# ------------------ Estructura del Frontend ------------------

<frontend/>
  public/
  src/
   api/auth.js
  pages/Login.jsx
    components/
      MesaList.tsx
      ProductosMenu.tsx
      PedidosPanel.tsx
      FacturasPanel.tsx
 VentasView/
├── VentasView.jsx         # componente principal
├── VentasLista.jsx        # lista de ventas (resumen por venta)
├── ConsumoDetalle.jsx     # lista detallada de productos por venta
├── StockResumen.jsx       # stock y total vendido

    services/
      apiService.ts
    App.tsx
    index.tsx

<Base de datos>
<Tablas>

---

🔁 Flujo de funcionamiento
Usuario se sienta → se crea un venta con id_mesa y fecha_inicio.

Se van cargando productos a través de detalle_venta.

Al presionar "Pagar", se:

Calcula costo_total.

Se guarda tipo_pago.

Se registra fecha_fin.

Se calcula tiempo_uso.

✅ Ventajas
Tenés historial completo de ventas.

Podés hacer reportes por fecha, por producto, por tipo de pago.

Podés incluso agregar descuentos, propinas o mozos en el futuro.
