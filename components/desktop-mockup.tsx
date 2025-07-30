import { ChevronDown, Sparkles } from "lucide-react"

interface DesktopMockupProps {
  className?: string
}

export function DesktopMockup({ className = "" }: DesktopMockupProps) {
  const sidebarItems = [
    { name: "Ask the AI", active: true },
    { name: "History", active: false },
    { name: "Team", active: false },
    { name: "Account", active: false },
  ]

  const recentQueries = ["Explain quantum computing", "How do I make HTTP request in Javascript?"]

  return (
    <div className={`bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Browser Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <button className="text-gray-400 hover:text-white transition-colors" aria-label="Minimize window">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[400px]">
        {/* Sidebar */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-gray-900" />
            </div>
            <span className="text-white text-sm">Good morning, Chris</span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors ${
                  item.active ? "text-green-400 bg-gray-700" : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 bg-gray-900">
          <h2 className="text-white text-xl font-medium mb-6">How can I help you today?</h2>

          <div className="space-y-4">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Latest activity</div>

            <div className="space-y-2">
              {recentQueries.map((query, index) => (
                <button key={index} className="block text-left text-gray-300 hover:text-white transition-colors">
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
