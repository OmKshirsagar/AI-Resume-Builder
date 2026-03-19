import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 1. Users Table (Synced from Clerk)
export const users = sqliteTable("users", {
	id: text("id").primaryKey(), // Clerk ID
	email: text("email").notNull(),
	name: text("name"),
	imageUrl: text("image_url"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// 2. Resumes Table (The "Container" for all resume data)
export const resumes = sqliteTable("resumes", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull().default("Untitled Resume"),
	isMaster: integer("is_master", { mode: "boolean" }).notNull().default(false),
	
	// Complex but flatter objects stored as JSON for simplicity
	personalInfo: text("personal_info", { mode: "json" }).notNull(),
	design: text("design", { mode: "json" }).notNull(),
	
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// 3. Experience Table
export const experiences = sqliteTable("experiences", {
	id: text("id").primaryKey(),
	resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
	company: text("company").notNull(),
	position: text("position").notNull(),
	location: text("location"),
	startDate: text("start_date"),
	endDate: text("end_date"),
	current: integer("current", { mode: "boolean" }).notNull().default(false),
	order: integer("order").notNull().default(0),
});

// 4. Bullets Table (The "Bullet Bank" - Individual accomplishments)
export const bullets = sqliteTable("bullets", {
	id: text("id").primaryKey(),
	experienceId: text("experience_id").notNull().references(() => experiences.id, { onDelete: "cascade" }),
	content: text("content").notNull(),
	order: real("order").notNull().default(0),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), // For cherry-picking
});

// 5. Education Table
export const education = sqliteTable("education", {
	id: text("id").primaryKey(),
	resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
	school: text("school").notNull(),
	degree: text("degree"),
	fieldOfStudy: text("field_of_study"),
	location: text("location"),
	startDate: text("start_date"),
	endDate: text("end_date"),
	order: integer("order").notNull().default(0),
});

// 6. Skills Table
export const skills = sqliteTable("skills", {
	id: text("id").primaryKey(),
	resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	level: text("level"),
	order: integer("order").notNull().default(0),
});

// 7. Projects Table
export const projects = sqliteTable("projects", {
	id: text("id").primaryKey(),
	resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	link: text("link"),
	startDate: text("start_date"),
	endDate: text("end_date"),
	description: text("description", { mode: "json" }).notNull(), // Small array of strings
	order: integer("order").notNull().default(0),
});

// 8. Custom Sections Table
export const customSections = sqliteTable("custom_sections", {
	id: text("id").primaryKey(),
	resumeId: text("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	order: integer("order").notNull().default(0),
});

// 9. Custom Section Items Table
export const customSectionItems = sqliteTable("custom_section_items", {
	id: text("id").primaryKey(),
	sectionId: text("section_id").notNull().references(() => customSections.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	subtitle: text("subtitle"),
	date: text("date"),
	description: text("description", { mode: "json" }).notNull(), // Small array of strings
	order: integer("order").notNull().default(0),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
	resumes: many(resumes),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
	user: one(users, { fields: [resumes.userId], references: [users.id] }),
	experiences: many(experiences),
	education: many(education),
	skills: many(skills),
	projects: many(projects),
	customSections: many(customSections),
}));

export const experiencesRelations = relations(experiences, ({ one, many }) => ({
	resume: one(resumes, { fields: [experiences.resumeId], references: [resumes.id] }),
	bullets: many(bullets),
}));

export const bulletsRelations = relations(bullets, ({ one }) => ({
	experience: one(experiences, { fields: [bullets.experienceId], references: [experiences.id] }),
}));

export const customSectionsRelations = relations(customSections, ({ one, many }) => ({
	resume: one(resumes, { fields: [customSections.resumeId], references: [resumes.id] }),
	items: many(customSectionItems),
}));

export const customSectionItemsRelations = relations(customSectionItems, ({ one }) => ({
	section: one(customSections, { fields: [customSectionItems.sectionId], references: [customSections.id] }),
}));
