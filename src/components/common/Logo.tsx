interface LogoProps {
  className?: string
}

export const Logo = ({ className = "h-16" }: LogoProps) => {
  return (
    <div className={`${className} aspect-square rounded-lg border-2 border-gray-400 flex items-center justify-center p-2`}>
      <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 4v16M4 12h16" strokeLinecap="round" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    </div>
  )
} 