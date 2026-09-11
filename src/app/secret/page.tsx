import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '∴⌇∎ ⌰⍜⍜⌿',
  robots: { index: false, follow: false },
}

/* visuellement illisible volontairement — aucun mot réel à l'écran */
const SOUP = [
  '⌰⍾⌿⎍⏁⍜⟒⌇⏁⊑⍜⎍⌰ ⌿⍜⌇⏁ ⏁⍜⍜⏁⍜ ⌰⍜⌇⏁',
  'ᚱ᛫ᚢ᛫ᚾ᛫ᛁ᛫ᚲ ᛭ ᛞᛖᚾᛏ ᛭ ᛭ ᛭ ᛋᛖᚲᚱᛖᛏ',
  '▓▒░█ ⌰̬̤̺̓̈́o̷̢͌̊å̶̧ḓ̷̛̳ ⌿̸̰̈́̀⌇̵̱͝║▒▓░ █░▒▓',
  '𝔡̷̛̺̈́𝔢̷̱̿͑𝔫̷̤̓͜𝔱̷̰̾̅ ⊰⊱ ⏃⌇⌇⍜⌰⎍⏁ ╱╲╱╲',
  '⌿⍜⌇⏁ ⏁⍜⍜⏁⍜ ⌰⍜⌇⏁ ⌰⍜⌇⏁ ⌿⍜⌇⏁ ⏁⍜⍜⏁⍜',
  '᚛ᚈᚔᚈ᚜ ᚛ᚉᚂᚐ᚜ ᚛ᚄᚓᚉᚏᚓᚈ᚜ ▓░▒ ᚛ᚉᚂᚐ᚜',
  '⌇̷̨̛̛̰⌇̶̤͔̈́̈́⌇̸̰̾̾ ⊰᜔̡̳̿̒⊱ ⌇̷̨̛̰⌇̶̤̈́⌇̸̰̾ █▓▒░ ⌇⌇⌇',
  '⏁⍜⍜⏁⍜ ⌰⍜⌇⏁ ⌿⍜⌇⏁ ⏁⍜⍜⏁⍜ ⌰⍜⌇⏁ ⏁⍜⍜⏁⍜ ⌿⍜⌇⏁',
]

export default function SecretPage() {
  return (
    <main
      aria-label="Page secrète du club — contenu volontairement illisible"
      style={{
        minHeight: '100vh',
        background: '#0E1D36',
        color: '#C8AF69',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.1rem',
        padding: '2rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden style={{ fontSize: '4rem', animation: 'secretspin 9s linear infinite' }}>🦷</div>
      <h1
        aria-hidden
        style={{
          fontSize: '2rem',
          letterSpacing: '0.35em',
          margin: 0,
          filter: 'blur(0.6px)',
          animation: 'secretjitter 0.35s steps(2) infinite',
        }}
      >
        ⌰̷̨̛̛̤͔̬̊̓̈́⍾̶̰̰̾̾͝⌿̸̱̱̿̿͝⎍̛̳̳̒̒͝⏁̤̓̓͜͜⍜ḓ̷̛̳̒ ⌿̸̰̈́́⌇̵̱͝͝⏁̷̤̓̓⌰⍜⌇⏁
      </h1>
      <div aria-hidden style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.6, fontSize: '0.85rem', lineHeight: 1.9 }}>
        {SOUP.map((line, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              animation: `secretwobble ${2.5 + i * 0.7}s ease-in-out infinite alternate`,
              filter: i % 2 === 0 ? 'blur(0.4px)' : 'none',
              transform: `translateX(${(i % 3) * 8 - 8}px)`,
            }}
          >
            {line}
          </span>
        ))}
      </div>
      <p aria-hidden style={{ fontSize: '0.7rem', opacity: 0.3, margin: 0, letterSpacing: '0.6em', animation: 'secretjitter 0.5s steps(3) infinite' }}>
        ▓░▒█▒░▓ █▒░▓░▒ ▓▒░█▒
      </p>
      <style>{`
        @keyframes secretspin { to { transform: rotate(360deg) } }
        @keyframes secretwobble { from { transform: translateX(-6px) rotate(-2deg) } to { transform: translateX(6px) rotate(2deg) } }
        @keyframes secretjitter { 0% { transform: translate(0,0) } 50% { transform: translate(1px,-1px) } 100% { transform: translate(-1px,1px) } }
        @media (prefers-reduced-motion: reduce) {
          main * { animation: none !important }
        }
      `}</style>
    </main>
  )
}
