import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FraudRadar from './pages/FraudRadar'
import Report from './pages/Report'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<FraudRadar />} />
          <Route path="/report/:companyId" element={<Report />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
