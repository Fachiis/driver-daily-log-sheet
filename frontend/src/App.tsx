import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NavBar from '@/components/entry/NavBar.tsx'
import Footer from '@/components/entry/Footer.tsx'
import LandingPage from '@/pages/LandingPage.tsx'
import TripPage from '@/pages/TripPage.tsx'

function App() {
   return (
      <BrowserRouter>
         <section className="min-h-screen bg-gradient-to-br from-[#1A3038] to-[#1A3038]/90 dark:from-slate-900 dark:to-slate-800">
            <NavBar />
            <Routes>
               <Route path="/" element={<LandingPage />} />
               <Route path="/trip/:id" element={<TripPage />} />
            </Routes>
            <Footer />
         </section>
      </BrowserRouter>
   )
}

export default App
