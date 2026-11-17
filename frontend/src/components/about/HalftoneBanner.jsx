// import { useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// import { motion, useReducedMotion } from "framer-motion";
// import { ArrowRight } from "lucide-react";

// // Animated halftone dot field drawn on a canvas.
// function HalftoneCanvas({ color = "#16a34a", spacing = 18 }) {
//   const canvasRef = useRef(null);
//   const reduceMotion = useReducedMotion();

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let frame;
//     let w = 0;
//     let h = 0;

//     const draw = (t = 0) => {
//       ctx.clearRect(0, 0, w, h);
//       ctx.fillStyle = color;

//       const cols = Math.ceil(w / spacing) + 1;
//       const rows = Math.ceil(h / spacing) + 1;

//       for (let j = 0; j < rows; j++) {
//         for (let i = 0; i < cols; i++) {
//           const x = i * spacing + (j % 2 ? spacing / 2 : 0);
//           const y = j * spacing;
//           const nx = x / w;
//           const ny = y / h;

//           // Moving wave, faded so dots grow toward the right side.
//           const wave =
//             Math.sin(nx * 6 + t * 0.0006) * Math.cos(ny * 5 - t * 0.0004);
//           const strength = ((wave + 1) / 2) * (0.2 + 0.8 * nx);
//           const radius = strength * spacing * 0.5;

//           if (radius > 0.5) {
//             ctx.beginPath();
//             ctx.arc(x, y, radius, 0, Math.PI * 2);
//             ctx.fill();
//           }
//         }
//       }
//     };

//     const loop = (t) => {
//       draw(t);
//       frame = requestAnimationFrame(loop);
//     };

//     const resize = () => {
//       const dpr = Math.min(window.devicePixelRatio || 1, 2);
//       const rect = canvas.getBoundingClientRect();
//       w = rect.width;
//       h = rect.height;
//       canvas.width = w * dpr;
//       canvas.height = h * dpr;
//       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
//       if (reduceMotion) draw(0); // static frame only
//     };

//     resize();
//     const observer = new ResizeObserver(resize);
//     observer.observe(canvas);
//     if (!reduceMotion) frame = requestAnimationFrame(loop);

//     return () => {
//       cancelAnimationFrame(frame);
//       observer.disconnect();
//     };
//   }, [color, spacing, reduceMotion]);

//   return (
//     <canvas
//       ref={canvasRef}
//       aria-hidden="true"
//       className="absolute inset-0 h-full w-full"
//     />
//   );
// }

// export default function HalftoneBanner() {
//   const reduceMotion = useReducedMotion();

//   return (
//     <section className="relative isolate overflow-hidden bg-[#0f2f23]">
//       <HalftoneCanvas color="#4ade80" spacing={18} />

//       {/* Gradient keeps the text readable on the left. */}
//       <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#0f2f23] via-[#0f2f23]/80 to-transparent" />

//       <motion.div
//         initial={reduceMotion ? false : { opacity: 0, y: 20 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true }}
//         transition={{ duration: 0.6 }}
//         className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
//       >
//         <p className="text-sm font-semibold uppercase tracking-widest text-green-300">
//           Since 2014
//         </p>
//         <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
//           A neighborhood store, now at your fingertips.
//         </h2>
//         <p className="mt-5 max-w-xl leading-8 text-green-50/80">
//           Browse our full catalog online with the same honest service you
//           get at our Dambulla Road counter.
//         </p>
//         <Link
//           to="/Shop"
//           className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-green-900 transition hover:-translate-y-0.5 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0f2f23]"
//         >
//           Explore Catalog
//           <ArrowRight size={18} />
//         </Link>
//       </motion.div>
//     </section>
//   );
// }

/*
 * HalftoneBanner.jsx
 * Banner section for the About page.
 * Sequence: a finger reaches toward the monitor -> taps "Open DVC Store" ->
 * the screen switches to the storefront, a halftone ripple spreads, and the
 * headline "A neighborhood store, now at your fingertips." fades in slowly.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Cable,
  Camera,
  Gamepad2,
  Headphones,
  Smartphone,
  Tv,
} from "lucide-react";

// --------------------------------------------------
// Halftone dot field (canvas). `burstRef` holds the time of the tap so a
// ring of bigger dots can spread out from the monitor.
// --------------------------------------------------
function HalftoneCanvas({ burstRef, color = "#4ade80", spacing = 18 }) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;
    let w = 0;
    let h = 0;

    const draw = (t = 0) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      const bx = w * 0.75; // burst origin ~ monitor position
      const by = h * 0.5;
      const age = burstRef.current ? (t - burstRef.current) / 1000 : 99;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * spacing + (j % 2 ? spacing / 2 : 0);
          const y = j * spacing;
          const nx = x / w;
          const ny = y / h;

          const wave =
            Math.sin(nx * 6 + t * 0.0006) * Math.cos(ny * 5 - t * 0.0004);
          let strength = ((wave + 1) / 2) * (0.2 + 0.8 * nx);

          // Ripple ring that expands after the tap.
          if (age >= 0 && age < 2.6) {
            const d = Math.hypot(x - bx, y - by);
            const ring = Math.exp(-Math.pow((d - age * 520) / 70, 2));
            strength = Math.min(1, strength + ring * (1 - age / 2.6));
          }

          const radius = strength * spacing * 0.5;
          if (radius > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const loop = (t) => {
      draw(t);
      frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) draw(0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!reduceMotion) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [color, spacing, reduceMotion, burstRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}

// --------------------------------------------------
// Pointing hand. The fingertip is the top-center of the SVG (60, 0),
// so the animation can aim it exactly at a point.
// --------------------------------------------------
function PointingHand() {
  const skin = "#f1c9a5";
  const edge = "#d4a07a";
  return (
    <svg
      viewBox="0 0 120 230"
      className="w-full drop-shadow-2xl"
      aria-hidden="true"
    >
      {/* sleeve */}
      <rect x="26" y="172" width="68" height="70" rx="10" fill="#14532d" />
      <rect x="26" y="172" width="68" height="12" fill="#166534" />
      {/* palm */}
      <rect x="22" y="80" width="76" height="100" rx="30" fill={skin} stroke={edge} strokeWidth="2" />
      {/* curled fingers */}
      {[92, 112, 132].map((y) => (
        <rect key={y} x="62" y={y} width="38" height="22" rx="11" fill={skin} stroke={edge} strokeWidth="2" />
      ))}
      {/* thumb */}
      <rect x="8" y="108" width="34" height="24" rx="12" transform="rotate(28 25 120)" fill={skin} stroke={edge} strokeWidth="2" />
      {/* index finger */}
      <rect x="48" y="2" width="24" height="120" rx="12" fill={skin} stroke={edge} strokeWidth="2" />
      <rect x="54" y="8" width="12" height="14" rx="6" fill="#f8e1cf" />
    </svg>
  );
}

// --------------------------------------------------
// Monitor screen contents
// --------------------------------------------------
const tiles = [
  { Icon: Smartphone, bg: "bg-green-100" },
  { Icon: Headphones, bg: "bg-amber-100" },
  { Icon: Tv, bg: "bg-green-100" },
  { Icon: Camera, bg: "bg-amber-100" },
  { Icon: Cable, bg: "bg-green-100" },
  { Icon: Gamepad2, bg: "bg-amber-100" },
];

function StoreScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col bg-white"
    >
      <div className="flex items-center justify-between bg-green-800 px-3 py-2 text-white">
        <span className="text-[10px] font-bold sm:text-xs">DVC Store</span>
        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
          Open now
        </span>
      </div>
      <div
        className="h-3 shrink-0"
        style={{
          background:
            "repeating-linear-gradient(90deg,#16a34a 0 14px,#ffffff 14px 28px)",
        }}
      />
      <div className="grid flex-1 grid-cols-3 gap-2 p-3">
        {tiles.map(({ Icon, bg }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
            className={`flex items-center justify-center rounded-lg ${bg} text-green-900`}
          >
            <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.6} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TapScreen() {
  return (
    <div className="flex h-full items-center justify-center bg-[#10261c]">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-20 w-20 animate-ping rounded-full bg-green-400/30" />
        <span className="relative rounded-full bg-green-500 px-4 py-2 text-[10px] font-bold text-white shadow-lg sm:text-xs">
          Open DVC Store
        </span>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Hand animation states. The fingertip ends exactly on the screen center.
// --------------------------------------------------
const handVariants = {
  idle: { x: 120, y: 260, rotate: -16, opacity: 0, scale: 1 },
  reach: {
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 2, delay: 0.4, ease: [0.45, 0, 0.2, 1] },
  },
  tap: {
    y: 10,
    scale: 0.94,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  open: {
    x: 90,
    y: 220,
    rotate: -14,
    opacity: 0,
    scale: 1,
    transition: { duration: 1.1, delay: 0.5, ease: "easeIn" },
  },
};

const headline = "A neighborhood store, now at your fingertips.".split(" ");

const wordVariants = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

// --------------------------------------------------
// Main banner
// --------------------------------------------------
export default function HalftoneBanner() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.5 });
  const burstRef = useRef(0);

  // idle -> reach -> tap -> open
  const [phase, setPhase] = useState(reduceMotion ? "open" : "idle");

  useEffect(() => {
    if (reduceMotion) setPhase("open");
    else if (inView) setPhase("reach");
  }, [inView, reduceMotion]);

  const handleHandDone = (name) => {
    if (name === "reach") {
      burstRef.current = performance.now();
      setPhase("tap");
    } else if (name === "tap") {
      setPhase("open");
    }
  };

  const revealed = phase === "open";
  const screenOn = phase === "tap" || phase === "open";

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#0f2f23]"
    >
      <HalftoneCanvas burstRef={burstRef} />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#0f2f23] via-[#0f2f23]/80 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
        {/* Text: stays in the DOM for screen readers, fades in after the tap. */}
        <div className="order-2 lg:order-1">
          <h2
            aria-label="A neighborhood store, now at your fingertips."
            className="max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            <motion.span
              aria-hidden="true"
              initial="hidden"
              animate={revealed ? "show" : "hidden"}
              transition={{ staggerChildren: 0.18 }}
              className="inline"
            >
              {headline.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariants}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="mr-[0.25em] inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </motion.span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 1.2, delay: revealed ? 1.6 : 0 }}
            className="mt-5 max-w-md leading-8 text-green-50/80"
          >
            Browse our full catalog online with the same honest service you
            get at our Dambulla Road counter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 1, delay: revealed ? 2.1 : 0 }}
          >
            <Link
              to="/Shop"
              tabIndex={revealed ? 0 : -1}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-green-900 transition hover:-translate-y-0.5 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0f2f23]"
            >
              Explore Catalog
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Monitor + hand */}
        <div className="order-1 mx-auto w-full max-w-md pb-6 lg:order-2">
          <div className="relative">
            {/* Monitor body */}
            <div className="rounded-2xl border border-white/10 bg-[#0a1a13] p-3 shadow-2xl shadow-black/40">
              <div className="relative aspect-16/10 overflow-hidden rounded-lg">
                {screenOn ? <StoreScreen /> : <TapScreen />}

                {/* Tap ripple at screen center */}
                {screenOn && !reduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    initial={{ scale: 0, opacity: 0.7 }}
                    animate={{ scale: 9, opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="pointer-events-none absolute left-1/2 top-1/2 -ml-4 -mt-4 h-8 w-8 rounded-full bg-green-300"
                  />
                )}
              </div>
            </div>

            {/* Hand: outer div pins the fingertip to the screen center. */}
            {!reduceMotion && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-10">
                <div className="w-20 -translate-x-1/2 sm:w-28">
                  <motion.div
                    variants={handVariants}
                    initial="idle"
                    animate={phase}
                    onAnimationComplete={handleHandDone}
                    style={{ transformOrigin: "50% 0%" }}
                  >
                    <PointingHand />
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* Stand */}
          <div className="mx-auto h-8 w-6 bg-linear-to-b from-[#0a1a13] to-[#143426]" />
          <div className="mx-auto h-2 w-36 rounded-full bg-[#143426]" />
        </div>
      </div>
    </section>
  );
}