"use client"
import { Check, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PricingPlan {
  name: string
  price: string
  period: string
  features: string[]
  buttonText: string
  popular?: boolean
  description?: string
}

export default function PricingSection() {
  const plans: PricingPlan[] = [
    {
      name: "Basic",
      price: "$29.99",
      period: "Per user, per month",
      features: ["AI-powered chatbot", "Up to 500 interactions per month", "Email support"],
      buttonText: "Choose Plan",
    },
    {
      name: "Premium",
      price: "$239.99",
      period: "Per user, per month",
      features: ["AI-powered chatbot", "Up to 10,000 interactions per month", "Email support", "24/7 File archive"],
      buttonText: "Get Started",
      popular: true,
    },
    {
      name: "Standard",
      price: "$89.99",
      period: "Per user, per month",
      features: ["AI-powered chatbot", "Up to 2500 interactions per month", "Chat and email support"],
      buttonText: "Get Started",
    },
  ]

  const handlePlanSelect = (planName: string) => {
    console.log(`Selected plan: ${planName}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      <section className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 border border-gray-700 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-gray-700 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-gray-800 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="inline-flex items-center px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-full text-sm font-medium mb-8">
            Pricing Plan
          </Badge>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Choose Your Best Plan</h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-2xl border-2 border-green-400/30 transform scale-105"
                  : "bg-gray-800/40 backdrop-blur-sm text-white shadow-xl border border-gray-700 hover:border-gray-600 hover:shadow-2xl"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-green-400 to-lime-400 text-gray-900 px-4 py-2 rounded-full font-semibold text-sm flex items-center space-x-2 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Premium</span>
                  </Badge>
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-8">
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? "text-white" : "text-white"}`}>
                  {plan.name}
                </h3>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-white"}`}>
                    {plan.price}
                  </span>
                </div>
                <p className={`text-sm mt-2 ${plan.popular ? "text-gray-300" : "text-gray-400"}`}>{plan.period}</p>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        plan.popular ? "bg-green-400" : "bg-green-400/20"
                      }`}
                    >
                      <Check className={`w-3 h-3 ${plan.popular ? "text-gray-900" : "text-green-400"}`} />
                    </div>
                    <span className={`text-sm leading-relaxed ${plan.popular ? "text-gray-200" : "text-gray-300"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handlePlanSelect(plan.name)}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg ${
                  plan.popular
                    ? "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-gray-900"
                    : "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-gray-900"
                }`}
              >
                {plan.buttonText}
              </Button>

              {/* Popular Plan Glow Effect */}
              {plan.popular && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/5 to-blue-400/5 pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-6">Need a custom plan? We've got you covered.</p>
          <Button
            variant="outline"
            className="px-8 py-3 rounded-2xl border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 bg-transparent"
          >
            Contact Sales
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-green-500" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>
      </section>
      
    </div>
  )
}
