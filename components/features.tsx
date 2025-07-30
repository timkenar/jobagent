"use client"

import React from "react"
import { 
  Sparkles, 
  Search, 
  Mail, 
  Settings, 
  FileText, 
  TrendingUp, 
  Bot, 
  Users, 
  Shield, 
  Clock, 
  Target, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Briefcase,
  Brain,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  benefits: string[]
  category: string
  premium?: boolean
}

export default function FeaturesPage() {
  const features: Feature[] = [
    {
      id: "dashboard",
      title: "Smart Dashboard",
      description: "Get a comprehensive overview of your job search progress with real-time analytics and insights.",
      icon: <TrendingUp className="w-8 h-8" />,
      benefits: [
        "Real-time job search analytics",
        "Application success rates",
        "Interview scheduling overview",
        "Progress tracking metrics"
      ],
      category: "Analytics"
    },
    {
      id: "ai-job-search",
      title: "AI-Powered Job Search",
      description: "Leverage advanced AI algorithms to find jobs that perfectly match your skills and career goals.",
      icon: <Brain className="w-8 h-8" />,
      benefits: [
        "Google-powered job discovery",
        "CV-based skill matching",
        "Salary range optimization",
        "Location preference filtering"
      ],
      category: "Core Features",
      premium: true
    },
    {
      id: "automation",
      title: "Job Application Automation",
      description: "Automate your job applications with intelligent form filling and personalized cover letters.",
      icon: <Bot className="w-8 h-8" />,
      benefits: [
        "Automated application submissions",
        "Custom cover letter generation",
        "Multi-platform job board integration",
        "Application status tracking"
      ],
      category: "Automation",
      premium: true
    },
    {
      id: "email-management",
      title: "Email Management",
      description: "Manage job-related emails with smart categorization and automated follow-ups.",
      icon: <Mail className="w-8 h-8" />,
      benefits: [
        "Gmail integration",
        "Automatic email categorization",
        "Interview confirmation tracking",
        "Follow-up reminders"
      ],
      category: "Communication"
    },
    {
      id: "application-tracker",
      title: "Application Tracker",
      description: "Keep track of all your job applications in one centralized, organized dashboard.",
      icon: <FileText className="w-8 h-8" />,
      benefits: [
        "Application status monitoring",
        "Interview scheduling",
        "Company research notes",
        "Deadline reminders"
      ],
      category: "Organization"
    },
    {
      id: "profile-optimization",
      title: "Profile & CV Optimization",
      description: "Optimize your professional profile and CV with AI-powered suggestions and ATS compliance.",
      icon: <Users className="w-8 h-8" />,
      benefits: [
        "ATS-compliant CV formatting",
        "Keyword optimization",
        "Skills gap analysis",
        "Industry-specific recommendations"
      ],
      category: "Optimization"
    },
    {
      id: "workflow-setup",
      title: "Setup Workflow",
      description: "Guided onboarding process to configure your job search preferences and automation settings.",
      icon: <Settings className="w-8 h-8" />,
      benefits: [
        "Step-by-step profile setup",
        "Preference configuration",
        "Integration connections",
        "Automation rule creation"
      ],
      category: "Setup"
    },
    {
      id: "smart-recommendations",
      title: "Smart Job Recommendations",
      description: "Receive personalized job recommendations based on your experience and career aspirations.",
      icon: <Target className="w-8 h-8" />,
      benefits: [
        "Machine learning recommendations",
        "Career progression suggestions",
        "Salary benchmarking",
        "Company culture matching"
      ],
      category: "Intelligence",
      premium: true
    }
  ]

  const categories = ["Core Features", "Automation", "Intelligence", "Analytics", "Communication", "Organization", "Optimization", "Setup"]

  const getFeaturesByCategory = (category: string) => {
    return features.filter(feature => feature.category === category)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 border border-gray-700 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 border border-gray-700 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-gray-800 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="inline-flex items-center px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Comprehensive Features
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Land Your Dream Job
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              AI Job Agent provides a complete suite of intelligent tools to streamline your job search, 
              automate applications, and maximize your success rate.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            <div className="text-center p-6 bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700">
              <div className="text-3xl font-bold text-green-400 mb-2">500+</div>
              <div className="text-gray-300 text-sm">Job Boards Connected</div>
            </div>
            <div className="text-center p-6 bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
              <div className="text-gray-300 text-sm">Application Success Rate</div>
            </div>
            <div className="text-center p-6 bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-300 text-sm">Jobs Applied Daily</div>
            </div>
            <div className="text-center p-6 bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-gray-300 text-sm">AI-Powered Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features by Category */}
      {categories.map((category, categoryIndex) => {
        const categoryFeatures = getFeaturesByCategory(category)
        if (categoryFeatures.length === 0) return null

        return (
          <section key={category} className={`py-16 ${categoryIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{category}</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="group relative bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105"
                  >
                    {/* Premium Badge */}
                    {feature.premium && (
                      <div className="absolute -top-3 -right-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Premium</span>
                        </Badge>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                      feature.premium 
                        ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 text-yellow-400' 
                        : 'bg-green-400/20 text-green-400'
                    }`}>
                      {feature.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Benefits List */}
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Integration Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect with your favorite platforms and tools for a unified job search experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "LinkedIn", icon: <Globe className="w-8 h-8" /> },
              { name: "Indeed", icon: <Search className="w-8 h-8" /> },
              { name: "Gmail", icon: <Mail className="w-8 h-8" /> },
              { name: "Glassdoor", icon: <Star className="w-8 h-8" /> },
              { name: "AngelList", icon: <Briefcase className="w-8 h-8" /> },
              { name: "Remote.co", icon: <Globe className="w-8 h-8" /> }
            ].map((integration, index) => (
              <div
                key={integration.name}
                className="flex flex-col items-center p-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div className="text-gray-400 mb-3">
                  {integration.icon}
                </div>
                <span className="text-gray-300 text-sm font-medium">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-green-400/10 to-blue-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who have already accelerated their careers with AI Job Agent
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-gray-900 px-8 py-4 rounded-3xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 py-4 rounded-3xl font-semibold text-lg transition-all duration-300 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Free 14-day trial</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Enterprise security</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">24/7 support</span>
            </div>
          </div>
        </div>
      </section> */}
      
    </div>
  )
}