import { Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

function NavBar() {
   return (
      <header className="bg-[#0F272E] dark:bg-[#0F272E]/50 border-b border-[#05D0DD] dark:border-[#05D0DD]/50 sticky top-0 z-50 shadow-sm">
         <div className="container mx-auto px-4 py-4">
            <Link
               to="/"
               className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
               <div className="p-2 bg-gradient-to-br from-[#006666] to-green-800 rounded-lg shadow-lg">
                  <Truck className="h-6 w-6 text-white" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold bg-[#E8E6E3] bg-clip-text text-transparent font-['Poppins'] dark:text-white dark:bg-clip-text dark:text-transparentx">
                     Spotter ELD
                  </h1>
                  <p className="text-sm text-white/80">
                     Electronic Logging Device & Route Planner
                  </p>
               </div>
            </Link>
         </div>
      </header>
   )
}

export default NavBar
