import { Routes, Route, Link } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import Customers from './pages/Customers'
import InvoiceList from './pages/InvoiceList'
import CreateInvoice from './pages/CreateInvoice'
import InvoiceDetail from './pages/InvoiceDetail'
import './App.css'

function App() {

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" expand="sm">
        <Container>
          <Navbar.Brand>Invoices</Navbar.Brand>
          <Nav>
            <Nav.Link as={Link} to="/">Invoices</Nav.Link>
            <Nav.Link as={Link} to="/create">Create Invoice</Nav.Link>
            <Nav.Link as={Link} to="/customers">Customers</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<InvoiceList />} />
          <Route path="/create" element={<CreateInvoice />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
