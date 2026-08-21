export default function NexoLogo({
  size = 48,
  className = ''
}) {
  return (
    <div
      className={`nexo-logo ${className}`}
      style={{
        width: size,
        height: size
      }}
      aria-label="Nexo"
    >
      <span className="nexo-logo-line nexo-logo-left" />

      <span className="nexo-logo-line nexo-logo-center" />

      <span className="nexo-logo-line nexo-logo-right" />

      <span className="nexo-logo-dot nexo-logo-dot-left" />

      <span className="nexo-logo-dot nexo-logo-dot-right" />
    </div>
  )
}