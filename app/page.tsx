import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Heart } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Heart className="h-4 w-4 mr-2 text-red-500" />
            Community-Driven Emergency Preparedness
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Empowering the Omaha Tribe
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            Using advanced AI technology to help the Omaha Tribe create comprehensive Emergency Operation Plans (EOP)
            that protect and serve their community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <a href="/dashboard">
                Start Building Your EOP
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More About Our Mission
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
