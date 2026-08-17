import type { LearningExperienceDefinition, LearningLesson } from "../types";
import { lesson1Block1 } from "./lesson-1-block-1";
import { lesson3CompletionExperiences } from "./lesson-3-completion-experiences";
import { publishedCurriculumLessons } from "./curriculum-catalog";

const [lesson1Metadata, lesson2Metadata, lesson3Metadata] = publishedCurriculumLessons;

const localizeExperiences = (experiences: LearningExperienceDefinition[]) => experiences.map((experience, index) => ({
  ...experience,
  eyebrow: experience.eyebrow?.replace(/^Experience \d+/, `Experience ${index + 1}`),
})) as LearningExperienceDefinition[];

const shared = {
  workshopId: lesson1Block1.workshopId,
  part: "Part 1 — Enterprise AI Architecture Foundations",
  resources: lesson1Block1.resources,
  glossary: lesson1Block1.glossary,
};

const lesson2Experiences = localizeExperiences(lesson1Block1.experiences.slice(3, 8)).map((experience) => experience.type === "architecture-decision-challenge" ? {
  ...experience,
  transition: ["You are now ready to apply these ideas to a complete enterprise AI workload.", "Continue to Lesson 3."],
} : experience) as LearningExperienceDefinition[];

export const part1Lesson1: LearningLesson = {
  ...shared,
  id: "part-1-lesson-1-why-enterprise-ai-architecture",
  slug: lesson1Metadata.slug,
  title: lesson1Metadata.title,
  description: lesson1Metadata.description,
  estimatedMinutes: 18,
  status: "published",
  experiences: localizeExperiences(lesson1Block1.experiences.slice(0, 3)),
};

export const part1Lesson2: LearningLesson = {
  ...shared,
  id: "part-1-lesson-2-understanding-enterprise-ai-architecture",
  slug: lesson2Metadata.slug,
  title: lesson2Metadata.title,
  description: lesson2Metadata.description,
  estimatedMinutes: 28,
  status: "published",
  experiences: lesson2Experiences,
};

export const part1Lesson3: LearningLesson = {
  ...shared,
  id: "part-1-lesson-3-architecting-first-workload",
  slug: lesson3Metadata.slug,
  title: lesson3Metadata.title,
  description: lesson3Metadata.description,
  estimatedMinutes: 38,
  status: "published",
  experiences: [...localizeExperiences(lesson1Block1.experiences.slice(8, 10)), ...lesson3CompletionExperiences],
};

export const productionPart1Lessons = [part1Lesson1, part1Lesson2, part1Lesson3];
