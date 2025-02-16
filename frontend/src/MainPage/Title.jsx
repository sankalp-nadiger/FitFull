import React from 'react';

const GlitteringTitle = () => {
  return (
    <h2 className="text-center text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 font-bold tracking-tight">
      <span className="inline-block animate-glitter bg-gradient-to-r bg-clip-text text-transparent 
        from-neutral-900 via-neutral-600 to-neutral-900 
        dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-100">
        FitFull
      </span>
      <br />
      <span className="text-gray-300 text-lg md:text-5xl">
  Your <span className="text-violet-400">Buddy</span> for 
  <span className="text-violet-400"> 360°</span> Health
</span>


      <style jsx>{`
        .animate-glitter {
          background-size: 200% auto;
          animation: glitter 2s linear infinite;
        }

        @keyframes glitter {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </h2>
  );
};

export default GlitteringTitle;