"use client"

interface Testimonial {
  id: number
  name: string
  // title: string
  // company: string
  content: string
  avatar: string
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Timothy Chepkener",
            content:
        "I recently used an AI chat system and it exceeded my expectations. The speed and accuracy of the responses were impressive, and the personalized recommendations were a nice touch. I highly recommend it to anyone looking to streamline their Job Application process.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 2,
      name: "Sarah",
     
      content:
        "The Automated Job Search Assistant has been a game-changer for me. It helped me find relevant job openings quickly and efficiently. The AI's ability to understand my skills and preferences made the process so much easier. I landed a great job within weeks!",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 3,
      name: "Michael Muya",
     
      content:
        "It recommended jobs that perfectly matched my skills and experience.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 4,
      name: "Susan Wanjiru",
     
      content:
        "The tool extracted key information from my CV and cover letter, making it easy to apply for jobs.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 5,
      name: "David Kamau",
 
      content:
        "It's a comprehensive CV intelligence platform. Helped me in personlization of my CV and cover letter, and the AI job search feature is a game changer. ",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 6,
      name: "Titus Kibiwot",
   
      content:
        "It saved me hours of manual searching and helped me find relevant jobs that match my skills and experience.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="py-20 bg-gray-900 overflow-hidden relative rounded-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 border border-gray-700 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-gray-700 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-gray-800 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Content */}
          <div className="lg:sticky lg:top-20">
            <div className="inline-block px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-sm font-medium text-gray-300 mb-6">
              Testimonials
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">What Job Seekers are Saying</h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              Read what our satisfied customers have to say about our products/services. We take pride in providing
              exceptional customer service and value their feedback.
            </p>
          </div>

          {/* Right Side - Animated Testimonials */}
          <div className="relative h-[600px] overflow-hidden">
            <div className="absolute inset-0">
              {/* Gradient overlays for fade effect */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-900 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent z-10" />

              {/* Animated testimonials container */}
              <div className="animate-scroll-up space-y-6">
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 mx-4"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={`${testimonial.name} avatar`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">
                          {testimonial.title} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{testimonial.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }
        
        .animate-scroll-up:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
