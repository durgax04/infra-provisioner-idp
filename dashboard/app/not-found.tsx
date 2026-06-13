import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white font-sans px-4">
      <h1 className="text-9xl font-extrabold tracking-widest text-zinc-100 drop-shadow-md selection:bg-orange-500">
        404
      </h1>
      
      <div className="bg-[#ff6600] h-1 w-16 my-4 rounded-full"></div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-wide mb-2">
          Page Not Found
        </h2>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto">
          The route you are looking for doesn't exist or has been moved to another bucket.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link 
          href="/" 
          className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-sm transition-colors duration-200 border border-zinc-800 w-full sm:w-auto text-center"
        >
          Back to Bucket Creator
        </Link>
        
        <div className="flex gap-4 text-xs text-zinc-500">
          <Link href="/requests" className="hover:text-[#ff6600] transition-colors">
            Requests
          </Link>
          <span>•</span>
          <Link href="/metrics" className="hover:text-[#ff6600] transition-colors">
            Metrics
          </Link>
        </div>
      </div>
    </div>
  );
}