export default function SjcModal({ onClose, onStart }) {
  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-center justify-center p-5">
      <div className="bg-white p-8 md:p-10 rounded-[40px] w-full max-w-[600px] animate-fade-in-up relative shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold text-gray-300 hover:text-gray-500 z-20" aria-label="Close">&times;</button>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-sjc/5 rounded-full" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-sjc text-white font-bold rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg">SJC</div>
          <h3 className="text-xl font-extrabold text-gray-800 mb-4 leading-tight">About SJC Institute</h3>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
            This MCQ quiz is based on materials from the SJC Institute, one of the oldest institutions supporting CMA students.
          </p>
          <div className="bg-indigo-50/50 p-6 rounded-[28px] border border-indigo-100 mb-8 text-left">
            <p className="text-xs md:text-sm font-semibold text-indigo-600 mb-4 text-center">📺 Try this quiz while watching the accompanying video for best results.</p>
            <a href="https://www.youtube.com/watch?v=QkVVoCPjLFU&list=PLM5Q5CSb57Q3NQaygJcRa7DoK3CnwUBFF" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 hover:border-primary group transition-all">
              <i className="fab fa-youtube text-red-600 text-2xl group-hover:scale-110 transition-transform" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Watch Workshop</span>
                <span className="block text-xs md:text-sm font-bold text-slate-700">Costing MCQ Mastery Class</span>
              </div>
            </a>
          </div>
          <button onClick={onStart}
            className="w-full py-4 bg-sjc text-white rounded-2xl font-bold shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all">
            Start CMA Quiz Now
          </button>
        </div>
      </div>
    </div>
  )
}
