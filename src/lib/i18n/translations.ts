export type Locale = "en" | "id";

export interface TranslationDict {
    // Nav & Common
    nav: {
        problem: string;
        how: string;
        supports: string;
        principles: string;
        signIn: string;
        getStarted: string;
        dashboard: string;
        myInterventions: string;
        library: string;
        students: string;
        signOut: string;
    };
    students: {
        title: string;
        manageClasses: string;
        allStudents: string;
        studentProfile: string;
        newQuickCheck: string;
        barrierPatterns: string;
        successRate: string;
        helpful: string;
        limited: string;
        noInterventions: string;
        viewGeneralHistory: string;
        student: string;
        viewProfile: string;
        noStudentsInClass: string;
        save: string;
        noData: string;
    };
    footer: {
        disclaimer: string;
        sdg: string;
        rights: string;
    };
    landing: {
        taglineBadge: string;
        heroTitle1: string;
        heroTitleHighlight: string;
        heroDescription: string;
        ctaQuickCheck: string;
        ctaHow: string;
        quote: string;
        observedBarrier: string;
        sampleBarrierTitle: string;
        sampleBarrierDesc: string;
        teacherDecides: string;
        problemTitle: string;
        problemSub: string;
        problems: [string, string, string, string];
        loopTitle: string;
        loopSub: string;
        loop: {
            observe: { title: string; desc: string };
            understand: { title: string; desc: string };
            act: { title: string; desc: string };
            reflect: { title: string; desc: string };
        };
        loopMock: {
            step1: string;
            step1Title: string;
            step2: string;
            step2Title: string;
            step3: string;
            step3Title: string;
            step4: string;
            step4Title: string;
            class: string;
            suggestedStrategy: string;
            reflectOptions: [string, string, string];
        };
        supportsTitle: string;
        supportsDesc: string;
        exampleStrategy: string;
        whyTryThis: string;
        whatToObserve: string;
        promisesTitle: string;
        promises: {
            p1Title: string;
            p1Desc: string;
            p2Title: string;
            p2Desc: string;
            p3Title: string;
            p3Desc: string;
        };
        ctaBottomTitle: string;
        ctaBottomSub: string;
        scrollHint: string;
        manifesto: string;
        eyebrowProblem: string;
        eyebrowLoop: string;
        eyebrowSupports: string;
        eyebrowPrinciples: string;
        dragHint: string;
        strategyCount: (count: number) => string;
        strategyTried: string;
        helped: string;
        heroImageAlt: string;
    };
    auth: {
        welcomeBack: string;
        createAccount: string;
        subLogin: string;
        subRegister: string;
        name: string;
        namePlaceholder: string;
        email: string;
        password: string;
        passwordHint: string;
        btnSignIn: string;
        btnRegister: string;
        pleaseWait: string;
        dontHaveAccount: string;
        alreadyHaveAccount: string;
        disclaimerPrivacy: string;
        pendingApproval: string;
    };
    dashboard: {
        greeting: { morning: string; afternoon: string; evening: string };
        heading: string;
        startQuickCheck: string;
        quickCheckDesc: string;
        active: string;
        needsReflection: string;
        completed: string;
        recentTitle: string;
        viewAll: string;
        noInterventions: string;
        noInterventionsDesc: string;
        btnStart: string;
        generalClassroom: string;
        mostEffective: string;
        mostEffectiveDesc: string;
        teacher: string;
        quickCheckBadge: string;
        attentionTitle: string;
        attentionDesc: string;
    };
    admin: {
        save: string;
    };
    quickCheck: {
        step1Title: string;
        step1Sub: string;
        addStudent: string;
        btnAdd: string;
        generalClassroom: string;
        generalClassroomDesc: string;
        privacyHint: string;
        step2Title: string;
        step3Title: string;
        steps: [string, string, string];
        resultBadge: string;
        whatThisMeans: string;
        notADiagnosis: string;
        seeSupports: string;
        back: string;
        continue: string;
        showInsight: string;
        cancel: string;
        studentNamePlaceholder: string;
        classNamePlaceholder: string;
        save: string;
        saveClass: string;
        addClass: string;
        addStudentTo: (className: string) => string;
        stepProgress: (current: number, total: number) => string;
    };
    supports: {
        badge: string;
        title: string;
        basedOn: string;
        whyFits: string;
        viewStrategy: string;
        startDifferent: string;
        missingContext: string;
        btnStartQuickCheck: string;
        historyHelpful: string;
        historyLimited: string;
        workedBefore: string;
    };
    interventionDetail: {
        back: string;
        whyTryThis: string;
        howToApply: string;
        whatToObserve: string;
        useStrategy: string;
        startQuickCheckToUse: string;
        notFound: string;
    };
    actionPlan: {
        createTitle: string;
        student: string;
        barrier: string;
        strategy: string;
        goal: string;
        goalPlaceholder: string;
        when: string;
        timings: [string, string, string, string];
        statusPlanned: string;
        btnSave: string;
        saving: string;
        createdTitle: string;
        btnStartIntervention: string;
        btnBackDashboard: string;
        missingContext: string;
        currentStatus: string;
        goalHint: string;
        startingIntervention: string;
    };
    planDetail: {
        back: string;
        goal: string;
        when: string;
        progress: {
            planned: string;
            inProgress: string;
            reflection: string;
        };
        btnStart: string;
        btnReflect: string;
        howToApply: string;
        whatToObserve: string;
        reflectTitle: string;
        didStrategyHelp: string;
        whatHappened: string;
        whatDidYouObserve: string;
        observePlaceholder: string;
        btnSaveReflection: string;
        reflectionSaved: string;
        savedHint: string;
        insightHelpful: string;
        insightNotHelpful: string;
        continueStrategy: string;
        tryAnotherStrategy: string;
    };
    myInterventions: {
        title: string;
        btnNew: string;
        filters: { all: string; active: string; completed: string };
        empty: string;
        viewReflection: string;
        reflect: string;
        continueBtn: string;
        searchStudent: string;
        searchStudentPlaceholder: string;
        teacher: string;
        allTeachers: string;
        fromDate: string;
        toDate: string;
        reset: string;
        showingTotal: (start: number, end: number, total: number) => string;
        previous: string;
        next: string;
        exportCSV: string;
    };
    library: {
        title: string;
        sub: string;
        searchPlaceholder: string;
        all: string;
        noMatch: string;
        searchLabel: string;
        filterLabel: string;
        resultCount: (count: number) => string;
        clearSearch: string;
        clearFilter: string;
    };
}

export const translations: Record<Locale, TranslationDict> = {
    en: {
        nav: {
            problem: "Problem",
            how: "How it works",
            supports: "Supports",
            principles: "Principles",
            signIn: "Sign in",
            getStarted: "Get started",
            dashboard: "Dashboard",
            myInterventions: "My Interventions",
            library: "Library",
            students: "Students",
            signOut: "Sign out",
        },
        students: {
            title: "Students / Classes",
            manageClasses: "Manage Classes",
            allStudents: "← All Students",
            studentProfile: "Student Profile",
            newQuickCheck: "+ New Quick Check",
            barrierPatterns: "Barrier Patterns",
            successRate: "Success Rate",
            helpful: "Helpful",
            limited: "Limited",
            noInterventions: "No interventions recorded for this student yet.",
            viewGeneralHistory: "View general history",
            student: "Student",
            viewProfile: "View profile",
            noStudentsInClass: "No students in this class yet.",
            save: "Save",
            noData: "No data yet.",
        },
        footer: {
            disclaimer: "A decision-support tool for teachers. INKLUSA does not diagnose students.",
            sdg: "Supporting SDG 4 — Quality Education",
            rights: "See the barrier. Support the learner.",
        },
        landing: {
            taglineBadge: "Classroom Intervention Assistant",
            heroTitle1: "See the barrier.",
            heroTitleHighlight: "Support the learner.",
            heroDescription:
                "INKLUSA helps teachers in inclusive classrooms turn what they observe into a clear support they can try — and track whether it worked. No diagnosis. No long forms.",
            ctaQuickCheck: "Start with Quick Check",
            ctaHow: "See how it works",
            quote: "Learning difficulty ≠ lack of understanding.",
            observedBarrier: "Observed barrier",
            sampleBarrierTitle: "Written Expression",
            sampleBarrierDesc:
                "The student appears to understand the content but has difficulty expressing that understanding in writing.",
            teacherDecides: "Teacher decides",
            problemTitle: "Teachers spot the problem. The next step is harder.",
            problemSub: "“I see the barrier. What do I do now?”",
            problems: [
                "A student follows spoken answers easily but struggles to put them in writing.",
                "Dense text hides what a student actually understands.",
                "Multi-step instructions get lost before the work starts.",
                "Group work leaves some students unsure of their part.",
            ],
            loopTitle: "One simple loop",
            loopSub: "Open INKLUSA when a situation comes up — not every day for every student.",
            loop: {
                observe: { title: "Observe", desc: "Note the barrier you see in class." },
                understand: { title: "Understand", desc: "Clarify what the barrier looks like." },
                act: { title: "Act", desc: "Choose a support to try." },
                reflect: { title: "Reflect", desc: "Record whether it helped." },
            },
            loopMock: {
                step1: "Step 1 · Observe",
                step1Title: "What barrier do you see?",
                step2: "Step 2 · Understand",
                step2Title: "What does it look like?",
                step3: "Step 3 · Act",
                step3Title: "Suggested strategy",
                step4: "Step 4 · Reflect",
                step4Title: "Did this support help?",
                class: "Class 5A · Raka",
                suggestedStrategy: "Suggested strategy",
                reflectOptions: ["Helped", "Partly", "Not yet"],
            },
            supportsTitle: "From barrier to a support you can try today.",
            supportsDesc:
                "Five barrier categories lead to practical strategies with a short reason why, how to apply them, and what to watch for.",
            exampleStrategy: "Example strategy",
            whyTryThis: "Why try this?",
            whatToObserve: "What to observe:",
            promisesTitle: "Built on three promises",
            promises: {
                p1Title: "Not a diagnosis",
                p1Desc: "INKLUSA describes observed learning barriers — never medical or psychological labels.",
                p2Title: "Teacher decides",
                p2Desc: "You get possible strategies to try, guided by your context and professional judgement.",
                p3Title: "Privacy first",
                p3Desc: "Student data stays within the classes you teach. No diagnoses or medical labels are ever stored.",
            },
            ctaBottomTitle: "What are you dealing with today?",
            ctaBottomSub: "Find the right support for a classroom barrier in under two minutes.",
            scrollHint: "Scroll to explore",
            manifesto:
                "Every student learns differently. A barrier is not a label — it is a signal. INKLUSA helps you read that signal and respond with care.",
            eyebrowProblem: "The gap",
            eyebrowLoop: "How it works",
            eyebrowSupports: "Support library",
            eyebrowPrinciples: "Our principles",
            dragHint: "Keep scrolling — the cards will follow",
            strategyCount: (count) => `${count} ${count === 1 ? "strategy" : "strategies"}`,
            strategyTried: "Strategy tried",
            helped: "Helped",
            heroImageAlt: "Illustration of a notebook, puzzle pieces and a lightbulb representing learning support",
        },
        auth: {
            welcomeBack: "Welcome back",
            createAccount: "Create your account",
            subLogin: "Sign in to continue supporting your learners.",
            subRegister: "Start with a Quick Check in minutes.",
            name: "Name",
            namePlaceholder: "Your name",
            email: "Email",
            password: "Password",
            passwordHint: "At least 8 characters",
            btnSignIn: "Sign in",
            btnRegister: "Create account",
            pleaseWait: "Please wait…",
            dontHaveAccount: "Don't have an account? ",
            alreadyHaveAccount: "Already have an account? ",
            disclaimerPrivacy: "INKLUSA stores only minimal student identifiers. It never diagnoses.",
            pendingApproval: "Your account is currently pending admin approval.",
        },
        dashboard: {
            greeting: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
            heading: "What are you dealing with today?",
            startQuickCheck: "Start Quick Check",
            quickCheckDesc: "Find the right support for a classroom barrier.",
            active: "Active",
            needsReflection: "Needs reflection",
            completed: "Completed",
            recentTitle: "Recent interventions",
            viewAll: "View all",
            noInterventions: "No interventions yet",
            noInterventionsDesc: "When you find a barrier in class, start a Quick Check. Your plans will appear here.",
            btnStart: "Start Quick Check",
            generalClassroom: "General classroom",
            mostEffective: "Your Most Effective Strategy",
            mostEffectiveDesc: "Based on your past reflections, this strategy has been helpful multiple times.",
            teacher: "Teacher",
            quickCheckBadge: "Quick Check",
            attentionTitle: "Ready for reflection",
            attentionDesc: "These interventions are waiting for your observation.",
        },
        admin: {
            save: "Save",
        },
        quickCheck: {
            step1Title: "Who needs support?",
            step1Sub: "Choose a student identifier or anonymous general situation",
            addStudent: "Add student",
            btnAdd: "Add",
            generalClassroom: "General classroom",
            generalClassroomDesc: "Anonymous situation",
            privacyHint: "Use simple identifiers like “Student A”. Please don't enter personal data.",
            step2Title: "What did you observe?",
            step3Title: "How does the difficulty appear?",
            steps: ["Student", "Observation", "Clarify"],
            resultBadge: "Observed barrier",
            whatThisMeans: "What this means",
            notADiagnosis: "This describes what you observed. It is not a diagnosis.",
            seeSupports: "See Possible Supports",
            back: "Back",
            continue: "Continue",
            showInsight: "Show insight",
            cancel: "Cancel",
            studentNamePlaceholder: "Student identifier",
            classNamePlaceholder: "Class name (e.g. Grade 7A)",
            save: "Save",
            saveClass: "Save class",
            addClass: "Add a new class",
            addStudentTo: (className) => `Add student to ${className}`,
            stepProgress: (current, total) => `Step ${current} of ${total}`,
        },
        supports: {
            badge: "Possible supports",
            title: "Here are supports you can try.",
            basedOn: "Based on your observation: ",
            whyFits: "Why this fits: ",
            viewStrategy: "View strategy",
            startDifferent: "← Start a different Quick Check",
            missingContext: "Start with a Quick Check",
            btnStartQuickCheck: "Start Quick Check",
            historyHelpful: "Helpful in {count} past attempts",
            historyLimited: "Limited improvement in {count} past attempts",
            workedBefore: "What Worked Before",
        },
        interventionDetail: {
            back: "← Back",
            whyTryThis: "Why try this?",
            howToApply: "How to apply",
            whatToObserve: "What to observe",
            useStrategy: "Use This Strategy",
            startQuickCheckToUse: "Start a Quick Check to use this",
            notFound: "Strategy not found",
        },
        actionPlan: {
            createTitle: "Create Action Plan",
            student: "Student",
            barrier: "Barrier",
            strategy: "Strategy",
            goal: "Goal",
            goalPlaceholder: "e.g. Student can organise ideas before writing",
            when: "When will you try this?",
            timings: ["Next activity", "Next writing activity", "Tomorrow", "This week"],
            statusPlanned: "Planned",
            btnSave: "Save Action Plan",
            saving: "Saving…",
            createdTitle: "Action Plan Created",
            btnStartIntervention: "Start Intervention",
            btnBackDashboard: "Back to dashboard",
            missingContext: "This plan needs a Quick Check first.",
            currentStatus: "Status",
            goalHint: "Keep it specific and observable. You can revise it later.",
            startingIntervention: "Starting…",
        },
        planDetail: {
            back: "← My Interventions",
            goal: "Goal",
            when: "When",
            progress: {
                planned: "Planned",
                inProgress: "In progress",
                reflection: "Reflection",
            },
            btnStart: "Start intervention",
            btnReflect: "Finished trying — reflect",
            howToApply: "How to apply",
            whatToObserve: "What to observe:",
            reflectTitle: "Reflect on this intervention",
            didStrategyHelp: "How effective was this strategy?",
            whatHappened: "What happened?",
            whatDidYouObserve: "Additional notes (Optional)",
            observePlaceholder: "Student was able to organise ideas better…",
            btnSaveReflection: "Save Reflection",
            reflectionSaved: "Reflection saved",
            savedHint: "Your observation has been added to the intervention record.",
            insightHelpful: "Teacher insight: This strategy seems appropriate for the situation.",
            insightNotHelpful:
                "Teacher insight: This strategy showed limited improvement. A different approach might be needed.",
            continueStrategy: "Continue Strategy",
            tryAnotherStrategy: "Try Another Strategy",
        },
        myInterventions: {
            title: "My Interventions",
            btnNew: "+ Quick Check",
            filters: { all: "All", active: "Active", completed: "Completed" },
            empty: "Nothing here yet.",
            viewReflection: "View reflection",
            reflect: "Reflect",
            continueBtn: "Continue",
            searchStudent: "Search student",
            searchStudentPlaceholder: "Student name…",
            teacher: "Teacher",
            allTeachers: "All teachers",
            fromDate: "From date",
            toDate: "To date",
            reset: "Reset",
            showingTotal: (start, end, total) => `Showing ${start}–${Math.min(end, total)} of ${total}`,
            previous: "Previous",
            next: "Next",
            exportCSV: "Export CSV",
        },
        library: {
            title: "Intervention Library",
            sub: "Explore strategies even before you have a specific case.",
            searchPlaceholder: "Search intervention…",
            all: "All",
            noMatch: "No strategies match your search.",
            searchLabel: "Search strategies",
            filterLabel: "Filter by category",
            resultCount: (count) => `${count} ${count === 1 ? "strategy" : "strategies"} found`,
            clearSearch: "Clear search",
            clearFilter: "Clear filter",
        },
    },
    id: {
        nav: {
            problem: "Masalah",
            how: "Cara Kerja",
            supports: "Strategi",
            principles: "Prinsip",
            signIn: "Masuk",
            getStarted: "Daftar",
            dashboard: "Dashboard",
            myInterventions: "Intervensi Saya",
            library: "Pustaka Strategi",
            students: "Siswa",
            signOut: "Keluar",
        },
        students: {
            title: "Siswa / Kelas",
            manageClasses: "Kelola Kelas",
            allStudents: "← Semua Siswa",
            studentProfile: "Profil Siswa",
            newQuickCheck: "+ Pengecekan Baru",
            barrierPatterns: "Pola Hambatan",
            successRate: "Tingkat Keberhasilan",
            helpful: "Membantu",
            limited: "Terbatas",
            noInterventions: "Belum ada intervensi untuk siswa ini.",
            viewGeneralHistory: "Lihat riwayat umum",
            student: "Siswa",
            viewProfile: "Lihat profil",
            noStudentsInClass: "Belum ada siswa di kelas ini.",
            save: "Simpan",
            noData: "Belum ada data.",
        },
        footer: {
            disclaimer: "Decision-support tool untuk guru. INKLUSA tidak mendiagnosis siswa.",
            sdg: "Mendukung SDG 4 — Pendidikan Berkualitas",
            rights: "Kenali hambatannya. Dukung siswanya.",
        },
        landing: {
            taglineBadge: "Classroom Intervention Assistant",
            heroTitle1: "Kenali hambatannya.",
            heroTitleHighlight: "Dukung siswanya.",
            heroDescription:
                "INKLUSA membantu guru di kelas inklusif mengubah apa yang diamati menjadi dukungan nyata yang bisa dicoba — serta mengevaluasi hasilnya. Tanpa diagnosis. Tanpa form berbelit.",
            ctaQuickCheck: "Mulai Quick Check",
            ctaHow: "Pelajari alur kerja",
            quote: "Hambatan belajar ≠ kurangnya pemahaman.",
            observedBarrier: "Hambatan yang diamati",
            sampleBarrierTitle: "Ekspresi Tertulis",
            sampleBarrierDesc:
                "Siswa tampak memahami materi tetapi mengalami kesulitan mengekspresikan pemahaman tersebut dalam bentuk tulisan.",
            teacherDecides: "Guru yang menentukan",
            problemTitle: "Guru melihat masalahnya. Langkah selanjutnya yang lebih sulit.",
            problemSub: "“Setelah saya melihat hambatan ini, saya harus melakukan apa?”",
            problems: [
                "Siswa mudah menjawab secara lisan tetapi kesulitan menuangkannya ke tulisan.",
                "Teks yang terlalu padat menyamarkan apa yang sebenarnya dipahami siswa.",
                "Instruksi bertingkat hilang dari ingatan sebelum tugas sempat dimulai.",
                "Kerja kelompok membuat sebagian siswa bingung peran apa yang harus diambil.",
            ],
            loopTitle: "Satu Alur Sederhana",
            loopSub: "Buka INKLUSA saat situasi muncul di kelas — bukan beban input harian untuk setiap siswa.",
            loop: {
                observe: { title: "Amati (Observe)", desc: "Catat hambatan belajar yang terlihat di kelas." },
                understand: { title: "Pahami (Understand)", desc: "Perjelas karakteristik hambatan tersebut." },
                act: { title: "Tindakan (Act)", desc: "Pilih strategi atau akomodasi yang akan dicoba." },
                reflect: { title: "Refleksi (Reflect)", desc: "Catat apakah strategi tersebut membantu siswa." },
            },
            loopMock: {
                step1: "Langkah 1 · Amati",
                step1Title: "Hambatan apa yang Anda lihat?",
                step2: "Langkah 2 · Pahami",
                step2Title: "Seperti apa hambatannya terlihat?",
                step3: "Langkah 3 · Tindakan",
                step3Title: "Strategi yang disarankan",
                step4: "Langkah 4 · Refleksi",
                step4Title: "Apakah strategi ini membantu?",
                class: "Kelas 5A · Raka",
                suggestedStrategy: "Strategi yang disarankan",
                reflectOptions: ["Membantu", "Sebagian", "Belum"],
            },
            supportsTitle: "Dari pengamatan menjadi strategi yang bisa dicoba hari ini.",
            supportsDesc:
                "Lima kategori hambatan mengarah ke strategi praktis lengkap dengan alasan relevansi, langkah penerapan, dan hal yang perlu diamati.",
            exampleStrategy: "Contoh strategi",
            whyTryThis: "Mengapa mencoba ini?",
            whatToObserve: "Apa yang perlu diamati:",
            promisesTitle: "Dibangun di atas tiga prinsip utama",
            promises: {
                p1Title: "Bukan Sistem Diagnosis",
                p1Desc: "INKLUSA berfokus pada hambatan belajar yang tampak — bukan label medis atau psikologis.",
                p2Title: "Guru Pemegang Keputusan",
                p2Desc: "Sistem memberikan opsi strategi yang relevan; keputusan akhir tetap di tangan profesional guru.",
                p3Title: "Privasi Siswa yang Utama",
                p3Desc: "Data siswa hanya terlihat di kelas yang Anda ampu. Tidak ada diagnosis atau label medis yang disimpan.",
            },
            ctaBottomTitle: "Situasi apa yang sedang Anda hadapi di kelas?",
            ctaBottomSub: "Temukan dukungan pembelajaran yang sesuai dalam waktu kurang dari dua menit.",
            scrollHint: "Gulir untuk menjelajah",
            manifesto:
                "Setiap siswa belajar dengan caranya sendiri. Hambatan bukanlah label — melainkan sinyal. INKLUSA membantu Anda membaca sinyal itu dan meresponsnya dengan peduli.",
            eyebrowProblem: "Celahnya",
            eyebrowLoop: "Cara kerja",
            eyebrowSupports: "Pustaka dukungan",
            eyebrowPrinciples: "Prinsip kami",
            dragHint: "Terus gulir — kartu akan bergerak",
            strategyCount: (count) => `${count} strategi`,
            strategyTried: "Strategi dicoba",
            helped: "Membantu",
            heroImageAlt: "Ilustrasi buku, puzzle, dan bola lampu yang melambangkan dukungan belajar",
        },
        auth: {
            welcomeBack: "Selamat datang kembali",
            createAccount: "Buat akun guru",
            subLogin: "Masuk untuk melanjutkan pendampingan siswa inklusi.",
            subRegister: "Mulai Quick Check pertama Anda dalam hitungan menit.",
            name: "Nama Lengkap",
            namePlaceholder: "Nama Anda",
            email: "Email",
            password: "Kata Sandi",
            passwordHint: "Minimal 8 karakter",
            btnSignIn: "Masuk",
            btnRegister: "Buat Akun",
            pleaseWait: "Mohon tunggu…",
            dontHaveAccount: "Belum punya akun? ",
            alreadyHaveAccount: "Sudah punya akun? ",
            disclaimerPrivacy: "INKLUSA hanya menyimpan identifier minimal siswa. Tanpa diagnosis.",
            pendingApproval: "Akun Anda sedang menunggu persetujuan admin.",
        },
        dashboard: {
            greeting: { morning: "Selamat pagi", afternoon: "Selamat siang", evening: "Selamat sore" },
            heading: "Situasi apa yang Anda hadapi hari ini?",
            startQuickCheck: "Mulai Quick Check",
            quickCheckDesc: "Temukan dukungan yang tepat untuk hambatan belajar di kelas.",
            active: "Aktif Berjalan",
            needsReflection: "Perlu Refleksi",
            completed: "Selesai",
            recentTitle: "Intervensi Terbaru",
            viewAll: "Lihat semua",
            noInterventions: "Belum ada intervensi",
            noInterventionsDesc:
                "Ketika menemukan kendala di kelas, mulai Quick Check. Rencana Anda akan tampil di sini.",
            btnStart: "Mulai Quick Check",
            generalClassroom: "Kelas umum",
            mostEffective: "Strategi Paling Efektif Anda",
            mostEffectiveDesc: "Berdasarkan refleksi Anda sebelumnya, strategi ini telah terbukti sangat membantu.",
            teacher: "Guru",
            quickCheckBadge: "Quick Check",
            attentionTitle: "Siap direfleksikan",
            attentionDesc: "Intervensi ini menunggu catatan pengamatan Anda.",
        },
        admin: {
            save: "Simpan",
        },
        quickCheck: {
            step1Title: "Siapa yang membutuhkan dukungan?",
            step1Sub: "Pilih siswa atau situasi kelas umum secara anonim",
            addStudent: "Tambah siswa",
            btnAdd: "Tambah",
            generalClassroom: "Kelas umum",
            generalClassroomDesc: "Situasi anonim / umum",
            privacyHint: "Gunakan identifier sederhana seperti “Student A”. Jangan masukkan data pribadi siswa.",
            step2Title: "Apa yang Anda amati di kelas?",
            step3Title: "Bagaimana hambatan tersebut terlihat?",
            steps: ["Siswa", "Pengamatan", "Klarifikasi"],
            resultBadge: "Hambatan yang diamati",
            whatThisMeans: "Apa artinya ini",
            notADiagnosis: "Ini adalah pengamatan hambatan belajar nyata di kelas, bukan diagnosis medis.",
            seeSupports: "Lihat Pilihan Dukungan",
            back: "Kembali",
            continue: "Lanjutkan",
            showInsight: "Tampilkan insight",
            cancel: "Batal",
            studentNamePlaceholder: "Identifier siswa",
            classNamePlaceholder: "Nama kelas (misal: Kelas 7A)",
            save: "Simpan",
            saveClass: "Simpan kelas",
            addClass: "Tambah kelas baru",
            addStudentTo: (className) => `Tambah siswa ke ${className}`,
            stepProgress: (current, total) => `Langkah ${current} dari ${total}`,
        },
        supports: {
            badge: "Pilihan dukungan",
            title: "Berikut strategi yang dapat dicoba.",
            basedOn: "Berdasarkan pengamatan Anda: ",
            whyFits: "Mengapa ini sesuai: ",
            viewStrategy: "Lihat panduan strategi",
            startDifferent: "← Mulai Quick Check yang lain",
            missingContext: "Mulai dari Quick Check",
            btnStartQuickCheck: "Mulai Quick Check",
            historyHelpful: "Membantu pada {count} percobaan sebelumnya",
            historyLimited: "Peningkatan terbatas pada {count} percobaan sebelumnya",
            workedBefore: "Riwayat Keberhasilan",
        },
        interventionDetail: {
            back: "← Kembali",
            whyTryThis: "Mengapa mencoba strategi ini?",
            howToApply: "Langkah penerapan di kelas",
            whatToObserve: "Apa yang perlu diamati guru",
            useStrategy: "Gunakan Strategi Ini",
            startQuickCheckToUse: "Mulai Quick Check untuk menggunakan ini",
            notFound: "Strategi tidak ditemukan",
        },
        actionPlan: {
            createTitle: "Buat Rencana Intervensi",
            student: "Siswa",
            barrier: "Hambatan",
            strategy: "Strategi",
            goal: "Tujuan (Goal)",
            goalPlaceholder: "misal: Siswa mampu mengorganisir ide sebelum mulai menulis",
            when: "Kapan Anda akan mencobanya?",
            timings: ["Aktivitas berikutnya", "Tugas menulis berikutnya", "Besok", "Minggu ini"],
            statusPlanned: "Direncanakan",
            btnSave: "Simpan Rencana Tindakan",
            saving: "Menyimpan…",
            createdTitle: "Rencana Tindakan Berhasil Dibuat",
            btnStartIntervention: "Mulai Intervensi",
            btnBackDashboard: "Kembali ke dashboard",
            missingContext: "Rencana ini perlu dimulai dari Quick Check.",
            currentStatus: "Status",
            goalHint: "Buat tujuan yang spesifik dan mudah diamati. Anda dapat mengubahnya nanti.",
            startingIntervention: "Memulai…",
        },
        planDetail: {
            back: "← Intervensi Saya",
            goal: "Tujuan",
            when: "Waktu Penerapan",
            progress: {
                planned: "Direncanakan",
                inProgress: "Sedang Berjalan",
                reflection: "Refleksi",
            },
            btnStart: "Mulai jalankan intervensi",
            btnReflect: "Selesai dicoba — lakukan refleksi",
            howToApply: "Cara menerapkan",
            whatToObserve: "Yang perlu diamati:",
            reflectTitle: "Refleksi Terhadap Intervensi",
            didStrategyHelp: "Seberapa efektif strategi ini?",
            whatHappened: "Apa yang terjadi?",
            whatDidYouObserve: "Catatan tambahan (Opsional)",
            observePlaceholder: "Siswa lebih mampu menyusun ide sebelum menulis…",
            btnSaveReflection: "Simpan Refleksi",
            reflectionSaved: "Refleksi Tersimpan",
            savedHint: "Pengamatan Anda telah dicatat ke riwayat intervensi.",
            insightHelpful: "Insight Guru: Strategi ini tampaknya sesuai untuk situasi tersebut.",
            insightNotHelpful:
                "Insight Guru: Strategi ini menunjukkan sedikit perbaikan. Pendekatan lain mungkin diperlukan.",
            continueStrategy: "Lanjutkan Strategi",
            tryAnotherStrategy: "Coba Strategi Lain",
        },
        myInterventions: {
            title: "Intervensi Saya",
            btnNew: "+ Quick Check",
            filters: { all: "Semua", active: "Aktif", completed: "Selesai" },
            empty: "Belum ada data intervensi di sini.",
            viewReflection: "Lihat refleksi",
            reflect: "Isi Refleksi",
            continueBtn: "Lanjutkan",
            searchStudent: "Cari siswa",
            searchStudentPlaceholder: "Nama siswa…",
            teacher: "Guru",
            allTeachers: "Semua guru",
            fromDate: "Dari tanggal",
            toDate: "Sampai tanggal",
            reset: "Reset",
            showingTotal: (start, end, total) => `Menampilkan ${start}–${Math.min(end, total)} dari ${total}`,
            previous: "Sebelumnya",
            next: "Berikutnya",
            exportCSV: "Export CSV",
        },
        library: {
            title: "Pustaka Strategi Intervensi",
            sub: "Eksplorasi strategi pembelajaran inklusif kapan saja.",
            searchPlaceholder: "Cari strategi intervensi…",
            all: "Semua",
            noMatch: "Tidak ada strategi yang cocok dengan pencarian Anda.",
            searchLabel: "Cari strategi",
            filterLabel: "Filter berdasarkan kategori",
            resultCount: (count) => `${count} strategi ditemukan`,
            clearSearch: "Hapus pencarian",
            clearFilter: "Hapus filter",
        },
    },
};
