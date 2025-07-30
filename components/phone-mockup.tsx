"use client"

import React from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PhoneMockupProps {
  className?: string
}

export function PhoneMockup({ className = "" }: PhoneMockupProps) {
  const [message, setMessage] = React.useState("")

  const recentQueries = ["Explain quantum computing", "How do I make HTTP request in Javascript?"]

  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="w-80 bg-black rounded-[3rem] overflow-hidden border-4 border-gray-200 shadow-2xl">
        {/* Phone Notch */}
        <div className="bg-black px-6 py-2 flex justify-center">
          <div className="w-16 h-1.5 bg-gray-700 rounded-full" />
        </div>

        {/* Status Bar */}
        <div className="bg-gray-900 px-6 py-2 flex justify-between items-center text-white text-xs">
          <span className="font-medium">9:41</span>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1" aria-label="Signal strength">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-1 h-3 rounded-full ${i < 3 ? "bg-white" : "bg-gray-600"}`} />
              ))}
            </div>
            <div className="text-xs">100%</div>
          </div>
        </div>

        {/* App Content */}
        <div className="bg-gray-900 h-[500px] relative">
          <div className="p-6">
            <h2 className="text-white text-xl font-medium mb-8">How can I help you today?</h2>

            <div className="space-y-4">
              <div className="text-sm text-gray-500 uppercase tracking-wide">Latest activity</div>

              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                >
                  <p className="text-gray-300 text-sm">{query}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="How to set DNS for my server?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-600 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-400 focus:border-green-500"
              />
              <Button
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl text-sm font-medium"
                disabled={!message.trim()}
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="bg-black px-6 py-2 flex justify-center">
          <div className="w-20 h-1 bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  )
}
