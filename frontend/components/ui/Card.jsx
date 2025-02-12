// src/components/ui/Card.jsx
export function Card({ children, className }) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children }) {
    return <div className="">{children}</div>;
  }
  