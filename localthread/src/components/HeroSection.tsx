import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles, Star, Truck, Shield } from 'lucide-react'

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Set animation visibility after component mounts
    setIsVisible(true)
  }, [])

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className={`absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-full blur-3xl transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-60 animate-pulse' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}></div>
        <div className={`absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-gray-200/15 to-gray-300/15 rounded-full blur-3xl transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-50 animate-pulse' : 'opacity-0'}`} style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className={`absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-gray-100/10 to-gray-200/10 rounded-full blur-3xl transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-40 animate-pulse' : 'opacity-0'}`} style={{ animationDelay: '0.8s', animationDuration: '4s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left max-w-2xl">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <Sparkles className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Discover LocalThread</span>
          </div>

          {/* Main Heading */}
          <h1 
            className={`text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent">
              Local
            </span>
            <br />
            <span className="text-gray-900">Marketplace</span>
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed transition-all duration-700 delay-100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
            style={{ transitionDelay: '400ms' }}
          >
            Connect with local artisans, discover unique products, and support your community. 
            <span className="font-semibold text-gray-800"> Shop local, live better.</span>
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10 transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ transitionDelay: '600ms' }}
          >
            <Button className="group px-8 py-4 text-lg bg-gray-900 text-white hover:bg-black transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0">
              <span>Explore Products</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button variant="outline" className="px-8 py-4 text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm">
              Become a Vendor
            </Button>
          </div>

          {/* Features */}
          <div 
            className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ transitionDelay: '800ms' }}
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200 hover:bg-white/80 transition-all duration-300 group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
                <Truck className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800 text-sm">Fast Delivery</div>
                <div className="text-xs text-gray-600">Local shipping</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200 hover:bg-white/80 transition-all duration-300 group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800 text-sm">Secure Payments</div>
                <div className="text-xs text-gray-600">100% protected</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200 hover:bg-white/80 transition-all duration-300 group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
                <Star className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800 text-sm">Quality Assured</div>
                <div className="text-xs text-gray-600">Curated products</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div 
            className={`flex flex-wrap justify-center lg:justify-start gap-6 text-gray-600 transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ transitionDelay: '1000ms' }}
          >
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Local Vendors</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <div 
            className={`relative transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100 rotate-0' : 'translate-x-full opacity-0 rotate-6'}`}
            style={{ transitionDelay: '500ms' }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gray-400/20 via-gray-500/20 to-gray-600/20 rounded-2xl blur-2xl animate-pulse"></div>
            
            {/* Main image container */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <img
              src="/images/hero-image.png"
                alt="LocalThread Marketplace"
                className="w-full max-w-lg h-auto rounded-xl object-cover"
              />
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">Live</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-gray-900 text-white rounded-full p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-medium">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <span className="text-sm font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  )
}