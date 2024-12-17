"use client"

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export const LearnMoreText = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 flex items-center gap-2 animate-bounce">
      <span className="text-xl font-medium">Learn More</span>
      <ChevronDown className="w-4 h-4" />
    </div>
  )
}
