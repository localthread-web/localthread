import { Separator } from './ui/separator'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Instagram, Facebook, Twitter, Youtube, Mail } from 'lucide-react'
import { LocalThreadLogo } from './LocalThreadLogo'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-16 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Stay Connected</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Subscribe to our newsletter and be the first to know about new vendors, exclusive products, and community updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Enter your email address" 
                className="pl-10 bg-white border-gray-300 focus:border-gray-900 focus:ring-gray-900" 
              />
            </div>
            <Button className="bg-gray-900 text-white hover:bg-black transition-colors duration-300 px-8">
              Subscribe
            </Button>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <LocalThreadLogo size="lg" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Connect with local artisans, discover unique products, and support your community. 
              Shop local, live better.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="bg-white hover:bg-gray-100 border border-gray-200">
                <Instagram className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-white hover:bg-gray-100 border border-gray-200">
                <Facebook className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-white hover:bg-gray-100 border border-gray-200">
                <Twitter className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-white hover:bg-gray-100 border border-gray-200">
                <Youtube className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-gray-900 text-lg">Shop</h4>
            <div className="space-y-3 text-sm">
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">New Arrivals</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Women's Collection</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Men's Collection</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Accessories</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Sale Items</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Local Vendors</button>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h4 className="font-bold text-gray-900 text-lg">Customer Service</h4>
            <div className="space-y-3 text-sm">
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Contact Us</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Size Guide</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Shipping Info</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Returns & Exchanges</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">FAQ</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Track Order</button>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="font-bold text-gray-900 text-lg">Company</h4>
            <div className="space-y-3 text-sm">
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">About Us</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Become a Vendor</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Sustainability</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Press & Media</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Privacy Policy</button>
              <button className="block text-gray-600 hover:text-gray-900 transition-colors text-left w-full text-left">Terms of Service</button>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Bottom Footer */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div className="text-center md:text-left">
            © 2025 LocalThread. All rights reserved.
          </div>
          <div className="flex gap-6 text-center">
            <button className="hover:text-gray-900 transition-colors">Terms of Service</button>
            <button className="hover:text-gray-900 transition-colors">Privacy Policy</button>
            <button className="hover:text-gray-900 transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  )
}