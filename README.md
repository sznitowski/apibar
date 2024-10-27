# apibar

Estructura del Backend

server/
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



    
frontend/
  public/
  src/
    components/
      MesaList.tsx
      ProductosMenu.tsx
      PedidosPanel.tsx
      FacturasPanel.tsx
    pages/
      MesasPage.tsx
      ProductosPage.tsx
      PedidosPage.tsx
      FacturasPage.tsx
    services/
      apiService.ts
    App.tsx
    index.tsx





--------------------------------------




Estructura del Frontend

client/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   ├── views/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
├── .env
├── package.json
├── tsconfig-lock.json