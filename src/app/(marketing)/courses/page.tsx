export const metadata={title:"AI Courses | Architecting AI"};
﻿import { CourseCard } from "@/components/home/public-homepage";
import { courses } from "@/content/courses";
export default function CoursesPage(){return <div className="academy-inner-page course-catalogue"><header className="inner-hero"><p className="academy-kicker">Course catalogue</p><h1>Learn what matters next.</h1><p>Explore practical learning paths for young creators and technology professionals.</p></header><div className="academy-course-grid">{courses.map((course,index)=><CourseCard key={course.slug} course={course} featured={index<2}/>)}</div></div>}
