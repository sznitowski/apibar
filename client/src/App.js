// eslint-disable-next-line
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductOperations from './components/views/ProductOperations';
import MesaOperations from './components/views/MesaOperations';
import Sidebar from './components/sidebar/Sidebar'; // Importa el componente Sidebar
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Asegúrate de tener el CSS de la aplicación

function App() {
  return (
    <BrowserRouter>
      <Sidebar /> {/* Agrega el sidebar aquí */}
      <div className="content-wrapper"> {/* Usa content-wrapper aquí */}
        <div className="table-container"> {/* Esta clase ayudará a manejar la tabla */}
          <Routes>
            <Route path='/Productos' element={<ProductOperations />} exact />
            <Route path='/Mesas' element={<MesaOperations />} exact />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
