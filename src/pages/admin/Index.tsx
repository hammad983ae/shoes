import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, ShoppingBag, Heart, Play } from "lucide-react";

export default function Index() {

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold tracking-tight">APEX</h1>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">New Arrivals</a>
                <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Men</a>
                <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Women</a>
                <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Collections</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
          <div 
            className="w-full h-full bg-cover bg-center bg-gradient-to-r from-black/40 to-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.1)), url('https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&h=1200&fit=crop&crop=center')`
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <Badge variant="secondary" className="mb-6 bg-accent text-accent-foreground">
              NEW DROP
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              ELEVATE
              <br />
              <span className="text-accent">YOUR</span>
              <br />
              STYLE
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-lg">
              Introducing the Revolutionary APEX Collection. Where innovation meets luxury in every step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-black"
                onClick={() => {}}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Film
              </Button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-white/80">4.9 Rating</span>
              </div>
              <div className="text-white/80">
                <span className="font-semibold">2.5K+</span> Reviews
              </div>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-accent/20 to-transparent rounded-full absolute -top-20 -right-20 blur-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop&crop=center"
                alt="APEX Shoe"
                className="relative z-10 w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-white text-center">
                  <p className="text-lg font-semibold mb-2">Limited Edition</p>
                  <p className="text-3xl font-bold text-accent">$299</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm">Scroll to explore</span>
            <div className="w-px h-8 bg-white/40" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              FEATURED COLLECTION
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Engineered for Excellence</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our latest innovations in athletic performance and street style
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "APEX Runner",
                price: "$199",
                image: "https://images.unsplash.com/photo-1551107696-a4b537c892db?w=400&h=400&fit=crop&crop=center",
                badge: "Best Seller"
              },
              {
                title: "APEX Court",
                price: "$249",
                image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop&crop=center",
                badge: "Limited"
              },
              {
                title: "APEX Street",
                price: "$179",
                image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&crop=center",
                badge: "New"
              }
            ].map((product, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white">
                  <img 
                    src={product.image}
                    alt={product.title}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                    {product.badge}
                  </Badge>
                  <Button 
                    size="icon" 
                    variant="secondary"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                  <p className="text-2xl font-bold text-accent">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the APEX Community
          </h2>
          <p className="text-xl mb-8 opacity-80">
            Be the first to know about new drops, exclusive releases, and member-only events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-background text-foreground border-0 focus:ring-2 focus:ring-accent"
            />
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">APEX</h3>
              <p className="text-muted-foreground">
                Elevating athletic performance through innovative design and premium craftsmanship.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Men</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Women</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 APEX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
