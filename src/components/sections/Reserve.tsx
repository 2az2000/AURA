import { useId, useState, type FormEvent } from 'react'
import { brand, reserve } from '../../content/copy'
import { FadeUp, LineReveal } from '../ui/Reveal'
import { SectionHead } from '../ui/SectionHead'

type Status = 'idle' | 'invalid' | 'done'

/**
 * 06 — Closing call to action + footer.
 * The form is a front-end demo only: it validates and confirms but sends nothing.
 * To wire it to a real service, replace the body of `onSubmit` (see README).
 */
export function Reserve() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const inputId = useId()
  const msgId = useId()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
    setStatus(ok ? 'done' : 'invalid')
  }

  return (
    <>
      <section
        id="reserve"
        data-shot="reserve"
        aria-labelledby="reserve-title"
        className="layer-fg scrim flex min-h-[110svh] items-end pb-[9svh] pt-[48svh]"
      >
        <div className="wrap flex flex-col items-center text-center">
          <FadeUp>
            <SectionHead index={reserve.index} label={reserve.label} />
          </FadeUp>
          <LineReveal
            id="reserve-title"
            lines={reserve.title}
            className="display mt-6 text-[length:var(--text-h1)]"
          />
          <FadeUp delay={0.2}>
            <p className="lead mt-6 max-w-[48ch]">{reserve.body}</p>
          </FadeUp>
          <FadeUp delay={0.3} className="mt-8 w-full max-w-md text-left">
            <form onSubmit={onSubmit} noValidate aria-describedby={msgId}>
              <label htmlFor={inputId} className="label block">Email</label>
              <div className="mt-3 flex border-b border-silver/40 transition-colors focus-within:border-ice">
                <input
                  id={inputId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={reserve.placeholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status !== 'idle') setStatus('idle')
                  }}
                  aria-invalid={status === 'invalid'}
                  className="min-w-0 flex-1 bg-transparent py-4 text-lg text-bone placeholder:text-steel focus:outline-none"
                />
                <button
                  type="submit"
                  className="label shrink-0 px-2 text-bone transition-colors hover:text-ice focus-visible:text-ice"
                >
                  {reserve.button} →
                </button>
              </div>
              <p
                id={msgId}
                role="status"
                className={`mt-3 min-h-6 text-[0.8125rem] ${status === 'invalid' ? 'text-[#ff9b8a]' : status === 'done' ? 'text-ice' : 'text-mist'}`}
              >
                {status === 'invalid' ? reserve.invalid : status === 'done' ? reserve.success : reserve.consent}
              </p>
            </form>
          </FadeUp>
        </div>
      </section>

      <footer className="layer-fg border-t border-silver/10 pb-10 pt-8">
        <div className="wrap flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="display text-lg tracking-[0.32em]">{brand.name}</p>
            <p className="mt-3 max-w-[48ch] text-[0.8125rem] text-mist">{brand.disclaimer}</p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <p className="label">Type: Space Grotesk, Inter, JetBrains Mono (SIL OFL)</p>
            <a href="#top" className="label text-bone transition-colors hover:text-ice">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </>
  )
}
