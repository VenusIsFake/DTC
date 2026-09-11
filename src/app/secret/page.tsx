import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '∴⌇∎ ⌰⍜⍜⌿',
  robots: { index: false, follow: false },
}

const JUMBLE = [
  'molaire incisive canine sagesse',
  'PLQX WHFK QHFDYH SDV',
  'd-e-n-t-a-l-k-c-l-u-b',
  '⌰⍜ ⊑⍜⌰⌿ ⏁⍜⍜⏁⍜',
  'brosse fil dentirifrice bain de bouche',
  '0xE1D36 #C8AF69 ???',
  'salive · émail · dentine · pulpe',
]

export default function SecretPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0E1D36',
      color: '#C8AF69',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: '4rem', animation: 'secretspin 7s linear infinite' }}>🦷</div>
      <h1 style={{ fontSize: '1.4rem', letterSpacing: '0.5em', margin: 0 }}>
        TU AS TROUVÉ LA PORTE DE DERRIÈRE
      </h1>
      <p style={{ opacity: 0.7, maxWidth: '40ch', margin: 0 }}>
        cette page n&apos;existe pas. elle n&apos;a jamais existé.
        tu n&apos;es pas non plus censé·e la lire. et pourtant.
      </p>
      <div aria-hidden style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', opacity: 0.55, fontSize: '0.85rem' }}>
        {JUMBLE.map((line, i) => (
          <span key={i} style={{ animation: `secretwobble ${3 + i}s ease-in-out infinite alternate`, display: 'inline-block' }}>
            {line}
          </span>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', opacity: 0.4, margin: 0 }}>
        ~ les molaires du comité secret vous saluent ~
      </p>
      <style>{`
        @keyframes secretspin { to { transform: rotate(360deg) } }
        @keyframes secretwobble { from { transform: rotate(-1.5deg) } to { transform: rotate(1.5deg) translateX(4px) } }
      `}</style>
    </main>
  )
}
