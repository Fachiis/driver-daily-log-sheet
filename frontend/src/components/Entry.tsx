import NavBar from '@/components/entry/NavBar.tsx'
import MainContent from '@/components/entry/MainContent.tsx'
import Footer from '@/components/entry/Footer.tsx'

function Entry() {
   return (
      <section className="min-h-screen bg-gradient-to-br from-[#1A3038] to-[#1A3038]/90 dark:from-slate-900 dark:to-slate-800">
         <NavBar />
         <MainContent />
         <Footer />
      </section>
   )
}

export default Entry
