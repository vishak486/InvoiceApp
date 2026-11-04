import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Table, Row, Col, Alert } from 'react-bootstrap'
import api from '../api'

const emptyItem = { description: '', quantity: 1, unitPrice: '', taxRate: 0 }

// line total = quantity x price + tax
const getLineTotal = (item) => {
  const qty = Number(item.quantity) || 0
  const price = Number(item.unitPrice) || 0
  const tax = Number(item.taxRate) || 0
  return Math.round(qty * price * (1 + tax / 100) * 100) / 100
}

function CreateInvoice() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState([{ ...emptyItem }])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await api.get('/api/customers')
        setCustomers(res.data)
      } catch (err) {
        setError('Could not load customers',err)
      } finally {
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const handleItemChange = (index, e) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [e.target.name]: e.target.value }
    setItems(newItems)
  }

  const addItem = () => setItems([...items, { ...emptyItem }])

  const removeItem = (index) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const grandTotal = Math.round(items.reduce((sum, item) => sum + getLineTotal(item), 0) * 100) / 100

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // simple validation
    if (!customer) return setError('Choose a customer')
    if (!invoiceNumber.trim()) return setError('Invoice number is required')
    if (!dueDate) return setError('Due date is required')
    if (dueDate < invoiceDate) return setError('Due date cannot be before invoice date')

    for (const item of items) {
      if (!item.description.trim()) return setError('Every item needs a description')
      if (!(Number(item.quantity) > 0)) return setError('Quantity must be greater than 0')
      if (!(Number(item.unitPrice) > 0)) return setError('Unit price must be greater than 0')
      if (Number(item.taxRate) < 0) return setError('Tax rate cannot be negative')
    }

    // only send the inputs, the server calculates all totals
    const body = {
      invoiceNumber,
      customer,
      invoiceDate,
      dueDate,
      items: items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        taxRate: Number(i.taxRate) || 0,
      })),
    }

    try {
      const res = await api.post('/api/invoices', body)
      navigate(`/invoices/${res.data.invoice._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create invoice')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <Form onSubmit={handleSubmit}>
      <h4 className="mb-3">Create Invoice</h4>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Customer</Form.Label>
            <Form.Select value={customer} onChange={(e) => setCustomer(e.target.value)}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Invoice Number</Form.Label>
            <Form.Control value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-001" />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Invoice Date</Form.Label>
            <Form.Control type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Due Date</Form.Label>
            <Form.Control type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Form.Group>
        </Col>
      </Row>

      <Table bordered>
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ width: '100px' }}>Qty</th>
            <th style={{ width: '140px' }}>Unit Price</th>
            <th style={{ width: '110px' }}>Tax %</th>
            <th style={{ width: '140px' }}>Line Total</th>
            <th style={{ width: '90px' }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <Form.Control name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} />
              </td>
              <td>
                <Form.Control type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} />
              </td>
              <td>
                <Form.Control type="number" name="unitPrice" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} />
              </td>
              <td>
                <Form.Control type="number" name="taxRate" value={item.taxRate} onChange={(e) => handleItemChange(index, e)} />
              </td>
              <td className="align-middle">₹{getLineTotal(item).toLocaleString('en-IN')}</td>
              <td>
                <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)} disabled={items.length === 1}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center">
        <Button variant="outline-primary" onClick={addItem}>Add Item</Button>
        <h5 className="mb-0">Grand Total: ₹{grandTotal.toLocaleString('en-IN')}</h5>
      </div>

      <Button type="submit" className="mt-4">Create Invoice</Button>
    </Form>
  )
}

export default CreateInvoice