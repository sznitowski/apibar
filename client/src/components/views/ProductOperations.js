import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../actions/productActions";

function ProductOperations({
  loading,
  products,
  error,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prevState) => ({ ...prevState, [name]: value }));
  };

  const toggleModal = () => setShowModal(!showModal);

  const handleSaveProduct = () => {
    if (selectedProduct.id) {
      updateProduct(selectedProduct.id, selectedProduct);
    } else {
      createProduct(selectedProduct);
    }
    toggleModal();
    setSelectedProduct({
      id: null,
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
  };

  return (
    <div className="p-6">
      {/* Header con título y botones */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
          Productos
        </h2>
        <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => {
              setSelectedProduct({
                id: null,
                name: "",
                description: "",
                price: "",
                stock: "",
                category: "",
              });
              toggleModal();
            }}
            className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Nueva Producto
          </button>
          <button
            onClick={() => console.log("Descargar Excel")}
            className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            Descargar Excel
          </button>
          <button
            onClick={() => console.log("Importar Excel")}
            className="px-3 py-1 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700 transition"
          >
            Importar Excel
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-700">
        <table className="min-w-full bg-gray-900 text-sm text-white">
          <thead className="text-xs uppercase bg-gray-800 text-gray-400">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-left">Descripción</th>
              <th className="px-6 py-3 text-left">Precio</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-700 hover:bg-gray-800"
              >
                <td className="px-6 py-4 font-mono text-green-400">
                  #{product.id}
                </td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4 text-gray-300">
                  {product.description}
                </td>
                <td className="px-6 py-4 text-blue-400 font-semibold">
                  ${parseFloat(product.price).toFixed(2)}
                </td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-700 text-white capitalize">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-2">
                  <PencilSquare
                    className="text-yellow-400 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      toggleModal();
                    }}
                  />
                  <Trash
                    className="text-red-400 cursor-pointer"
                    onClick={() => deleteProduct(product.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal (sin cambios) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md text-white">
            <h2 className="text-lg font-semibold mb-4">
              {selectedProduct.id ? "Editar producto" : "Agregar producto"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={selectedProduct.name}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full border px-3 py-2 rounded bg-gray-700"
              />
              <input
                type="text"
                name="description"
                value={selectedProduct.description}
                onChange={handleChange}
                placeholder="Descripción"
                className="w-full border px-3 py-2 rounded bg-gray-700"
              />
              <input
                type="number"
                name="price"
                value={selectedProduct.price}
                onChange={handleChange}
                placeholder="Precio"
                className="w-full border px-3 py-2 rounded bg-gray-700"
              />
              <input
                type="number"
                name="stock"
                value={selectedProduct.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="w-full border px-3 py-2 rounded bg-gray-700"
              />
              <input
                type="text"
                name="category"
                value={selectedProduct.category}
                onChange={handleChange}
                placeholder="Categoría"
                className="w-full border px-3 py-2 rounded bg-gray-700"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                onClick={toggleModal}
              >
                Cerrar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSaveProduct}
              >
                {selectedProduct.id ? "Guardar cambios" : "Agregar producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  loading: state.products.loading,
  products: state.products.products,
  error: state.products.error,
});

const mapDispatchToProps = {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductOperations);
