"use client"

import React from "react"
import { Send, ChevronDown, Sparkles, Briefcase, User, CheckCircle, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wifi, Battery, Signal,ChevronLeft, ChevronRight } from 'lucide-react';


export default function AIFeaturesSection() {
  const [message, setMessage] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)

  const handleGetStarted = (feature: string) => {
    console.log(`Getting started with ${feature}`)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
      setMessage("")
    }
  }

  const jobApplications = [
    { title: "Senior Software Engineer", company: "Google", salary: "$180k", location: "Remote", match: "95%" },
    { title: "Product Manager", company: "Meta", salary: "$165k", location: "San Francisco", match: "88%" },
    { title: "Data Scientist", company: "Netflix", salary: "$155k", location: "Los Angeles", match: "92%" },
  ]

  const sidebarItems = [
    { name: "Job Search", active: true, icon: Briefcase, count: "12 new" },
    { name: "Applications", active: false, icon: CheckCircle, count: "47 sent" },
    { name: "Profile", active: false, icon: User, count: "85% complete" },
    { name: "Analytics", active: false, icon: TrendingUp, count: "View stats" },
  ]

  const aiMessages = [
    {
      type: "ai",
      content: "I found 12 high-match jobs for your profile! 🎯 Would you like me to auto-apply to the top 5?",
      timestamp: "2:34 PM",
    },
    {
      type: "user",
      content: "Yes, please apply to the software engineer positions with salary above $150k",
      timestamp: "2:35 PM",
    },
    {
      type: "ai",
      content:
        "Perfect! ✨ I've customized your resume for each role and submitted 3 applications. You should hear back within 48 hours!",
      timestamp: "2:35 PM",
    },
  ]

  return (
    <section className="py-20 bg-gray-900 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 border border-gray-700 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-gray-700 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-gray-800 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* First Section - Phone Interface and Content Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          {/* Left Side - Mobile Interface with Human Hand */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              {/* Human Hand Image */}
              <div className="absolute -right-12 -bottom-8 z-20 transform rotate-12">
                <img
                  src="https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=150&h=200&fit=crop&crop=hand"
                  alt="Hand interacting with phone"
                  className="w-24 h-32 object-cover rounded-2xl shadow-lg"
                />
              </div>

              {/* Phone Mockup */}
              <div className="w-80 bg-black rounded-[3.5rem] overflow-hidden shadow-2xl relative z-10 border-8 border-gray-800">
                {/* Phone Notch */}
                <div className="bg-black px-6 py-3 flex justify-center">
                  <div className="w-20 h-1.5 bg-gray-600 rounded-full" />
                </div>

                {/* Status Bar */}
                 <div className="bg-gray-900 px-4 py-2 flex justify-between items-center text-white text-sm font-medium">
                        {/* Left side - Time */}
                        <div className="flex items-center">
                          <span className="font-semibold">9:41</span>
                        </div>
                        
                        {/* Right side - Status icons */}
                        <div className="flex items-center space-x-2">
                          {/* Signal strength */}
                          <div className="flex items-center space-x-1">
                            <Signal size={14} className="opacity-90" />
                            <span className="text-xs opacity-90">5G</span>
                          </div>
                          
                          {/* WiFi */}
                          <Wifi size={14} className="opacity-90" />
                          
                          {/* Battery percentage */}
                          <div className="flex items-center space-x-1">
                            <Battery size={14} className="opacity-90" />
                            <span className="text-xs font-medium">100%</span>
                          </div>
                        </div>
                      </div>

                {/* App Content */}
                <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 h-[520px] relative">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                      </div>
                      <div>
                        <h2 className="text-white text-xl font-bold">JobBot AI</h2>
                        <p className="text-gray-400 text-sm flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          AI Assistant Active
                        </p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                      {aiMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] ${msg.type === "user" ? "order-2" : "order-1"}`}>
                            <div
                              className={`p-4 rounded-3xl shadow-lg ${
                                msg.type === "user"
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ml-4"
                                  : "bg-white text-gray-800 mr-4 border border-gray-100"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <p className={`text-xs mt-2 ${msg.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white rounded-3xl p-4 mr-4 shadow-lg border border-gray-100">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <div className="text-sm text-gray-400 uppercase tracking-wide font-medium">Quick Apply</div>
                      {jobApplications.slice(0, 2).map((job, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-4 border border-gray-600 hover:border-blue-400 transition-all cursor-pointer group hover:shadow-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{job.title}</p>
                              <p className="text-gray-400 text-xs">
                                {job.company} • {job.location}
                              </p>
                            </div>
                            <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                              {job.match} match
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Input
                        type="text"
                        placeholder="Find remote software jobs $150k+"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 bg-gray-800 border-gray-600 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-3 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105"
                        disabled={!message.trim()}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="bg-black px-6 py-3 flex justify-center">
                  <div className="w-24 h-1.5 bg-gray-600 rounded-full" />
                </div>
              </div>

              {/* Feature Card 1 - Auto Apply */}
              <div className="absolute -left-12 top-1/4 bg-gray-800/40 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-sm hidden xl:block border border-gray-700 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=60&h=60&fit=crop&crop=face"
                    alt="Happy user Sarah"
                    className="w-14 h-14 rounded-full object-cover border-2 border-green-400/30"
                  />
                  <div>
                    <h4 className="font-bold text-white">Sarah M.</h4>
                    <p className="text-sm text-green-400 font-medium">Got 3 interviews in 1 week! 🎉</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Auto-Apply to Jobs</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Our AI applies to hundreds of relevant jobs automatically, customizing your resume and cover letter
                  for each position while you sleep.
                </p>
                <Button
                  onClick={() => handleGetStarted("Auto Apply")}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-gray-900 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 w-full shadow-lg"
                >
                  Start Auto-Applying
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Content Card */}
          <div className="relative">
            {/* Feature Card - Smart Matching */}
            {/* <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=70&h=70&fit=crop&crop=face"
                  alt="Happy professional Mike"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div>
                  <h4 className="font-bold text-white">Mike R.</h4>
                  <p className="text-sm text-blue-400 font-medium">Landed dream job in 2 weeks! 🚀</p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-xs text-green-400 font-medium">$185k salary increase</span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Job Matching</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                AI analyzes your skills, experience, and preferences to find the perfect job matches. Get personalized
                recommendations that align with your career goals and salary expectations.
              </p>
              <Button
                onClick={() => handleGetStarted("Smart Matching")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 w-full shadow-lg"
              >
                Find My Perfect Job
              </Button>
            </div> */}
          </div>
        </div>

        {/* Second Section - Desktop Interface */}
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            {/* Desktop Interface */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700" style={{aspectRatio: '16/10', minHeight: '600px'}}>
              {/* Browser Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          {/* macOS window controls */}
          <div className="flex space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm" />
            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm" />
            <div className="w-4 h-4 bg-green-400 rounded-full shadow-sm" />
          </div>
          
          {/* Browser navigation arrows */}
          <div className="flex items-center space-x-2 ml-4">
            <button className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700">
              <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700">
              <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-gray-300 text-sm font-medium">JobBot AI Dashboard</div>
                
                <button className="text-gray-400 hover:text-white transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </button>
             
            </div>

              {/* Main Content Area */}
              <div className="flex h-[420px]">
                {/* Sidebar */}
                <div className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 p-6">
                  <div className="flex items-center space-x-3 mb-8">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                      alt="User avatar Alex"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                    />
                    <div>
                      <span className="text-white text-sm font-semibold">Welcome back!</span>
                      <p className="text-blue-400 text-xs font-medium">5 new matches today</p>
                    </div>
                  </div>

                  <nav className="space-y-3">
                    {sidebarItems.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <button
                          key={item.name}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm transition-all group ${
                            item.active
                              ? "text-blue-400 bg-blue-900/30 border border-blue-500/30 shadow-lg"
                              : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.active ? "bg-blue-500/20 text-blue-300" : "bg-gray-600 text-gray-300"
                            }`}
                          >
                            {item.count}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Main Dashboard Area - Word Document Editor */}
                <div className="flex-1 p-6 bg-gradient-to-br from-gray-900 to-gray-800">
                  {/* Document Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/>
                          </svg>
                        </div>
                        <span className="text-white font-semibold">Cover Letter - Software Engineer.docx</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded-full">Auto-saved</span>
                        <span>•</span>
                        <span>2 min ago</span>
                      </div>
                    </div>
                    
                    {/* Document Actions */}
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors">
                        Share
                      </button>
                      <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors">
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Document Toolbar */}
                  <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-600">
                    <div className="flex items-center space-x-4 text-xs">
                      <select className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600">
                        <option>Calibri</option>
                      </select>
                      <select className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600">
                        <option>11</option>
                      </select>
                      <div className="flex space-x-1">
                        <button className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center">
                          <strong>B</strong>
                        </button>
                        <button className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center">
                          <em>I</em>
                        </button>
                        <button className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center">
                          <u>U</u>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="bg-white rounded-lg p-6 shadow-lg" style={{minHeight: '250px'}}>
                    <div className="space-y-4 text-gray-900">
                      <div className="text-right text-sm text-gray-600">
                        John Smith<br/>
                        john.smith@ngazi.com<br/>
                        +254(7)98 387 784 <br/>
                        Nairobi, Kenya  <br/>
                      </div>
                      
                      <div className="text-left text-sm text-gray-600">
                        March 15, 2024
                      </div>
                      
                      <div className="text-left text-sm ">
                        <strong>Dear Hiring Manager,</strong>
                      </div>
                      
                      <div className="text-left text-sm leading-relaxed space-y-3 left">
                        <p>
                          I am writing to express my strong interest in the Senior Software Engineer position at your company. With over 5 years of experience in full-stack development and a passion for building scalable applications, I am excited about the opportunity to contribute to your team.
                        </p>
                        
                        <p className="left relative">
                          My expertise includes React, Node.js, Python, and cloud technologies like AWS. In my current role at Ngazi, I have successfully led the development of a microservices architecture that improved system performance by 40% and reduced deployment time by 60%.
                          <span className="absolute -right-2 top-0 w-1 h-6 bg-blue-500 animate-pulse"></span>
                        </p>
                        
                        <p className="text-gray-500">
                          I am particularly drawn to your company's mission of using technology to solve real-world problems...
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Suggestions Panel */}
                  <div className="mt-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-blue-400 font-medium text-sm">AI Writing Assistant</span>
                          <span className="text-xs text-gray-400">• Analyzing content</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          Great start! I suggest adding specific metrics from your previous projects and mentioning the company's recent product launch to show you've researched them.
                        </p>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                            Apply suggestion
                          </button>
                          <button className="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-xs rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only feature cards */}
        <div className="xl:hidden mt-20 grid gap-8 sm:grid-cols-2">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=60&h=60&fit=crop&crop=face"
                alt="Happy user Sarah"
                className="w-14 h-14 rounded-full object-cover border-2 border-green-400/30"
              />
              <div>
                <h4 className="font-bold text-white">Sarah M.</h4>
                <p className="text-sm text-green-400 font-medium">Got 3 interviews! 🎉</p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Auto-Apply to Jobs</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Our AI applies to hundreds of relevant jobs automatically, saving you hours of manual work every day.
            </p>
            <Button
              onClick={() => handleGetStarted("Auto Apply")}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-gray-900 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 w-full shadow-lg"
            >
              Start Auto-Applying
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
