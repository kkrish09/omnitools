import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ToolPage from './pages/ToolPage'
import Premium from './pages/Premium'
import { About, Guides, NotFound, Privacy, Terms } from './pages/StaticPages'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/c/:cat" element={<CategoryPage />} />
        <Route path="/t/:id" element={<ToolPage />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
