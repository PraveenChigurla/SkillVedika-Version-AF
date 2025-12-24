// "use client";

// import { Star, ChevronLeft, ChevronRight } from "lucide-react";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function CourseGrid() {
//   const courses = [
//     { id: 1, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/laravel-development-course.jpg", rating: 5 },
//     { id: 2, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/web-development-training.jpg", rating: 5 },
//     { id: 3, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/php-programming-course.jpg", rating: 4.5 },
//     { id: 4, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/laravel-development-course.jpg", rating: 5 },
//     { id: 5, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/web-development-training.jpg", rating: 5 },
//     { id: 6, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/php-programming-course.jpg", rating: 4 },
//     { id: 7, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/laravel-development-course.jpg", rating: 5 },
//     { id: 8, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/web-development-training.jpg", rating: 5 },
//     { id: 9, title: "Advanced Laravel: for beginners zero-hero", students: 201, image: "/php-programming-course.jpg", rating: 4 },
//     { id: 10, title: "Another Course", students: 180, image: "/laravel-development-course.jpg", rating: 4 },
//     { id: 11, title: "React Course", students: 260, image: "/web-development-training.jpg", rating: 5 },
//     { id: 12, title: "Node.js Mastery", students: 215, image: "/php-programming-course.jpg", rating: 5 },
//     { id: 13, title: "Next.js Advanced", students: 174, image: "/web-development-training.jpg", rating: 5 },
//     { id: 14, title: "UI/UX Design", students: 350, image: "/php-programming-course.jpg", rating: 4 },
//     { id: 15, title: "Python Full Stack", students: 300, image: "/laravel-development-course.jpg", rating: 5 },
//   ];

//   const ITEMS_PER_PAGE = 12;
//   const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

//   const [page, setPage] = useState(0);
//   const [direction, setDirection] = useState(0);

//   const handlePrev = () => {
//     setDirection(-1);
//     setPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setDirection(1);
//     setPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
//   };

//   const visibleCourses = courses.slice(
//     page * ITEMS_PER_PAGE,
//     page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
//   );

//   // for smooth sliding fade animation
//   const slideVariants = {
//     enter: (direction: number) => ({
//       x: direction > 0 ? 80 : -80,
//       opacity: 0,
//     }),
//     center: {
//       x: 0,
//       opacity: 1,
//     },
//     exit: (direction: number) => ({
//       x: direction > 0 ? -80 : 80,
//       opacity: 0,
//     }),
//   };

//   return (
//     <section className="py-16 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* GRID WITH PAGE ANIMATION */}
//         <AnimatePresence custom={direction} mode="wait">
//           <motion.div
//             key={page}
//             custom={direction}
//             variants={slideVariants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ duration: 0.35 }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
//           >
//             {visibleCourses.map((course, index) => (
//               <motion.div
//                 key={course.id}
//                 initial={{ opacity: 0, y: 25 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: index * 0.05 }}
//                 whileHover={{ y: -6 }}
//                 className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
//               >
//                 <div className="relative">
//                   <img
//                     src={course.image}
//                     alt={course.title}
//                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </div>

//                 <div className="p-6 text-left">
//                   <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-snug line-clamp-2">
//                     {course.title}
//                   </h3>

//                   <p className="text-xs text-gray-600 mb-2">
//                     {course.students} Students enrolled
//                   </p>

//                   <div className="flex items-center justify-between">
//                     <a
//                       href="/course-details"
//                       className="bg-[#2C5AA0] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1A3F66] transition-all shadow-sm hover:shadow-md"
//                     >
//                       View more
//                     </a>

//                     <div className="flex items-center gap-2">
//                       <div className="flex gap-1">
//                         {[...Array(5)].map((_, i) => (
//                           <Star
//                             key={i}
//                             size={14}
//                             className={
//                               i < course.rating
//                                 ? "fill-yellow-400 text-yellow-400"
//                                 : "text-gray-300"
//                             }
//                           />
//                         ))}
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">({Number(course.rating).toFixed(1)})</span>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </AnimatePresence>

//         {/* PAGINATION CONTROLS — SAME STYLE AS HOME SECTION */}
//         <div className="flex items-center justify-center gap-6 mt-10">
//           {/* Previous button */}
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={handlePrev}
//             className="p-3 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-[#2C5AA0] group transition-all"
//           >
//             <ChevronLeft
//               size={20}
//               className="text-[#2C5AA0] group-hover:text-white"
//             />
//           </motion.button>

//           {/* Dots */}
//           <div className="flex gap-3">
//             {Array.from({ length: totalPages }).map((_, i) => (
//               <motion.button
//                 key={i}
//                 whileHover={{ scale: 1.15 }}
//                 onClick={() => setPage(i)}
//                 className={`w-3 h-3 rounded-full transition-all ${
//                   page === i ? "bg-[#2C5AA0] scale-110" : "bg-gray-300"
//                 }`}
//               />
//             ))}
//           </div>

//           {/* Next button */}
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={handleNext}
//             className="p-3 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-[#2C5AA0] group transition-all"
//           >
//             <ChevronRight
//               size={20}
//               className="text-[#2C5AA0] group-hover:text-white"
//             />
//           </motion.button>
//         </div>
//       </div>
//     </section>
//   );
// }

// "use client";

// import { Star, ChevronLeft, ChevronRight } from "lucide-react";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";

// export default function CourseGrid() {
//   // HOOKS MUST COME FIRST
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [page, setPage] = useState(0);
//   const [direction, setDirection] = useState(0);

//   // FETCH USING AXIOS
//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await axios.get("http://127.0.0.1:8000/api/courses");
//         setCourses(res.data);
//       } catch (error) {
//         console.error("Error fetching courses:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   // LOADING UI
//   if (loading) {
//     return (
//       <div className="text-center py-20 text-lg font-semibold">
//         Loading courses...
//       </div>
//     );
//   }

//   // PAGINATION CALCULATIONS (AFTER HOOKS)
//   const ITEMS_PER_PAGE = 12;
//   const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

//   const visibleCourses = courses.slice(
//     page * ITEMS_PER_PAGE,
//     page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
//   );

//   // ANIMATION VARIANTS
//   const slideVariants = {
//     enter: (direction) => ({
//       x: direction > 0 ? 80 : -80,
//       opacity: 0,
//     }),
//     center: { x: 0, opacity: 1 },
//     exit: (direction) => ({
//       x: direction > 0 ? -80 : 80,
//       opacity: 0,
//     }),
//   };

//   const handlePrev = () => {
//     setDirection(-1);
//     setPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setDirection(1);
//     setPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
//   };

//   return (
//     <section className="py-16 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* GRID WITH PAGE ANIMATION */}
//         <AnimatePresence custom={direction} mode="wait">
//           <motion.div
//             key={page}
//             custom={direction}
//             variants={slideVariants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ duration: 0.35 }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
//           >
//             {visibleCourses.map((course, index) => (
//               <motion.div
//                 key={course.id}
//                 initial={{ opacity: 0, y: 25 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: index * 0.05 }}
//                 whileHover={{ y: -6 }}
//                 className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
//               >
//                 <div className="relative">
//                   <img
//                     src={course.image}
//                     alt={course.title}
//                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
//                   />
//                 </div>

//                 <div className="p-6 text-left">
//                   <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-snug line-clamp-2">
//                     {course.title}
//                   </h3>

//                   <p className="text-xs text-gray-600 mb-2">
//                     {course.students} Students enrolled
//                   </p>

//                   <div className="flex items-center justify-between">
//                     <a
//                       href={`/course-details/${course.id}`}
//                       className="bg-[#2C5AA0] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1A3F66] transition-all shadow-sm hover:shadow-md"
//                     >
//                       View more
//                     </a>

//                     <div className="flex items-center gap-2">
//                       <div className="flex gap-1">
//                         {[...Array(5)].map((_, i) => (
//                           <Star
//                             key={i}
//                             size={14}
//                             className={
//                               i < Math.round(course.rating)
//                                 ? "fill-yellow-400 text-yellow-400"
//                                 : "text-gray-300"
//                             }
//                           />
//                         ))}
//                       </div>
//                       <span className="text-sm font-medium text-gray-700">
//                         ({Number(course.rating).toFixed(1)})
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </AnimatePresence>

//         {/* PAGINATION CONTROLS */}
//         <div className="flex items-center justify-center gap-6 mt-10">

//           {/* Previous */}
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={handlePrev}
//             className="p-3 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-[#2C5AA0] group transition-all"
//           >
//             <ChevronLeft
//               size={20}
//               className="text-[#2C5AA0] group-hover:text-white"
//             />
//           </motion.button>

//           {/* Dots */}
//           <div className="flex gap-3">
//             {Array.from({ length: totalPages }).map((_, i) => (
//               <motion.button
//                 key={i}
//                 whileHover={{ scale: 1.15 }}
//                 onClick={() => setPage(i)}
//                 className={`w-3 h-3 rounded-full transition-all ${
//                   page === i ? "bg-[#2C5AA0] scale-110" : "bg-gray-300"
//                 }`}
//               />
//             ))}
//           </div>

//           {/* Next */}
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={handleNext}
//             className="p-3 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-[#2C5AA0] group transition-all"
//           >
//             <ChevronRight
//               size={20}
//               className="text-[#2C5AA0] group-hover:text-white"
//             />
//           </motion.button>

//         </div>
//       </div>
//     </section>
//   );
// }
