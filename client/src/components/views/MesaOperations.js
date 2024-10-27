import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Toast,
} from "react-bootstrap";
import {
  fetchMesas,
  createMesa,
  updateMesa,
  deleteMesa,
} from "../actions/mesaActions";

function MesaOperations({
  loading,
  mesas,
  error,
  fetchMesas,
  createMesa,
  updateMesa,
  deleteMesa,
}) {
  const [show, setShow] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState({
    name: "",
    description: "",
    capacity: "",
  });

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedMesa((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Handle form submit logic here (create or update mesa)
    updateMesa(selectedMesa); // Adjust this line depending on whether you are creating or updating
    setShow(false);
  };

  return (
    <div className="container mt-4">
      <Button onClick={() => setShow(true)} variant="primary">
        Insert
      </Button>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">Error: {error}</Alert>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mesas.map((mesa) => (
              <tr key={mesa.id}>
                <td>{mesa.name}</td>
                <td>{mesa.description}</td>
                <td>{mesa.capacity}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => {
                      setSelectedMesa(mesa);
                      setShow(true);
                    }}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => deleteMesa(mesa.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Mesa Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={selectedMesa.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={selectedMesa.description}
                onChange={handleChange}
                placeholder="Enter description"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCapacity">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={selectedMesa.capacity}
                onChange={handleChange}
                placeholder="Enter capacity"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

const mapStateToProps = (state) => ({
  loading: state.mesas.loading,
  mesas: state.mesas.mesas,
  error: state.mesas.error,
});

const mapDispatchToProps = {
  fetchMesas,
  createMesa,
  updateMesa,
  deleteMesa,
};

export default connect(mapStateToProps, mapDispatchToProps)(MesaOperations);
