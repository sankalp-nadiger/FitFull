// src/components/ui/Button.jsx
export function Button({ children, className, ...props }) {
    return (
      <button 
        className={`px-4 py-2 rounded-lg font-semibold shadow-md ${className}`} 
        {...props}
      >
        {children}
      </button>
    );
  }
  