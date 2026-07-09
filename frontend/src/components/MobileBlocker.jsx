import { useEffect, useState } from 'react'

function MobileBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i
      
      // Check user agent
      const isMobileDevice = mobileRegex.test(userAgent)
      
      // Check screen size as fallback
      const isSmallScreen = window.innerWidth < 1024
      
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🖥️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Desktop Only</h1>
          <p className="text-gray-400 text-lg mb-6">
            This CMS system is designed for desktop use only and is not accessible on mobile devices.
          </p>
          <p className="text-gray-500 text-sm">
            Please access this system from a desktop or laptop computer.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default MobileBlocker
