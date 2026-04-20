import './landing.css'
import { LandingProvider } from './LandingContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Solution } from './components/Solution'
import { HowItWorks } from './components/HowItWorks'
import { PaymentModes } from './components/PaymentModes'
import { Integrations } from './components/Integrations'
import { Pricing } from './components/Pricing'
import { Testimonials } from './components/Testimonials'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

export function LandingPage() {
  return (
    <LandingProvider>
      <div data-theme="landing" className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Hero />
          <Problem />
          <Solution />
          <HowItWorks />
          <PaymentModes />
          <Integrations />
          <Pricing />
          <Testimonials />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </LandingProvider>
  )
}
