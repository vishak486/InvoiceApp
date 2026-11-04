import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import api from '../api'

function Customers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [show, setShow] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', phone: '' })
    const [error, setError] = useState('')

    const loadCustomers = async () => {
        try {
            const res = await api.get('/api/customers')
            setCustomers(res.data)
        } catch (err) {
            setError('Could not load customers', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCustomers()
    }, [])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const openModal = () => {
        setForm({ name: '', email: '', phone: '' })
        setError('')
        setShow(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // simple validation
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            setError('Name, email and phone are required')
            return
        }
        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError('Enter a valid email')
            return
        }

        try {
            await api.post('/api/customers', form)
            setShow(false)
            loadCustomers()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not add customer')
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Customers</h4>
                <Button onClick={openModal}>Add Customer</Button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No customers yet</td>
                            </tr>
                        ) : (
                            customers.map((c, index) => (
                                <tr key={c._id}>
                                    <td>{index + 1}</td>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <Modal show={show} onHide={() => setShow(false)}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Customer</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control name="name" value={form.name} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control name="email" value={form.email} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}

export default Customers