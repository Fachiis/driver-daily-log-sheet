function Footer() {
   return (
      <footer className="py-6 bg-[#061426] text-[#E8E6E3]">
         <div className="container mx-auto px-4 text-center text-sm">
            <p>
               © {new Date().getFullYear()} Spotter ELD - Compliant with FMCSA
               Hours of Service Regulations
            </p>
         </div>
      </footer>
   )
}

export default Footer
