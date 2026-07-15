export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-10">
      <p className="font-mono text-[11px] uppercase tracking-widest2 text-teal mb-4">
        One payment, every collaborator paid
      </p>
      <h2 className="font-display font-semibold text-3xl sm:text-5xl leading-[1.05] text-mist max-w-2xl">
        Register a split once.{' '}
        <span className="text-teal">Every payment fans out</span>{' '}
        automatically — no intermediary holding the money.
      </h2>
      <p className="mt-5 text-mist-dim/80 max-w-xl text-sm sm:text-base leading-relaxed">
        A creator registers collaborators and their percentage shares. From
        then on, whoever pays for the work sends one transaction — and
        every collaborator receives their cut directly, in the same
        transaction. Splits lock after the first payout, so no one can be
        quietly cut out later.
      </p>
    </section>
  )
}
