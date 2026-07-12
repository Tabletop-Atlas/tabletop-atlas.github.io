/** A click-to-enlarge card image, lifted out of `SpiritDetail` (v3 #11) so any surface — the
 * Cards tab included — can reuse it instead of building a second one. */
export function CardViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="card-enlarge-backdrop"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <img src={src} alt={alt} />
    </div>
  )
}
