import { useEffect } from 'react'

export default function useClickBurst() {
  useEffect(() => {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#db2777', '#3b82f6']
    const handler = (e) => {
      for (let i = 0; i < 12; i++) {
        const el = document.createElement('div')
        el.className = 'burst-particle'
        const angle = Math.random() * Math.PI * 2
        const dist  = 40 + Math.random() * 60
        el.style.setProperty('--origin-x', e.clientX + 'px')
        el.style.setProperty('--origin-y', e.clientY + 'px')
        el.style.setProperty('--tx', Math.cos(angle) * dist + 'px')
        el.style.setProperty('--ty', Math.sin(angle) * dist + 'px')
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        document.body.appendChild(el)
        setTimeout(() => el.remove(), 800)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])
}
