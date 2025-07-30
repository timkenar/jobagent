"use client"
import { Button } from "@/components/ui/button"

interface FeatureCardProps {
  title: string
  description: string
  className?: string
  onGetStarted?: () => void
}

export function FeatureCard({ title, description, className = "", onGetStarted }: FeatureCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <Button
        onClick={onGetStarted}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
      >
        Get Started
      </Button>
    </div>
  )
}
