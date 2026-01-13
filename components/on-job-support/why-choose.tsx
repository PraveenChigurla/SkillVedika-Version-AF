// 'use client';

// import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
// import { useEffect } from 'react';
// import { getTitleParts } from '@/utils/getTitle'; // add at top

// export default function WhyChoose({
//   title,
//   points,
//   image,
// }: {
//   title: any;
//   points: string[];
//   image: string;
// }) {
//  ;

//   const x = useMotionValue(-slideRange);

//   const glowOpacity = useTransform(x, [-slideRange, 0, slideRange], [0, 0.2, 0.6]);

//   // Extract title parts
//   const { part1, part2 } = getTitleParts(title);

//   // useEffect(() => {
//   //   // Defer animation start to reduce initial TBT
//   //   let controls: any;
//   //   const timeoutId = setTimeout(() => {
//   //     controls = animate(x, [-slideRange, slideRange, -slideRange], {
//   //       duration: slideSpeed,
//   //       repeat: Infinity,
//   //       ease: 'easeInOut',
//   //     });
//   //   }, 100);

//   //   return () => {
//   //     clearTimeout(timeoutId);
//   //     if (controls) controls.stop();
//   //   };
//   // }, [x]);

//   return (
//     <section className="relative bg-gradient-to-b from-white to-white py-24 px-6 sm:px-10 lg:px-16 overflow-hidden">
//       <div className="absolute top-16 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
//       <div className="absolute bottom-10 right-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-float" />

//       <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16 relative z-10">
//         {/* LEFT — TEXT */}
//         <motion.div
//           initial={{ opacity: 0, x: -60 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.7, ease: 'easeOut' }}
//           className="w-full lg:w-[60%] max-w-xl"
//         >
//           {/* replace the current <h2> with: */}
//           <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-snug">
//             {part1 || 'Why Choose'}{' '}
//             <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
//               {part2 || 'SkillVedika?'}
//             </span>
//           </h2>

//           <ul className="space-y-5">
//             {points?.map((reason, i) => (
//               <motion.li
//                 key={i}
//                 initial={{ opacity: 0, x: -40 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.6, delay: i * 0.15 }}
//                 className="group flex gap-4 items-start p-3 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300"
//               >
//                 <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-teal-600 text-white font-bold shadow-md group-hover:shadow-blue-400/40 transition-all duration-500">
//                   ✓
//                 </div>

//                 <span className="text-gray-700 text-base leading-relaxed font-medium">
//                   {reason}
//                 </span>
//               </motion.li>
//             ))}
//           </ul>
//         </motion.div>

//         {/* RIGHT — IMAGE */}
//         <div className="relative w-full lg:w-[40%] flex justify-center lg:justify-end mt-12 lg:mt-0">
//           <motion.div
//             initial={{ opacity: 0, x: 60 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, ease: 'easeOut' }}
//             className="relative flex justify-center"
//           >
//             {/* Glow Behind */}
//             <motion.div
//               className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-400 blur-xl"
//               style={{ x: isDesktop ? x : 0 }}
//             />

//             {/* Ring */}
//             <div
//               className="
//                     absolute
//                     w-[260px] h-[260px]
//                     sm:w-[320px] sm:h-[320px]
//                     md:w-[380px] md:h-[380px]
//                     lg:w-[420px] lg:h-[420px]
//                     rounded-full
//                     border-8 border-white/70
//                     bg-white/90
//                     backdrop-blur-md
//                     shadow-inner shadow-blue-200/50
//                     flex items-center justify-center
//                     "
//             >
//               <motion.img
//                 src={image || '/on-job-support/Frame 278.png'}
//                 alt="Why Choose SkillVedika"
//                 className="
//     w-[180px] h-[180px]
//     sm:w-[200px] sm:h-[200px]
//     md:w-[240px] md:h-[240px]
//     lg:w-[280px] lg:h-[280px]
//     object-cover rounded-full
//     border-4 border-white shadow-xl
//   "
//                 animate={{
//                   x: 0,
//                 }}
//                 whileHover={{
//                   x: 20,
//                 }}
//                 transition={{
//                   duration: 0.6,
//                   ease: 'easeInOut',
//                 }}
//               />
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       <style jsx>{`
//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }
//         /* Animation moved to external CSS file for better performance */
//       `}</style>
//     </section>
//   );
// }

'use client';

import { motion } from 'framer-motion';
import { getTitleParts } from '@/utils/getTitle';

export default function WhyChoose({
  title,
  points,
  image,
}: {
  title: any;
  points: string[];
  image: string;
}) {
  const { part1, part2 } = getTitleParts(title);

  return (
    <section className="relative bg-gradient-to-b from-white to-white py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-16 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-float" />

      {/* Shared container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* TITLE - First */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {part1 || 'Why Choose'}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                {part2 || 'SkillVedika?'}
              </span>
            </h2>
                  </div>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* IMAGE - Second (After Title) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full flex justify-center lg:justify-end order-1 lg:order-1"
          >
            <div
              className="
                relative
                w-[200px] h-[200px]
                sm:w-[240px] sm:h-[240px]
                md:w-[300px] md:h-[300px]
                lg:w-[380px] lg:h-[380px]
                rounded-full
                bg-white/90
                backdrop-blur-md
                border-8 border-white/70
                shadow-inner shadow-blue-200/50
                flex items-center justify-center
              "
            >
              <img
                src={image || '/on-job-support/Frame 278.png'}
                alt="Why Choose SkillVedika"
                className="
                  w-[150px] h-[150px]
                  sm:w-[180px] sm:h-[180px]
                  md:w-[220px] md:h-[220px]
                  lg:w-[270px] lg:h-[270px]
                  object-cover rounded-full
                  border-4 border-white shadow-xl
                "
              />
            </div>
          </motion.div>

          {/* POINTS LIST - Third (After Image) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-xl text-center lg:text-left order-2 lg:order-2"
          >
            <ul className="space-y-4 sm:space-y-5">
              {points?.map((reason, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-3 sm:gap-4 items-start justify-center lg:justify-start p-2 sm:p-3 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-700 to-teal-600 text-white font-bold shadow-md flex-shrink-0">
                    ✓
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                    {reason}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
