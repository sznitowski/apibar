import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Table, Modal, Button, Form } from "react-bootstrap";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../actions/productActions";
import "./ProductOperations.css"; // Importa el CSS aquí

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
    id: null, // Include id here to check if a product is being updated
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
    setSelectedProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleSaveProduct = () => {
    if (selectedProduct.id) {
      // Pass both id and product data for updating the product
      updateProduct(selectedProduct.id, selectedProduct);
    } else {
      // Create a new product if no id
      createProduct(selectedProduct);
    }

    setShowModal(false);
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
    <div className="operations">
      <br />
      <Button
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
      >
        Insert
      </Button>
      <br />
      <br />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>{product.category}</td>
                <td>
                  <PencilSquare
                    className="mr-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedProduct(product); // Populate form with product data for editing
                      toggleModal();
                    }}
                  />
                  <Trash
                    style={{ cursor: "pointer" }}
                    onClick={() => deleteProduct(product.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProduct.id ? "Edit Product Info" : "Insert New Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={selectedProduct.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={selectedProduct.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={selectedProduct.price}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={selectedProduct.stock}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={selectedProduct.category}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveProduct}>
            {selectedProduct.id ? "Save Changes" : "Add Product"}
          </Button>
        </Modal.Footer>
      </Modal>
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
