import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Table, Button, Modal, Form, Alert, Badge, Row, Col } from 'react-bootstrap'
import api from '../api'

const statusColor = {
  unpaid: 'danger',
  partly_paid: 'warning',
  paid: 'success',
}

function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ amount: '', method: 'cash', paymentDate: '' })
  const [error, setError] = useState('')

  const loadInvoice = async () => {
    try {
      const res = await api.get(`/api/invoices/${id}`)
      setInvoice(res.data)
    } catch (err) {
      setPageError(err.response?.data?.message || 'Could not load invoice')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoice()
  }, [id])

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB')
  const formatMoney = (n) => `₹${n.toLocaleString('en-IN')}`

  const openModal = () => {
    setForm({ amount: '', method: 'cash', paymentDate: new Date().toISOString().slice(0, 10) })
    setError('')
    setShow(true)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // simple validation
    if (!(Number(form.amount) > 0)) {
      return setError('Amount must be greater than zero')
    }
    if (!form.paymentDate) {
      return setError('Payment date is required')
    }

    try {
      await api.post('/api/payments', {
        invoice: id,
        amount: Number(form.amount),
        method: form.method,
        paymentDate: form.paymentDate,
      })
      setShow(false)
      loadInvoice()
    } catch (err) {
      // show the message sent by the API
      setError(err.response?.data?.message || 'Could not record payment')
    }
  }

  if (loading) return <p>Loading...</p>
  if (pageError) return <Alert variant="danger">{pageError}</Alert>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          Invoice {invoice.invoiceNumber}{' '}
          <Badge bg={statusColor[invoice.status]}>{invoice.status.replace('_', ' ')}</Badge>
        </h4>
        <Link to="/">Back to invoices</Link>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <p className="mb-1"><strong>Customer:</strong> {invoice.customer?.name}</p>
          <p className="mb-1"><strong>Email:</strong> {invoice.customer?.email}</p>
          <p className="mb-1"><strong>Phone:</strong> {invoice.customer?.phone}</p>
        </Col>
        <Col md={6}>
          <p className="mb-1"><strong>Invoice date:</strong> {formatDate(invoice.invoiceDate)}</p>
          <p className="mb-1"><strong>Due date:</strong> {formatDate(invoice.dueDate)}</p>
        </Col>
      </Row>

      <h5>Items</h5>
      <Table bordered>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Tax %</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item._id}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{formatMoney(item.unitPrice)}</td>
              <td>{item.taxRate}</td>
              <td>{formatMoney(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end mb-4">
        <p className="mb-1"><strong>Total:</strong> {formatMoney(invoice.total)}</p>
        <p className="mb-1"><strong>Paid:</strong> {formatMoney(invoice.amountPaid)}</p>
        <h5><strong>Balance due:</strong> {formatMoney(invoice.balanceDue)}</h5>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Payments</h5>
        <Button onClick={openModal}>Record Payment</Button>
      </div>
      <Table bordered>
        <thead>
          <tr>
            <th>Date</th>
            <th>Method</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.payments.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">No payments yet</td>
            </tr>
          ) : (
            invoice.payments.map((p) => (
              <tr key={p._id}>
                <td>{formatDate(p.paymentDate)}</td>
                <td>{p.method.replace('_', ' ')}</td>
                <td>{formatMoney(p.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Record Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p>Balance due: <strong>{formatMoney(invoice.balanceDue)}</strong></p>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" name="amount" value={form.amount} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Method</Form.Label>
              <Form.Select name="method" value={form.method} onChange={handleChange}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="upi">UPI</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Date</Form.Label>
              <Form.Control type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button type="submit">Save Payment</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default InvoiceDetail