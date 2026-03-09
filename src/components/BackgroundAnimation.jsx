const symbols = [
  { sym:'₹', left:'5%',  size:40, dur:22, delay:0,  color:'text-emerald-200' },
  { sym:'%', left:'15%', size:30, dur:25, delay:2,  color:'text-indigo-200' },
  { sym:'$', left:'25%', size:50, dur:18, delay:5,  color:'text-amber-200' },
  { sym:'€', left:'35%', size:45, dur:20, delay:1,  color:'text-rose-200' },
  { sym:'£', left:'45%', size:35, dur:28, delay:7,  color:'text-blue-200' },
  { sym:'π', left:'55%', size:55, dur:24, delay:3,  color:'text-violet-200' },
  { sym:'¥', left:'65%', size:40, dur:30, delay:6,  color:'text-orange-200' },
  { sym:'×', left:'75%', size:30, dur:21, delay:4,  color:'text-pink-200' },
  { sym:'∑', left:'85%', size:50, dur:27, delay:8,  color:'text-teal-200' },
  { sym:'฿', left:'95%', size:45, dur:23, delay:2,  color:'text-cyan-200' },
]

export default function BackgroundAnimation({ tinted }) {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden select-none opacity-50" aria-hidden="true">
      {symbols.map((s, i) => (
        <span
          key={i}
          className={`shape ${s.color} ${tinted ? 'opacity-80' : ''} font-bold`}
          style={{
            left: s.left,
            fontSize: s.size + 'px',
            animationName: 'rise',
            animationDuration: s.dur + 's',
            animationDelay: s.delay + 's',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          {s.sym}
        </span>
      ))}
    </div>
  )
}
