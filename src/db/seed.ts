import "dotenv/config";
import { db } from "./index";
import { user, students, actionPlans, classes } from "./schema";
import { KnowledgeService } from "@/backend/modules/knowledge/service";
import { auth } from "@/auth";
import { eq, isNull } from "drizzle-orm";

async function main() {
    console.log("🌱 Starting database seed for INKLUSA...");

    const teacherEmail = "teacher@inklusa.id";
    const teacherPassword = "password123";
    const teacherName = "Bu Rina (Guru Inklusi)";

    // 0. Admin account (knowledge curator + teacher maintainer)
    const adminEmail = "admin@inklusa.id";
    const adminPassword = "admin12345";
    let adminUser = await db.query.user.findFirst({ where: eq(user.email, adminEmail) });
    if (!adminUser) {
        console.log(`🛡️  Creating admin user: ${adminEmail}...`);
        await auth.api.signUpEmail({
            body: { name: "INKLUSA Admin", email: adminEmail, password: adminPassword },
        });
    }
    await db.update(user).set({ role: "ADMIN" }).where(eq(user.email, adminEmail));

    // Backfill role for accounts created before roles existed
    await db.update(user).set({ role: "TEACHER" }).where(isNull(user.role));

    // 0b. Import built-in knowledge into the DB (editable from the admin portal)
    const imported = await KnowledgeService.importDefaults();
    console.log(`📚 Knowledge base ready (${imported.interventions} interventions, ${imported.clarifications} clarifications).`);

    // 1. Create or get Demo Teacher
    let teacher = await db.query.user.findFirst({
        where: eq(user.email, teacherEmail),
    });

    if (!teacher) {
        console.log(`👤 Creating demo teacher user: ${teacherEmail}...`);
        const createdUser = await auth.api.signUpEmail({
            body: {
                name: teacherName,
                email: teacherEmail,
                password: teacherPassword,
            },
        });

        if (!createdUser?.user) {
            throw new Error("Failed to create demo teacher user via Better Auth");
        }

        teacher = await db.query.user.findFirst({
            where: eq(user.email, teacherEmail),
        });
    } else {
        console.log(`ℹ️ Demo teacher user already exists (${teacherEmail}).`);
    }

    if (!teacher) {
        throw new Error("Teacher user not found after creation.");
    }

    // 2. Seed Classes & Students
    console.log("🎒 Seeding classes and students...");
    
    // Create Class 7A
    let class7A = await db.query.classes.findFirst({
        where: (c, { eq }) => eq(c.name, "Kelas 7A"),
    });
    if (!class7A) {
        const [inserted] = await db.insert(classes).values({ name: "Kelas 7A" }).returning();
        class7A = inserted;
        console.log("   + Created Kelas 7A");
    }

    // Create Class 7B
    let class7B = await db.query.classes.findFirst({
        where: (c, { eq }) => eq(c.name, "Kelas 7B"),
    });
    if (!class7B) {
        const [inserted] = await db.insert(classes).values({ name: "Kelas 7B" }).returning();
        class7B = inserted;
        console.log("   + Created Kelas 7B");
    }

    const sampleStudents = [
        { name: "Budi Santoso", classId: class7A.id },
        { name: "Siti Aminah", classId: class7A.id },
        { name: "Andi Saputra", classId: class7B.id },
        { name: "Rina Marlina", classId: class7B.id },
    ];
    
    const studentMap: Record<string, string> = {};

    for (const s of sampleStudents) {
        let st = await db.query.students.findFirst({
            where: (stb, { eq }) => eq(stb.name, s.name),
        });

        if (!st) {
            const [inserted] = await db
                .insert(students)
                .values({
                    classId: s.classId,
                    name: s.name,
                })
                .returning();
            st = inserted;
            console.log(`   + Created ${s.name}`);
        } else {
            console.log(`   - Existing ${s.name}`);
        }
        studentMap[s.name] = st.id;
    }

    // 3. Seed Realistic Action Plans across different lifecycle statuses
    console.log("📋 Seeding action plans with interventions & reflections...");

    const existingPlans = await db.select().from(actionPlans).where(eq(actionPlans.teacherId, teacher.id));
    if (existingPlans.length > 0) {
        console.log(`ℹ️ Found ${existingPlans.length} existing action plans. Skipping plan seeding to avoid duplicates.`);
    } else {
        const seedPlans = [
            {
                teacherId: teacher.id,
                studentId: studentMap["Budi Santoso"],
                barrierCategory: "EXPRESSION" as const,
                clarificationId: "verbal-not-written",
                barrierTitle: "Written Expression",
                interventionSlug: "graphic-organizer",
                goal: "Student can organize key ideas before writing.",
                timing: "Next writing activity",
                status: "IN_PROGRESS" as const,
            },
            {
                teacherId: teacher.id,
                studentId: studentMap["Siti Aminah"],
                barrierCategory: "INSTRUCTION" as const,
                clarificationId: "multi-step",
                barrierTitle: "Multi-step Instruction Access",
                interventionSlug: "visual-checklist",
                goal: "Student can follow 3-step science lab instructions independently.",
                timing: "Tomorrow science lab",
                status: "COMPLETED" as const,
                reflectionResult: "VERY_HELPFUL" as const,
                reflectionNote: "Visual checklist placed on desk helped Siti complete steps without repeating instructions.",
                reflectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
            },
            {
                teacherId: teacher.id,
                studentId: studentMap["Andi Saputra"],
                barrierCategory: "PARTICIPATION" as const,
                clarificationId: "unclear-role",
                barrierTitle: "Role Clarity in Group Work",
                interventionSlug: "role-assignment",
                goal: "Andi has a clear timekeeper & summarizer role during group project.",
                timing: "This week group project",
                status: "NEEDS_REFLECTION" as const,
            },
            {
                teacherId: teacher.id,
                studentId: studentMap["Rina Marlina"],
                barrierCategory: "FOCUS" as const,
                clarificationId: "long-tasks",
                barrierTitle: "Sustaining Attention on Long Tasks",
                interventionSlug: "task-segmentation",
                goal: "Break 30-minute math exercise into 3 segments with brief pauses.",
                timing: "Next math session",
                status: "PLANNED" as const,
            },
            {
                // Anonymous / general classroom situation
                teacherId: teacher.id,
                studentId: null,
                barrierCategory: "READING" as const,
                clarificationId: "dense-text",
                barrierTitle: "Dense Text Access",
                interventionSlug: "text-chunking",
                goal: "Chunk social studies reading into 2-paragraph sections with bold headings.",
                timing: "Next history lesson",
                status: "COMPLETED" as const,
                reflectionResult: "HELPFUL" as const,
                reflectionNote: "Multiple learners engaged for longer duration without feeling overwhelmed.",
                reflectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
        ];

        for (const plan of seedPlans) {
            await db.insert(actionPlans).values(plan);
        }
        console.log(`   + Inserted ${seedPlans.length} sample action plans!`);
    }

    console.log("\n✅ Database seeding completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log(`📧 Email   : ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log("");
    console.log("Credentials Demo Guru:");
    console.log(`📧 Email   : ${teacherEmail}`);
    console.log(`🔑 Password: ${teacherPassword}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
