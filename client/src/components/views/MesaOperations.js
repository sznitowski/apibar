import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { connect } from "react-redux";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import {
  fetchMesasConsumo,
  createMesa,
  updateMesa,
  deleteMesa,
  assignProductsToMesa,
  fetchMesas,
  setTempMesaData,
  clearTempMesaData,
  setAllTempMesaData,
} from "../actions/mesaActions";
import Alert from "../alert/Alert";
import { fetchProducts } from "../actions/productActions";
import clsx from "clsx";

function MesaOperations({
  loading,
  mesas,
  products,
  error,
  consumoTemporal,
  fetchMesasConsumo,
  fetchProducts,
  fetchMesas,
  createMesa,
  updateMesa,
  deleteMesa,
  assignProductsToMesa,
  setTempMesaData,
  clearTempMesaData,
  setAllTempMesaData,
}) {
  const [showModal, setShowModal] = useState(false);
  const [totalConsumo, setTotalConsumo] = useState("0.00");
  const [tiempoOcupada, setTiempoOcupada] = useState(0);
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState({
    id: null,
    capacidad: "",
    selectedProducts: [],
  });
  const [tipoPago, setTipoPago] = useState("efectivo");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const timerRef = useRef(null);
  const latestMesaRef = useRef(selectedMesa);
  const latestTotalRef = useRef(totalConsumo);

  const [isCardView, setIsCardView] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchMesasConsumo();
    fetchProducts();
    fetchMesas();
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("mesaTemporalData");
    if (storedData) {
      setAllTempMesaData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mesaTemporalData", JSON.stringify(consumoTemporal));
  }, [consumoTemporal]);

  useEffect(() => {
    latestMesaRef.current = selectedMesa;
    latestTotalRef.current = totalConsumo;
  }, [selectedMesa, totalConsumo]);

  useEffect(() => {
    if (
      !Array.isArray(selectedMesa.selectedProducts) ||
      selectedMesa.selectedProducts.length === 0
    ) {
      setTotalConsumo("0.00");
      return;
    }

    let total = 0;
    for (const productId of selectedMesa.selectedProducts) {
      const producto = products.find((p) => p.id === productId);
      if (producto) total += Number(producto.price);
    }
    setTotalConsumo(total.toFixed(2));
  }, [selectedMesa.selectedProducts, products]);

  useEffect(() => {
    if (selectedMesa.selectedProducts.length > 0) {
      setCronometroActivo(true);
    }
  }, [selectedMesa.selectedProducts]);

  useEffect(() => {
    if (cronometroActivo && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTiempoOcupada((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cronometroActivo]);

  useEffect(() => {
    if (selectedMesa?.id && selectedMesa.selectedProducts.length > 0) {
      setTempMesaData(selectedMesa.id, {
        total: totalConsumo,
        tiempo: tiempoOcupada,
        selectedProducts: selectedMesa.selectedProducts,
      });
    }
  }, [selectedMesa.selectedProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedMesa((prev) => ({ ...prev, [name]: value }));
  };

  const toggleModal = (mesa = null) => {
    if (mesa && mesa.id) {
      const selectedProducts = consumoTemporal[mesa.id]?.selectedProducts || [];
      setSelectedMesa({
        id: mesa.id,
        capacidad: mesa.capacidad,
        selectedProducts,
      });
      setTiempoOcupada(consumoTemporal[mesa.id]?.tiempo || 0);
    } else {
      setSelectedMesa({
        id: null,
        capacidad: "",
        selectedProducts: [],
      });
      setTiempoOcupada(0);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCronometroActivo(false);
    setTipoPago("efectivo");

    setShowModal(!showModal);
  };

  const handleGuardarConsumo = () => {
    if (selectedMesa.selectedProducts.length === 0) {
      setAlertType("success");
      setAlertMessage("Venta registrada correctamente.");
      setTimeout(() => setAlertMessage(null), 3000);

      return;
    }

    setTempMesaData(selectedMesa.id, {
      total: totalConsumo,
      tiempo: tiempoOcupada,
      selectedProducts: selectedMesa.selectedProducts,
    });

    setCronometroActivo(true);
    setShowModal(false);
  };

  const handlePagar = async () => {
    if (selectedMesa.selectedProducts.length === 0) {
      setAlertType("warning");
      setAlertMessage("No hay productos para cobrar.");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_mesa: selectedMesa.id,
          productos: selectedMesa.selectedProducts.map((id) => ({
            id_producto: id,
            cantidad: 1,
          })),
          tipo_pago: tipoPago,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error al registrar la venta: ${error}`);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setCronometroActivo(false);
      clearTempMesaData(selectedMesa.id);
      setShowModal(false);

      setAlertType("success");
      setAlertMessage("Venta registrada correctamente.");
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      setAlertType("error");
      setAlertMessage("Ocurrió un error al registrar la venta.");
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const calcularTotal = (mesaId) => {
    const mesaTemp = consumoTemporal[mesaId];
    if (!mesaTemp || !mesaTemp.selectedProducts) return "0.00";

    const total = mesaTemp.selectedProducts.reduce((sum, productId) => {
      const prod = products.find((p) => p.id === productId);
      return sum + (prod ? Number(prod.price) : 0);
    }, 0);

    return total.toFixed(2);
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

return (
  <div className="p-6">
    {/* Cabecera */}
    <div className="flex items-center justify-between mb-6 pt-2">
      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
        Mesas
      </h2>
      {alertMessage && (
        <div className="mb-4">
          <Alert type={alertType} message={alertMessage} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 bg-gray-800 rounded-lg p-2">
        {/* Botón para cambiar de vista */}
        <button
          onClick={() => setIsCardView(!isCardView)}
          className="px-3 py-1 text-sm rounded-md bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          {isCardView ? "Ver como tabla" : "Ver como tarjetas"}
        </button>

        {/* Botón para nueva mesa */}
        <button
          onClick={() => {
            setSelectedMesa({ id: null, capacidad: "", selectedProducts: [] });
            setTiempoOcupada(0);
            setShowModal(true);
          }}
          className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Nueva Mesa
        </button>

        {/* Botón para reiniciar todas las mesas */}
        <button
          onClick={() => setShowConfirmModal(true)}
          className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition"
        >
          Reiniciar
        </button>
      </div>
    </div>

    {/* Contenido dinámico */}
    {mesas.length === 0 ? (
      <div className="text-white">Cargando o no hay mesas...</div>
    ) : isCardView ? (
      /* ===================== VISTA TARJETAS (NUEVA) ===================== */
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mesas.map((mesa) => {
          const temp = consumoTemporal[mesa.id] || {};
          const ocupada = (temp?.selectedProducts?.length ?? 0) > 0;

          const bgGrad = ocupada
            ? "from-rose-600 to-rose-700" // ocupada -> rojo
            : "from-emerald-600 to-emerald-700"; // libre -> verde

          return (
            <div
              key={mesa.id}
              className={clsx(
                "rounded-2xl p-5 text-white shadow-lg ring-1 ring-white/10",
                "bg-gradient-to-br", bgGrad,
                "transition-transform hover:scale-[1.01]"
              )}
            >
              {/* Encabezado */}
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold drop-shadow-sm">
                  Mesa #{mesa.id}
                </h3>
                <span
                  className={clsx(
                    "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                    "bg-black/20 ring-1 ring-white/20"
                  )}
                >
                  {ocupada ? "ocupada" : "disponible"}
                </span>
              </div>

              {/* Total + Duración arriba y grandes */}
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-xs/4 uppercase tracking-wide opacity-90">
                    Total
                  </div>
                  <div className="text-2xl font-extrabold drop-shadow-sm">
                    ${calcularTotal(mesa.id)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs/4 uppercase tracking-wide opacity-90">
                    Duración
                  </div>
                  <div className="text-lg font-bold">
                    {formatDuration(temp?.tiempo || 0)}
                  </div>
                </div>
              </div>

              {/* Datos */}
              <div className="mt-4 grid gap-1.5 text-[13px]">
                <div className="opacity-90">Capacidad: {mesa.capacidad}</div>
                <div className="opacity-90">
                  Consumo:{" "}
                  {ocupada
                    ? temp.selectedProducts
                        .map((id) => products.find((p) => p.id === id)?.name || "")
                        .filter(Boolean)
                        .join(", ")
                    : "Sin consumo"}
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => toggleModal(mesa)}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 ring-1 ring-white/20"
                  title="Editar"
                >
                  <PencilSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteMesa(mesa.id)}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 ring-1 ring-white/20"
                  title="Eliminar"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      /* =================== FIN VISTA TARJETAS (NUEVA) =================== */
    ) : (
      // Vista tipo tabla (igual que tenías)
      <div className="overflow-x-auto rounded-lg shadow border border-gray-700">
        <table className="min-w-full bg-gray-900 text-sm text-white">
          <thead className="text-xs uppercase bg-gray-800 text-gray-400">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Capacidad</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Consumo</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Duración</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mesas.map((mesa) => {
              const temp = consumoTemporal[mesa.id];
              const estado =
                temp?.selectedProducts?.length > 0 ? "ocupada" : "disponible";
              return (
                <tr
                  key={mesa.id}
                  className="border-b border-gray-700 hover:bg-gray-800"
                >
                  <td className="px-6 py-4 font-mono text-green-400">
                    #{mesa.id}
                  </td>
                  <td className="px-6 py-4">{mesa.capacidad}</td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "text-xs font-medium px-2.5 py-0.5 rounded",
                        estado === "ocupada"
                          ? "bg-red-600 text-white"
                          : "bg-green-600 text-white"
                      )}
                    >
                      {estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs">
                    {temp?.selectedProducts?.length > 0
                      ? temp.selectedProducts
                          .map((id) => {
                            const prod = products.find((p) => p.id === id);
                            return prod ? prod.name : "";
                          })
                          .join(", ")
                      : "Sin consumo"}
                  </td>
                  <td className="px-6 py-4 text-blue-400 font-semibold">
                    ${calcularTotal(mesa.id)}
                  </td>
                  <td className="px-6 py-4">
                    {formatDuration(temp?.tiempo || 0)}
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <PencilSquare
                      className="text-yellow-400 cursor-pointer"
                      onClick={() => toggleModal(mesa)}
                    />
                    <Trash
                      className="text-red-400 cursor-pointer"
                      onClick={() => deleteMesa(mesa.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}

    {/* Modal de edición */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md text-white">
          <h3 className="text-lg font-bold mb-4">
            Editar Mesa #{selectedMesa?.id}
          </h3>

          {/* Capacidad */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Capacidad</label>
            <input
              type="number"
              name="capacidad"
              value={selectedMesa.capacidad}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
            />
          </div>

          {/* Productos */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Productos</label>
            <Select
              isMulti
              value={products
                .filter((p) => selectedMesa.selectedProducts.includes(p.id))
                .map((p) => ({ label: p.name, value: p.id }))}
              options={products.map((p) => ({ label: p.name, value: p.id }))}
              onChange={(selected) =>
                setSelectedMesa((prev) => ({
                  ...prev,
                  selectedProducts: selected.map((s) => s.value),
                }))
              }
              className="text-black"
            />
          </div>

          {/* Total */}
          <div className="mb-2 text-sm text-gray-300">
            <strong>Total:</strong> ${totalConsumo}
          </div>

          {/* Duración */}
          <div className="mb-4 text-sm text-gray-300">
            <strong>Duración:</strong> {formatDuration(tiempoOcupada)}
          </div>

          {/* Tipo de pago */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Tipo de Pago
            </label>
            <select
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
            >
              <option value="efectivo">Efectivo</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleGuardarConsumo}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Agregar
            </button>
            <button
              onClick={handlePagar}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
            >
              Pagar
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal confirmar reinicio */}
    {showConfirmModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-800  p-6 rounded-lg shadow-md w-full max-w-sm text-white">
          <h2 className="text-lg font-bold mb-4 text-white text-center">
            ¿Estás seguro?
          </h2>

          <p className="text-sm text-gray-300 text-center mb-6">
            Esto reiniciará todas las mesas y eliminará el consumo temporal.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                Object.keys(consumoTemporal).forEach((mesaId) =>
                  clearTempMesaData(Number(mesaId))
                );
                localStorage.removeItem("mesaTemporalData");
                setTiempoOcupada(0);
                setCronometroActivo(false);
                setShowConfirmModal(false);
                setAlertType("warning");
                setAlertMessage("Todas las mesas fueron reiniciadas.");
                setTimeout(() => setAlertMessage(null), 3000);
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

}

const mapStateToProps = (state) => ({
  loading: state.mesas.loading,
  mesas: state.mesas.mesas || [],
  error: state.mesas.error,
  products: state.products.products || [],
  consumoTemporal: state.mesas.consumoTemporal || {},
});

const mapDispatchToProps = {
  fetchMesasConsumo,
  fetchProducts,
  fetchMesas,
  createMesa,
  updateMesa,
  deleteMesa,
  assignProductsToMesa,
  setTempMesaData,
  clearTempMesaData,
  setAllTempMesaData,
};

export default connect(mapStateToProps, mapDispatchToProps)(MesaOperations);
