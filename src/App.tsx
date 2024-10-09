import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './pages/Layout'
import Start from './pages/Start'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Start />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
