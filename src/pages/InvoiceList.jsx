import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Form, Badge, Alert } from 'react-bootstrap'
import api from '../api'

const statusColor = {
    unpaid: 'danger',
    partly_paid: 'warning',
    paid: 'success',
}

function InvoiceList() {
    const [invoices, setInvoices] = useState([])
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadInvoices = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await api.get('/api/invoices', {
                    params: status ? { status } : {},
                })
                setInvoices(res.data)
            } catch (err) {
                setError('Could not load invoices', err)
            } finally {
                setLoading(false)
            }
        }
        loadInvoices()
    }, [status])

    const formatDate = (d) => new Date(d).toLocaleDateString('en-GB')
    const formatMoney = (n) => `₹${n.toLocaleString('en-IN')}`

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Invoices</h4>
                <Form.Select
                    style={{ width: '200px' }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partly_paid">Partly paid</option>
                    <option value="paid">Paid</option>
                </Form.Select>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>Invoice No</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Balance Due</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">No invoices found</td>
                            </tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv._id}>
                                    <td>
                                        <Link to={`/invoices/${inv._id}`}>{inv.invoiceNumber}</Link>
                                    </td>
                                    <td>{inv.customer?.name}</td>
                                    <td>{formatDate(inv.invoiceDate)}</td>
                                    <td>{formatMoney(inv.total)}</td>
                                    <td>{formatMoney(inv.amountPaid)}</td>
                                    <td>{formatMoney(inv.balanceDue)}</td>
                                    <td>
                                        <Badge bg={statusColor[inv.status]}>
                                            {inv.status.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}
        </>
    )
}

export default InvoiceList