export default function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span
        className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${
          light
            ? "bg-white/10 text-green-100"
            : "bg-green-50 text-green-800"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-dvcAmber" />
        {eyebrow}
      </span>

      <h2
        className={`text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 text-base leading-7 sm:text-lg ${
            light ? "text-green-50/80" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------
