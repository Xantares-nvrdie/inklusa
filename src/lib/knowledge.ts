/**
 * INKLUSA knowledge base with full Bilingual (EN & ID) support.
 * Observed barrier -> clarification -> possible supports.
 * Language is deliberately focused on what the teacher *observed*, never medical/clinical diagnoses.
 */

import type { Locale } from "@/lib/i18n/translations";

export type BarrierCategory = "INSTRUCTION" | "READING" | "FOCUS" | "EXPRESSION" | "PARTICIPATION";

export interface LocalizedIntervention {
    slug: string;
    category: BarrierCategory;
    title: { en: string; id: string };
    summary: { en: string; id: string };
    why: { en: string; id: string };
    steps: {
        en: string[];
        id: string[];
    };
    observe: { en: string; id: string };
}

export interface LocalizedClarification {
    id: string;
    label: { en: string; id: string };
    barrier: { en: string; id: string };
    insight: { en: string; id: string };
    supports: { slug: string; reason: { en: string; id: string } }[];
}

export type InterventionData = Omit<LocalizedIntervention, "slug" | "category">;
export type ClarificationData = Omit<LocalizedClarification, "id">;

export type KnowledgeClarification = LocalizedClarification & { category: BarrierCategory };

/** Everything the expert system needs besides the static category metadata. */
export interface KnowledgeData {
    interventions: LocalizedIntervention[];
    clarifications: KnowledgeClarification[];
}

export interface LocalizedCategory {
    id: BarrierCategory;
    title: { en: string; id: string };
    short: { en: string; id: string };
    description: { en: string; id: string };
    icon: "list-checks" | "book-open" | "target" | "pen-line" | "users";
    meaning: { en: string; id: string };
    clarifications: LocalizedClarification[];
}

export const CATEGORIES_DATA: LocalizedCategory[] = [
    {
        id: "INSTRUCTION",
        title: { en: "Instruction", id: "Instruksi" },
        short: { en: "Following instructions", id: "Mengikuti instruksi" },
        description: {
            en: "Difficulty understanding or following instructions.",
            id: "Kesulitan memahami atau mengikuti instruksi pembelajaran.",
        },
        icon: "list-checks",
        meaning: {
            en: "The difficulty may lie in how instructions are delivered or held in mind, rather than in the student's ability to do the task itself.",
            id: "Hambatan mungkin terletak pada cara instruksi disampaikan atau diingat, bukan pada kemampuan siswa dalam mengerjakan tugas itu sendiri.",
        },
        clarifications: [
            {
                id: "multi-step",
                label: {
                    en: "Gets lost when several instructions come at once",
                    id: "Bingung ketika guru memberikan beberapa instruksi sekaligus",
                },
                barrier: {
                    en: "Multi-step Instruction Access",
                    id: "Akses Instruksi Bertahap (Multi-step)",
                },
                insight: {
                    en: "The student appears able to do each step but has difficulty holding a sequence of instructions at the same time.",
                    id: "Siswa mampu mengerjakan tiap langkah, namun kesulitan mengingat urutan tahapan yang diberikan bersamaan.",
                },
                supports: [
                    {
                        slug: "visual-checklist",
                        reason: {
                            en: "Keeps the sequence visible so memory is not the barrier.",
                            id: "Menjaga urutan tetap terlihat sehingga memori jangka pendek bukan lagi penghambat.",
                        },
                    },
                    {
                        slug: "stepwise-instructions",
                        reason: {
                            en: "Delivers one step at a time instead of all at once.",
                            id: "Memberikan instruksi satu per satu secara bertahap.",
                        },
                    },
                    {
                        slug: "comprehension-check",
                        reason: {
                            en: "Confirms understanding before work starts.",
                            id: "Memastikan pemahaman siswa sebelum tugas dimulai.",
                        },
                    },
                ],
            },
            {
                id: "forgets-next",
                label: {
                    en: "Starts the task but forgets what to do next",
                    id: "Mulai mengerjakan tugas tetapi lupa langkah berikutnya",
                },
                barrier: {
                    en: "Losing the Thread of a Task",
                    id: "Kehilangan Alur Urutan Tugas",
                },
                insight: {
                    en: "The student begins well but loses track of the next step partway through the task.",
                    id: "Siswa memulai dengan baik namun kehilangan fokus pada langkah lanjutan di tengah aktivitas.",
                },
                supports: [
                    {
                        slug: "visual-checklist",
                        reason: {
                            en: "A checklist shows what is done and what comes next.",
                            id: "Daftar ceklist memperlihatkan apa yang selesai dan apa langkah berikutnya.",
                        },
                    },
                    {
                        slug: "written-instruction-card",
                        reason: {
                            en: "A card gives something to look back to.",
                            id: "Kartu pengingat menjadi acuan yang bisa dilihat kembali kapan saja.",
                        },
                    },
                    {
                        slug: "stepwise-instructions",
                        reason: {
                            en: "Smaller steps reduce what must be remembered.",
                            id: "Langkah-langkah kecil mengurangi beban memori yang harus diingat.",
                        },
                    },
                ],
            },
            {
                id: "needs-repeat",
                label: {
                    en: "Needs instructions repeated several times",
                    id: "Membutuhkan pengulangan instruksi beberapa kali",
                },
                barrier: {
                    en: "Instruction Retention",
                    id: "Retensi Ingatan Instruksi",
                },
                insight: {
                    en: "Spoken instructions seem to fade before the student can act on them.",
                    id: "Instruksi lisan cepat memudar sebelum siswa sempat menerapkannya secara mandiri.",
                },
                supports: [
                    {
                        slug: "written-instruction-card",
                        reason: {
                            en: "Written instructions stay available without repeating.",
                            id: "Instruksi tertulis tetap ada tanpa guru harus mengulang bicara berulang kali.",
                        },
                    },
                    {
                        slug: "comprehension-check",
                        reason: {
                            en: "Lets the student restate the task in their own words.",
                            id: "Meminta siswa mengulang instruksi dengan bahasa mereka sendiri.",
                        },
                    },
                    {
                        slug: "visual-checklist",
                        reason: {
                            en: "Offers a lasting reference.",
                            id: "Memberikan panduan visual yang permanen di meja.",
                        },
                    },
                ],
            },
            {
                id: "verbal-only",
                label: {
                    en: "Struggles when instructions are only spoken",
                    id: "Kesulitan jika instruksi hanya disampaikan secara lisan",
                },
                barrier: {
                    en: "Spoken-only Instruction Access",
                    id: "Akses Instruksi Hanya-Lisan",
                },
                insight: {
                    en: "The student may access information better when it is paired with a visual or written form.",
                    id: "Siswa lebih mudah menyerap informasi jika dipadukan dengan format visual atau tulisan ringkas.",
                },
                supports: [
                    {
                        slug: "written-instruction-card",
                        reason: {
                            en: "Adds a written channel to the spoken one.",
                            id: "Menambahkan kanal tertulis di samping penyampaian lisan.",
                        },
                    },
                    {
                        slug: "visual-checklist",
                        reason: {
                            en: "Adds a visual channel to the spoken one.",
                            id: "Menambahkan format visual untuk melengkapi lisan.",
                        },
                    },
                    {
                        slug: "stepwise-instructions",
                        reason: {
                            en: "Slows delivery so each part can be processed.",
                            id: "Memperlambat penyampaian agar tiap bagian sempat diproses.",
                        },
                    },
                ],
            },
        ],
    },
    {
        id: "READING",
        title: { en: "Reading", id: "Membaca" },
        short: { en: "Accessing text", id: "Mengakses materi teks" },
        description: {
            en: "Difficulty accessing information through text.",
            id: "Kesulitan mengakses materi pembelajaran melalui teks.",
        },
        icon: "book-open",
        meaning: {
            en: "The difficulty may be with how the text is presented or how much there is at once, rather than with understanding the ideas.",
            id: "Hambatan kemungkinan terletak pada cara teks disajikan atau kepadatan bacaan, bukan pada kemampuan memahami konsep.",
        },
        clarifications: [
            {
                id: "dense-text",
                label: {
                    en: "Gets overwhelmed when the text is too dense",
                    id: "Kewalahan ketika teks materi terlalu padat dan panjang",
                },
                barrier: {
                    en: "Dense Text Access",
                    id: "Akses Teks Terlalu Padat",
                },
                insight: {
                    en: "The student may understand the content but is overloaded by how much text appears at once.",
                    id: "Siswa mampu memahami inti materi, namun terbebani oleh banyaknya teks yang muncul sekaligus.",
                },
                supports: [
                    {
                        slug: "text-chunking",
                        reason: {
                            en: "Smaller parts lower the load of each reading moment.",
                            id: "Bagian yang lebih kecil mengurangi beban di tiap sesi membaca.",
                        },
                    },
                    {
                        slug: "highlight-key-info",
                        reason: {
                            en: "Directs attention to what matters most.",
                            id: "Mengarahkan fokus langsung ke bagian informasi yang paling penting.",
                        },
                    },
                    {
                        slug: "visual-structure",
                        reason: {
                            en: "A visual summary shows the shape of the content.",
                            id: "Ringkasan visual memperlihatkan struktur isi materi.",
                        },
                    },
                ],
            },
            {
                id: "loses-meaning",
                label: {
                    en: "Reads slowly and loses the meaning",
                    id: "Membaca perlahan lalu kehilangan makna bacaan",
                },
                barrier: {
                    en: "Reading Effort vs. Meaning",
                    id: "Beban Membaca vs Pemaknaan",
                },
                insight: {
                    en: "Most of the student's effort may go into reading itself, leaving less for understanding.",
                    id: "Sebagian besar energi siswa habis untuk proses teknis membaca, menyisakan sedikit fokus untuk menyerap maknanya.",
                },
                supports: [
                    {
                        slug: "alternative-format",
                        reason: {
                            en: "Another format can separate access from understanding.",
                            id: "Format alternatif memisahkan antara akses bacaan dengan pemahaman substansi materi.",
                        },
                    },
                    {
                        slug: "text-chunking",
                        reason: {
                            en: "Shorter passages make meaning easier to hold.",
                            id: "Paragraf pendek membuat makna kalimat lebih mudah dipegang.",
                        },
                    },
                    {
                        slug: "visual-structure",
                        reason: {
                            en: "Gives the main ideas without needing every word.",
                            id: "Menyampaikan ide pokok tanpa harus mengeja setiap kata.",
                        },
                    },
                ],
            },
            {
                id: "avoids-text",
                label: {
                    en: "Skips or avoids long texts",
                    id: "Menghindari atau melewatkan bahan bacaan yang panjang",
                },
                barrier: {
                    en: "Avoiding Long Text",
                    id: "Menghindari Bacaan Panjang",
                },
                insight: {
                    en: "Avoidance may be a response to the effort required, not a lack of motivation.",
                    id: "Sikap menghindar sering kali merupakan respon terhadap beban kognitif yang berat, bukan kurangnya motivasi.",
                },
                supports: [
                    {
                        slug: "text-chunking",
                        reason: {
                            en: "Makes the first step feel manageable.",
                            id: "Membuat langkah awal membaca terasa ringan dan terjangkau.",
                        },
                    },
                    {
                        slug: "alternative-format",
                        reason: {
                            en: "Offers another way in to the same material.",
                            id: "Menawarkan pintu masuk lain menuju materi yang sama.",
                        },
                    },
                    {
                        slug: "highlight-key-info",
                        reason: {
                            en: "Reduces what must be read closely.",
                            id: "Mengurangi bagian yang harus dibaca secara mendalam.",
                        },
                    },
                ],
            },
            {
                id: "find-info",
                label: {
                    en: "Cannot find the key information in a text",
                    id: "Kesulitan menemukan informasi pokok dalam suatu teks",
                },
                barrier: {
                    en: "Locating Key Information",
                    id: "Menemukan Informasi Pokok",
                },
                insight: {
                    en: "The student may read the text but struggle to see which parts are important.",
                    id: "Siswa membaca teks namun kesulitan menyaring bagian mana yang menjadi poin penting.",
                },
                supports: [
                    {
                        slug: "highlight-key-info",
                        reason: {
                            en: "Shows which parts to look for.",
                            id: "Menunjukkan langsung kata kunci yang perlu dicari.",
                        },
                    },
                    {
                        slug: "visual-structure",
                        reason: {
                            en: "Organises information so it is easier to locate.",
                            id: "Mengorganisir informasi dalam bagan sehingga mudah dilacak.",
                        },
                    },
                    {
                        slug: "text-chunking",
                        reason: {
                            en: "Headings per part help navigation.",
                            id: "Sub-judul di tiap bagian membantu navigasi membaca.",
                        },
                    },
                ],
            },
        ],
    },
    {
        id: "FOCUS",
        title: { en: "Focus", id: "Fokus" },
        short: { en: "Focus & task management", id: "Fokus & manajemen tugas" },
        description: {
            en: "Difficulty keeping attention or managing a task.",
            id: "Kesulitan mempertahankan perhatian atau mengelola penyelesaian tugas.",
        },
        icon: "target",
        meaning: {
            en: "The difficulty may be related to how the task is structured over time, rather than to willingness to do it.",
            id: "Hambatan mungkin terkait struktur rentang waktu tugas, bukan karena ketidakinginan siswa untuk belajar.",
        },
        clarifications: [
            {
                id: "long-tasks",
                label: {
                    en: "Loses attention on long tasks",
                    id: "Kehilangan konsentrasi pada tugas berdurasi panjang",
                },
                barrier: {
                    en: "Sustaining Attention on Long Tasks",
                    id: "Mempertahankan Fokus pada Tugas Panjang",
                },
                insight: {
                    en: "The student has difficulty maintaining focus when a task runs for a long stretch.",
                    id: "Siswa kesulitan menjaga konsentrasi saat aktivitas belajar berjalan tanpa jeda dalam waktu lama.",
                },
                supports: [
                    {
                        slug: "task-segmentation",
                        reason: {
                            en: "Shorter segments make the end feel reachable.",
                            id: "Segmen tugas yang lebih pendek membuat garis akhir terasa dapat dicapai.",
                        },
                    },
                    {
                        slug: "visual-progress-tracker",
                        reason: {
                            en: "Shows progress so effort feels worthwhile.",
                            id: "Menunjukkan kemajuan sehingga usaha terasa membuahkan hasil nyata.",
                        },
                    },
                    {
                        slug: "planned-breaks",
                        reason: {
                            en: "Planned pauses protect attention across the task.",
                            id: "Jeda terencana menjaga daya konsentrasi tetap segar sepanjang pelajaran.",
                        },
                    },
                ],
            },
            {
                id: "unfinished",
                label: {
                    en: "Starts tasks but leaves them unfinished",
                    id: "Memulai tugas tetapi meninggalkannya sebelum selesai",
                },
                barrier: {
                    en: "Task Completion",
                    id: "Penyelesaian Tugas (Task Completion)",
                },
                insight: {
                    en: "The student begins tasks but has difficulty seeing them through to the end.",
                    id: "Siswa mampu memulai pekerjaan namun kesulitan menuntaskannya hingga tuntas.",
                },
                supports: [
                    {
                        slug: "visual-progress-tracker",
                        reason: {
                            en: "Makes remaining work visible.",
                            id: "Memperlihatkan sisa tugas yang masih perlu dikerjakan.",
                        },
                    },
                    {
                        slug: "task-segmentation",
                        reason: {
                            en: "Gives several small finish lines.",
                            id: "Memberikan beberapa garis akhir kecil yang memotivasi.",
                        },
                    },
                    {
                        slug: "structured-task-sheet",
                        reason: {
                            en: "Lays out what 'done' looks like.",
                            id: "Mendefinisikan dengan jelas seperti apa hasil tugas yang 'selesai'.",
                        },
                    },
                ],
            },
            {
                id: "distracted",
                label: {
                    en: "Is easily pulled away by the surroundings",
                    id: "Mudah terdistraksi oleh situasi di sekitar ruang kelas",
                },
                barrier: {
                    en: "Environmental Distraction",
                    id: "Distraksi Lingkungan Belajar",
                },
                insight: {
                    en: "Things happening around the student appear to compete with the task.",
                    id: "Stimulus visual atau suara di sekitar bersaing dengan konsentrasi pada tugas.",
                },
                supports: [
                    {
                        slug: "planned-breaks",
                        reason: {
                            en: "Gives space to reset without leaving the task behind.",
                            id: "Memberi ruang untuk reset tanpa meninggalkan tugas utama.",
                        },
                    },
                    {
                        slug: "structured-task-sheet",
                        reason: {
                            en: "A clear structure helps return to the task.",
                            id: "Struktur lembar tugas yang jelas memudahkan siswa kembali ke tugasnya.",
                        },
                    },
                    {
                        slug: "task-segmentation",
                        reason: {
                            en: "Short segments make re-entry easy.",
                            id: "Bagian pendek memudahkan siswa melanjutkan kembali tanpa bingung.",
                        },
                    },
                ],
            },
            {
                id: "unsure-start",
                label: {
                    en: "Does not know where to start",
                    id: "Bingung harus mulai dari mana saat diberi tugas",
                },
                barrier: {
                    en: "Task Initiation",
                    id: "Inisiasi Tugas (Memulai Tugas)",
                },
                insight: {
                    en: "The student may be unsure of the first step, which makes beginning difficult.",
                    id: "Siswa bingung menentukan langkah awal, sehingga sulit untuk mulai bekerja.",
                },
                supports: [
                    {
                        slug: "structured-task-sheet",
                        reason: {
                            en: "Names the first step explicitly.",
                            id: "Menyebutkan langkah pertama secara eksplisit dan jelas.",
                        },
                    },
                    {
                        slug: "task-segmentation",
                        reason: {
                            en: "Reduces the task to a small start.",
                            id: "Menyederhanakan tugas menjadi permulaan yang sangat kecil.",
                        },
                    },
                    {
                        slug: "visual-progress-tracker",
                        reason: {
                            en: "Shows the path from start to finish.",
                            id: "Memperlihatkan jalur jelas dari awal hingga akhir.",
                        },
                    },
                ],
            },
        ],
    },
    {
        id: "EXPRESSION",
        title: { en: "Expression", id: "Ekspresi" },
        short: { en: "Showing understanding", id: "Menunjukkan pemahaman" },
        description: {
            en: "Difficulty showing understanding.",
            id: "Kesulitan mengekspresikan pemahaman materi yang telah dipelajari.",
        },
        icon: "pen-line",
        meaning: {
            en: "The difficulty may be related to how understanding is expressed, rather than to content understanding.",
            id: "Hambatan kemungkinan terletak pada bagaimana siswa diminta mengekspresikan jawabannya, bukan pada pemahaman konsepnya.",
        },
        clarifications: [
            {
                id: "verbal-not-written",
                label: {
                    en: "Can explain verbally but struggles to write",
                    id: "Mampu menjelaskan secara lisan namun kesulitan menuliskannya",
                },
                barrier: {
                    en: "Written Expression",
                    id: "Hambatan Ekspresi Tertulis",
                },
                insight: {
                    en: "The student appears to understand the content but has difficulty expressing that understanding in writing.",
                    id: "Siswa tampak memahami isi materi, namun mengalami kesulitan mengekspresikan pemahamannya dalam bentuk tulisan.",
                },
                supports: [
                    {
                        slug: "graphic-organizer",
                        reason: {
                            en: "Helps organise ideas before writing starts.",
                            id: "Membantu menyusun peta ide sebelum mulai menulis kalimat.",
                        },
                    },
                    {
                        slug: "structured-writing-prompt",
                        reason: {
                            en: "Guiding questions give writing a shape.",
                            id: "Pertanyaan pemandu memberi kerangka terarah bagi tulisan.",
                        },
                    },
                    {
                        slug: "alternative-response",
                        reason: {
                            en: "Lets understanding be shown another way when the goal allows.",
                            id: "Memungkinkan pembuktian pemahaman lewat cara lain jika tujuan asesmen memungkinkan.",
                        },
                    },
                ],
            },
            {
                id: "short-answers",
                label: {
                    en: "Written responses are very short",
                    id: "Jawaban tulisan sangat singkat padahal paham materinya",
                },
                barrier: {
                    en: "Elaborating Ideas in Writing",
                    id: "Elaborasi Ide dalam Tulisan",
                },
                insight: {
                    en: "The student may know more than their short answers show.",
                    id: "Siswa sebenarnya memahami lebih banyak dari apa yang mampu diuraikan pada jawaban tertulisnya.",
                },
                supports: [
                    {
                        slug: "structured-writing-prompt",
                        reason: {
                            en: "Prompts draw out more detail step by step.",
                            id: "Pertanyaan pancingan memancing detail jawaban selangkah demi selangkah.",
                        },
                    },
                    {
                        slug: "graphic-organizer",
                        reason: {
                            en: "Collects supporting points first.",
                            id: "Mengumpulkan poin-poin pendukung terlebih dahulu.",
                        },
                    },
                    {
                        slug: "alternative-response",
                        reason: {
                            en: "Shows how much is understood beyond writing.",
                            id: "Memperlihatkan sejauh mana pemahaman tanpa dibatasi kemampuan motorik/tulis.",
                        },
                    },
                ],
            },
            {
                id: "organizing",
                label: {
                    en: "Has difficulty organising ideas",
                    id: "Kesulitan menyusun urutan alur ide dan gagasan",
                },
                barrier: {
                    en: "Organising Ideas",
                    id: "Pengorganisasian Gagasan",
                },
                insight: {
                    en: "Ideas may be present but hard to arrange into an order.",
                    id: "Gagasan sudah ada di kepala siswa, namun sulit dirangkai ke dalam urutan yang logis.",
                },
                supports: [
                    {
                        slug: "graphic-organizer",
                        reason: {
                            en: "Provides a visible place for each idea.",
                            id: "Menyediakan kotak visual untuk menempatkan masing-masing ide.",
                        },
                    },
                    {
                        slug: "structured-writing-prompt",
                        reason: {
                            en: "Gives an order to follow.",
                            id: "Memberikan alur urutan yang tinggal diikuti siswa.",
                        },
                    },
                    {
                        slug: "visual-structure",
                        reason: {
                            en: "Maps relationships between ideas.",
                            id: "Memetakan hubungan sebab-akibat antar gagasan.",
                        },
                    },
                ],
            },
            {
                id: "incomplete-written",
                label: {
                    en: "Leaves written tasks incomplete",
                    id: "Sering meninggalkan tugas tulisan tanpa menyelesaikannya",
                },
                barrier: {
                    en: "Completing Written Tasks",
                    id: "Penyelesaian Tugas Menulis",
                },
                insight: {
                    en: "Writing may take so much effort that tasks are left unfinished.",
                    id: "Proses menulis menguras energi begitu besar sehingga tugas sering kali ditinggalkan separuh jalan.",
                },
                supports: [
                    {
                        slug: "task-segmentation",
                        reason: {
                            en: "Breaks writing into smaller achievable parts.",
                            id: "Membagi penulisan menjadi bagian-bagian kecil yang realistis dicapai.",
                        },
                    },
                    {
                        slug: "structured-writing-prompt",
                        reason: {
                            en: "Reduces decisions about what to write next.",
                            id: "Mengurangi kebingungan mengenai apa yang harus ditulis berikutnya.",
                        },
                    },
                    {
                        slug: "alternative-response",
                        reason: {
                            en: "Lowers the writing load when suitable.",
                            id: "Mengurangi beban menulis bila relevan dengan tujuan pembelajaran.",
                        },
                    },
                ],
            },
        ],
    },
    {
        id: "PARTICIPATION",
        title: { en: "Participation", id: "Partisipasi" },
        short: { en: "Joining activities", id: "Berpartisipasi dalam aktivitas" },
        description: {
            en: "Difficulty taking part in learning or group activities.",
            id: "Kesulitan berpartisipasi dalam aktivitas kelas atau kerja kelompok.",
        },
        icon: "users",
        meaning: {
            en: "The difficulty may lie in unclear expectations about how to take part, rather than unwillingness to join.",
            id: "Hambatan kemungkinan disebabkan oleh ekspektasi keterlibatan yang belum jelas, bukan karena siswa enggan bergabung.",
        },
        clarifications: [
            {
                id: "unclear-role",
                label: {
                    en: "Does not know their role in group work",
                    id: "Bingung apa perannya saat kerja kelompok berlangsung",
                },
                barrier: {
                    en: "Role Clarity in Group Work",
                    id: "Kejelasan Peran dalam Kelompok",
                },
                insight: {
                    en: "The student may want to contribute but is unsure what their part is.",
                    id: "Siswa ingin berpartisipasi namun ragu apa tanggung jawab spesifik yang harus ia pegang.",
                },
                supports: [
                    {
                        slug: "role-assignment",
                        reason: {
                            en: "Gives a clear, named part to play.",
                            id: "Memberikan peran yang jelas dan memiliki nama spesifik (misal: pengatur waktu).",
                        },
                    },
                    {
                        slug: "participation-cues",
                        reason: {
                            en: "States what taking part looks like.",
                            id: "Menyatakan dengan jelas tindakan apa yang dimaksud dengan berpartisipasi.",
                        },
                    },
                    {
                        slug: "task-division",
                        reason: {
                            en: "Splits the work into clear parts.",
                            id: "Membagi porsi tugas kelompok menjadi bagian-bagian yang jelas pemiliknya.",
                        },
                    },
                ],
            },
            {
                id: "hesitant-speak",
                label: {
                    en: "Hesitates to speak up in discussions",
                    id: "Ragu-ragu atau takut berbicara saat diskusi kelas",
                },
                barrier: {
                    en: "Entering Discussion",
                    id: "Memulai Keterlibatan Diskusi",
                },
                insight: {
                    en: "The student may find it hard to know when or how to join a conversation.",
                    id: "Siswa kesulitan mengetahui kapan momen yang tepat atau kata apa yang digunakan untuk masuk ke diskusi.",
                },
                supports: [
                    {
                        slug: "sentence-starters",
                        reason: {
                            en: "Provides words to begin with.",
                            id: "Menyediakan kalimat pembuka siap pakai untuk memulai bicara.",
                        },
                    },
                    {
                        slug: "participation-cues",
                        reason: {
                            en: "Makes the expectation to contribute explicit.",
                            id: "Membuat ekspektasi kontribusi menjadi jelas dan tidak menakutkan.",
                        },
                    },
                    {
                        slug: "role-assignment",
                        reason: {
                            en: "A defined role makes speaking purposeful.",
                            id: "Peran terdefinisi memberi alasan terarah bagi siswa untuk bersuara.",
                        },
                    },
                ],
            },
            {
                id: "left-out",
                label: {
                    en: "Often ends up on the edge of the group",
                    id: "Kerap berada di pinggiran dan terisolasi dari kelompok",
                },
                barrier: {
                    en: "Group Inclusion",
                    id: "Inklusi dalam Kelompok",
                },
                insight: {
                    en: "The group's way of working may not leave a clear entry point for the student.",
                    id: "Dinamika kerja kelompok tidak menyisakan pintu masuk yang jelas bagi siswa untuk terlibat.",
                },
                supports: [
                    {
                        slug: "role-assignment",
                        reason: {
                            en: "Creates a place for the student in the group.",
                            id: "Menciptakan ruang dan fungsi pasti bagi siswa di dalam kelompok.",
                        },
                    },
                    {
                        slug: "task-division",
                        reason: {
                            en: "Ensures every member has a share.",
                            id: "Memastikan semua anggota memiliki jatah kontribusi.",
                        },
                    },
                    {
                        slug: "participation-cues",
                        reason: {
                            en: "Sets group expectations for everyone.",
                            id: "Menetapkan kesepakatan bersama bagi seluruh anggota kelompok.",
                        },
                    },
                ],
            },
            {
                id: "turn-taking",
                label: {
                    en: "Finds it hard to follow turns or group rules",
                    id: "Kesulitan mengikuti giliran bicara atau aturan main kelompok",
                },
                barrier: {
                    en: "Group Routines",
                    id: "Rutinitas dan Giliran Kelompok",
                },
                insight: {
                    en: "Unwritten group routines may be hard for the student to read.",
                    id: "Aturan tidak tertulis dalam interaksi kelompok sulit dibaca oleh siswa.",
                },
                supports: [
                    {
                        slug: "participation-cues",
                        reason: {
                            en: "Writes the routine down explicitly.",
                            id: "Menuliskan giliran dan aturan kelompok secara gamblang.",
                        },
                    },
                    {
                        slug: "role-assignment",
                        reason: {
                            en: "Roles like timekeeper give turn structure.",
                            id: "Peran seperti pengingat waktu memberi struktur giliran yang teratur.",
                        },
                    },
                    {
                        slug: "sentence-starters",
                        reason: {
                            en: "Gives a script for taking and passing turns.",
                            id: "Memberi contoh kalimat untuk mengambil dan mengoper giliran bicara.",
                        },
                    },
                ],
            },
        ],
    },
];

export const INTERVENTIONS_DATA: LocalizedIntervention[] = [
    {
        slug: "visual-checklist",
        title: { en: "Visual Checklist", id: "Daftar Ceklist Visual" },
        category: "INSTRUCTION",
        summary: {
            en: "Show each step of a task as a simple checklist.",
            id: "Tampilkan setiap tahapan tugas sebagai daftar ceklist visual sederhana.",
        },
        why: {
            en: "Moves the sequence from memory onto the page, so remembering is no longer the barrier.",
            id: "Memindahkan beban urutan dari memori kerja ke atas kertas, sehingga daya ingat bukan lagi penghambat.",
        },
        steps: {
            en: [
                "Break the task into 3–5 steps",
                "Write or draw each step clearly",
                "Place the checklist at the student's desk",
                "Let the student tick off each step independently",
            ],
            id: [
                "Pecah tugas menjadi 3–5 langkah terukur",
                "Tulis atau gambarkan setiap langkah dengan jelas",
                "Letakkan lembar ceklist di atas meja siswa",
                "Ajak siswa mencentang setiap langkah yang telah selesai",
            ],
        },
        observe: {
            en: "Does the student move from step to step with fewer reminders?",
            id: "Apakah siswa mampu beralih dari satu tahap ke tahap berikutnya dengan lebih sedikit pengulangan instruksi?",
        },
    },
    {
        slug: "stepwise-instructions",
        title: { en: "Stepwise Instructions", id: "Instruksi Bertahap (Chunking)" },
        category: "INSTRUCTION",
        summary: {
            en: "Give one instruction at a time, then pause.",
            id: "Berikan satu instruksi pada satu waktu, lalu beri jeda hingga selesai.",
        },
        why: {
            en: "Reduces how much must be held in mind at once.",
            id: "Mengurangi beban informasi yang harus diingat secara serentak.",
        },
        steps: {
            en: [
                "Give a single clear instruction",
                "Wait until the student begins working",
                "Check progress quietly",
                "Give the next instruction only after completion",
            ],
            id: [
                "Berikan satu instruksi tunggal yang jelas",
                "Tunggu hingga siswa mulai mengerjakannya",
                "Periksa perkembangan secara tenang",
                "Berikan instruksi berikutnya hanya setelah tahap pertama selesai",
            ],
        },
        observe: {
            en: "Does the student complete each step without losing the next one?",
            id: "Apakah siswa menyelesaikan setiap langkah tanpa kehilangan arah langkah berikutnya?",
        },
    },
    {
        slug: "comprehension-check",
        title: { en: "Comprehension Check", id: "Cek Pemahaman Awal" },
        category: "INSTRUCTION",
        summary: {
            en: "Ask the student to restate the task before starting.",
            id: "Minta siswa mengulang instruksi tugas dengan kata-katanya sendiri sebelum mulai.",
        },
        why: {
            en: "Reveals misunderstandings early, before the work begins.",
            id: "Mendeteksi kesalahpahaman sejak awal sebelum tugas sempat dikerjakan keliru.",
        },
        steps: {
            en: [
                "Give the instruction",
                'Ask: "What will you do first?"',
                "Clarify anything missed gently",
                "Let the student begin with confidence",
            ],
            id: [
                "Sampaikan instruksi tugas",
                'Tanyakan: "Apa yang akan kamu lakukan pertama kali?"',
                "Luruskan bagian yang terlewat dengan tenang",
                "Biarkan siswa mulai bekerja dengan percaya diri",
            ],
        },
        observe: {
            en: "Can the student restate the task accurately in their own words?",
            id: "Dapatkah siswa mengulang kembali tugas dengan tepat memakai bahasanya sendiri?",
        },
    },
    {
        slug: "written-instruction-card",
        title: { en: "Written Instruction Card", id: "Kartu Instruksi Tertulis" },
        category: "INSTRUCTION",
        summary: {
            en: "Provide a short written version of the instructions.",
            id: "Sediakan ringkasan instruksi tertulis singkat di meja siswa.",
        },
        why: {
            en: "Gives the student something to return to without needing repetition.",
            id: "Memberi rujukan tetap bagi siswa tanpa harus bertanya berulang-ulang.",
        },
        steps: {
            en: [
                "Write the key instruction in short sentences",
                "Use clear, simple wording",
                "Hand it to the student with the spoken instruction",
                "Invite the student to re-read when unsure",
            ],
            id: [
                "Tulis instruksi kunci dalam kalimat pendek",
                "Gunakan pilihan kata yang sederhana dan langsung",
                "Berikan kartu bersamaan dengan instruksi lisan",
                "Ingatkan siswa untuk melihat kartu jika merasa ragu",
            ],
        },
        observe: {
            en: "Does the student refer back to the card instead of asking again?",
            id: "Apakah siswa menengok kartu panduan daripada berulang kali bertanya ke guru?",
        },
    },
    {
        slug: "text-chunking",
        title: { en: "Text Chunking", id: "Pemotongan Teks (Chunking)" },
        category: "READING",
        summary: {
            en: "Break long text into smaller, labelled parts.",
            id: "Pecah teks bacaan yang panjang menjadi bagian-bagian kecil berlabel.",
        },
        why: {
            en: "Lowers the amount of reading required at each moment.",
            id: "Meringankan beban membaca yang dihadapi siswa dalam satu waktu.",
        },
        steps: {
            en: [
                "Divide the text into short sections",
                "Add a clear heading to each section",
                "Leave generous white space between sections",
                "Review one section before proceeding to the next",
            ],
            id: [
                "Bagi teks menjadi bagian-bagian pendek",
                "Beri sub-judul yang jelas di tiap bagian",
                "Beri ruang spasi yang cukup antar bagian",
                "Diskusikan satu bagian sebelum lanjut ke bagian berikutnya",
            ],
        },
        observe: {
            en: "Does the student engage with the text for longer?",
            id: "Apakah siswa mampu bertahan membaca materi dalam durasi yang lebih lama?",
        },
    },
    {
        slug: "visual-structure",
        title: { en: "Visual Structure", id: "Struktur Visual / Bagan" },
        category: "READING",
        summary: {
            en: "Show the main ideas as a map, diagram or table.",
            id: "Tampilkan ide pokok bacaan dalam bentuk peta konsep, diagram, atau tabel.",
        },
        why: {
            en: "Shows how ideas relate without relying on every word.",
            id: "Memperlihatkan hubungan konsep tanpa harus bergantung pada membaca setiap kata teks.",
        },
        steps: {
            en: [
                "Choose the 3–5 main ideas",
                "Place them in a simple diagram",
                "Connect related ideas with arrows",
                "Use it alongside the text as a guide",
            ],
            id: [
                "Pilih 3–5 konsep inti materi",
                "Susun ke dalam diagram sederhana",
                "Hubungkan ide terkait menggunakan panah penjelas",
                "Gunakan bagan tersebut berdampingan dengan bacaan",
            ],
        },
        observe: {
            en: "Can the student explain the content using the diagram?",
            id: "Dapatkah siswa menceritakan isi materi menggunakan bantuan bagan tersebut?",
        },
    },
    {
        slug: "highlight-key-info",
        title: { en: "Highlight Key Information", id: "Penandaan Informasi Kunci" },
        category: "READING",
        summary: {
            en: "Mark the most important parts of a text in advance.",
            id: "Tandai terlebih dahulu kata atau kalimat paling esensial dalam bacaan.",
        },
        why: {
            en: "Directs attention to what matters most.",
            id: "Mengarahkan fokus siswa langsung ke hal yang paling pokok.",
        },
        steps: {
            en: [
                "Choose the essential sentences",
                "Highlight or bold them prominently",
                "Explain the colour code to the student",
                "Ask the student to find the highlighted ideas first",
            ],
            id: [
                "Pilih kalimat atau fakta esensial",
                "Beri sorotan warna (stabilo) atau tebalkan",
                "Jelaskan arti penandaan warna kepada siswa",
                "Minta siswa membaca bagian yang ditandai terlebih dahulu",
            ],
        },
        observe: {
            en: "Does the student locate key points faster?",
            id: "Apakah siswa lebih cepat menemukan inti bacaan?",
        },
    },
    {
        slug: "alternative-format",
        title: { en: "Alternative Material Format", id: "Format Materi Alternatif" },
        category: "READING",
        summary: {
            en: "Offer the same content in another format (audio, visuals).",
            id: "Sediakan materi yang sama dalam bentuk lain seperti audio atau ilustrasi visual.",
        },
        why: {
            en: "Separates access to information from understanding it.",
            id: "Memisahkan kemampuan teknis membaca dengan kemampuan memahami konsep materi.",
        },
        steps: {
            en: [
                "Check that the learning goal is not reading fluency itself",
                "Offer audio, infographics, or oral summary",
                "Let the student choose their preferred format",
                "Assess understanding against the core learning goal",
            ],
            id: [
                "Pastikan tujuan pembelajaran bukan kemampuan kelancaran membaca",
                "Sediakan materi audio, infografis, atau ringkasan lisan",
                "Beri kesempatan siswa memilih format aksesnya",
                "Evaluasi pemahaman siswa berdasarkan substansi tujuan materi",
            ],
        },
        observe: {
            en: "Does the student show better understanding of the content?",
            id: "Apakah siswa menunjukkan pemahaman materi yang lebih mendalam?",
        },
    },
    {
        slug: "task-segmentation",
        title: { en: "Task Segmentation", id: "Segmentasi Tugas (Task Segmentation)" },
        category: "FOCUS",
        summary: {
            en: "Divide a long task into short, clear parts.",
            id: "Bagi tugas yang panjang menjadi bagian-bagian pendek dan terpisah.",
        },
        why: {
            en: "Each part has a visible end, which makes starting and continuing easier.",
            id: "Tiap bagian memiliki garis selesai yang dekat, membuat tugas terasa tidak melelahkan.",
        },
        steps: {
            en: [
                "Divide the task into 2–3 small parts",
                "Give only one part at a time",
                "Acknowledge each completed part warmly",
                "Hand over the next part smoothly",
            ],
            id: [
                "Bagi lembar kerja menjadi 2–3 bagian kecil",
                "Berikan satu lembar/bagian saja dalam satu waktu",
                "Apresiasi ketika satu bagian berhasil diselesaikan",
                "Berikan bagian berikutnya secara bertahap",
            ],
        },
        observe: {
            en: "Does the student complete more parts of the task?",
            id: "Apakah siswa menyelesaikan porsi tugas yang lebih banyak dibanding biasanya?",
        },
    },
    {
        slug: "visual-progress-tracker",
        title: { en: "Visual Progress Tracker", id: "Pelacak Kemajuan Visual" },
        category: "FOCUS",
        summary: {
            en: "Show how much of the task is done and what remains.",
            id: "Perlihatkan berapa bagian yang sudah selesai dan berapa yang tersisa.",
        },
        why: {
            en: "Makes progress visible, which keeps effort going.",
            id: "Membuat kemajuan belajar terlihat nyata sehingga motivasi tetap terjaga.",
        },
        steps: {
            en: [
                "Draw a simple progress bar or set of boxes",
                "Link each box to a completed piece of work",
                "Let the student colour or check each box",
                "Acknowledge reaching the final goal",
            ],
            id: [
                "Gambar kotak progres sederhana di sudut meja/lembar tugas",
                "Hubungkan tiap kotak dengan sub-tugas yang selesai",
                "Beri kesempatan siswa mewarnai/mencentang kotaknya",
                "Apresiasi pencapaian ketika seluruh kotak terisi",
            ],
        },
        observe: {
            en: "Does the student keep working until the tracker is full?",
            id: "Apakah siswa terdorong terus bekerja hingga kotak pelacak penuh?",
        },
    },
    {
        slug: "structured-task-sheet",
        title: { en: "Structured Task Sheet", id: "Lembar Tugas Terstruktur" },
        category: "FOCUS",
        summary: {
            en: "Give a sheet that names the first step and what 'done' looks like.",
            id: "Sediakan lembar kerja yang menyatakan langkah awal dan definisi tugas selesai.",
        },
        why: {
            en: "Removes the uncertainty of where to start and when to stop.",
            id: "Menghilangkan keraguan siswa mengenai dari mana harus mulai dan kapan dikatakan selesai.",
        },
        steps: {
            en: [
                "State the goal in one clear sentence",
                "Name the exact first step",
                "List the remaining steps briefly",
                "Describe clearly what a finished task looks like",
            ],
            id: [
                "Tulis tujuan tugas dalam satu kalimat singkat",
                "Tuliskan langkah pertama dengan sangat spesifik",
                "Daftar langkah selanjutnya secara berurutan",
                "Gambarkan kriteria lembar tugas yang dianggap 'selesai'",
            ],
        },
        observe: {
            en: "Does the student start independently without lingering?",
            id: "Apakah siswa langsung mulai bekerja secara mandiri tanpa berlama-lama bingung?",
        },
    },
    {
        slug: "planned-breaks",
        title: { en: "Planned Breaks", id: "Jeda Terencana (Brain Breaks)" },
        category: "FOCUS",
        summary: {
            en: "Schedule short pauses suited to the lesson rhythm.",
            id: "Jadwalkan istirahat singkat yang selaras dengan alur pembelajaran.",
        },
        why: {
            en: "Protects attention across a longer activity.",
            id: "Menjaga stamina fokus siswa agar tidak jenuh pada aktivitas panjang.",
        },
        steps: {
            en: [
                "Agree on a subtle signal with the student",
                "Decide when short breaks occur",
                "Keep the break brief and quiet (1–2 minutes)",
                "Return to the task with a visible next step",
            ],
            id: [
                "Sepakati isyarat santun dengan siswa",
                "Tentukan jeda waktu yang terencana (misal tiap 15 menit)",
                "Jaga durasi jeda tetap singkat (1–2 menit peregangan)",
                "Ajak kembali ke tugas dengan menunjuk langkah lanjutan",
            ],
        },
        observe: {
            en: "Does the student return to the task more readily after breaks?",
            id: "Apakah siswa lebih siap kembali melanjutkan tugas setelah jeda singkat?",
        },
    },
    {
        slug: "graphic-organizer",
        title: { en: "Graphic Organizer", id: "Pengatur Grafis (Graphic Organizer)" },
        category: "EXPRESSION",
        summary: {
            en: "Help organise ideas before writing.",
            id: "Bantu siswa menyusun dan mengelompokkan ide sebelum mulai menulis.",
        },
        why: {
            en: "Helps students organise ideas before producing written responses.",
            id: "Membantu siswa menata ide secara visual sebelum dituntut merangkai kalimat tertulis.",
        },
        steps: {
            en: [
                "Identify the main topic or idea",
                "List supporting points in separate boxes",
                "Arrange the ideas into a logical sequence",
                "Write the response following the graphic layout",
            ],
            id: [
                "Tentukan topik atau ide pokok utama",
                "Tuliskan poin-poin pendukung dalam kotak terpisah",
                "Susun urutan ide dengan bantuan nomor/panah",
                "Tuliskan kalimat jawaban mengikuti bagan yang sudah terisi",
            ],
        },
        observe: {
            en: "Can the student organise ideas more independently?",
            id: "Apakah siswa mampu mengorganisir gagasan secara lebih terarah dan mandiri?",
        },
    },
    {
        slug: "structured-writing-prompt",
        title: { en: "Structured Writing Prompt", id: "Pemandu Menulis Berstruktur" },
        category: "EXPRESSION",
        summary: {
            en: "Break the writing task into guided questions.",
            id: "Ubah tugas menulis bebas menjadi serangkaian pertanyaan panduan.",
        },
        why: {
            en: "Gives writing a clear shape and reduces decisions about what comes next.",
            id: "Memberi bentuk yang jelas pada tulisan dan memangkas keraguan apa yang harus ditulis berikutnya.",
        },
        steps: {
            en: [
                "Turn the topic into 3–4 guiding questions",
                "Let the student answer each question one by one",
                "Join the answers together into a coherent response",
                "Review the finished writing together",
            ],
            id: [
                "Ubah topik menjadi 3–4 pertanyaan pemandu bertahap",
                "Minta siswa menjawab setiap pertanyaan satu demi satu",
                "Gabungkan jawaban-jawaban tersebut menjadi sebuah paragraf",
                "Baca dan ulas hasil tulisan bersama siswa",
            ],
        },
        observe: {
            en: "Is the response longer or more complete than before?",
            id: "Apakah hasil tulisan siswa lebih lengkap dan mengalir dibanding sebelumnya?",
        },
    },
    {
        slug: "alternative-response",
        title: { en: "Alternative Response Format", id: "Format Respons Alternatif" },
        category: "EXPRESSION",
        summary: {
            en: "Consider another way to show learning (speaking, drawing, demo).",
            id: "Beri cara alternatif untuk membuktikan pemahaman (lisan, gambar, peragaan).",
        },
        why: {
            en: "When the goal is understanding, not writing, another format shows what the student knows.",
            id: "Jika tujuan asesmen adalah pemahaman konsep, format alternatif membuka potensi siswa seutuhnya.",
        },
        steps: {
            en: [
                "Confirm that writing itself is not the specific learning target",
                "Offer choices: oral explanation, sketch, or diagram",
                "Let the student choose their expression method",
                "Evaluate against the same core learning rubric",
            ],
            id: [
                "Pastikan kemampuan menulis bukan tujuan tunggal dari asesmen tersebut",
                "Tawarkan pilihan: presentasi lisan, rekaman suara, atau diagram visual",
                "Biarkan siswa memilih cara menunjukkan pemahamannya",
                "Beri nilai berdasarkan kriteria pemahaman substansi materi",
            ],
        },
        observe: {
            en: "Does the student show understanding that writing did not reveal?",
            id: "Apakah siswa mampu menunjukkan pemahaman mendalam yang sebelumnya tertahan saat menulis?",
        },
    },
    {
        slug: "role-assignment",
        title: { en: "Role Assignment", id: "Penugasan Peran Eksplisit" },
        category: "PARTICIPATION",
        summary: {
            en: "Give each group member a clear, named role.",
            id: "Berikan setiap anggota kelompok peran yang jelas dan memiliki nama khusus.",
        },
        why: {
            en: "A named role answers 'what is my part?' unambiguously.",
            id: "Peran yang spesifik menjawab rasa ragu siswa 'apa tugasku di kelompok ini?'.",
        },
        steps: {
            en: [
                "Define 3–4 distinct roles (e.g., Reader, Timekeeper, Scribe)",
                "Explain the concrete duty of each role",
                "Assign roles deliberately suited to student strengths",
                "Rotate roles across future activities",
            ],
            id: [
                "Tentukan 3–4 peran nyata (misal: Pembaca, Penjaga Waktu, Juru Tulis)",
                "Jelaskan tugas konkret dari masing-masing peran tersebut",
                "Tugaskan peran yang sesuai dengan kesiapan siswa",
                "Lakukan rotasi peran pada aktivitas berikutnya",
            ],
        },
        observe: {
            en: "Does the student contribute purposefully within their role?",
            id: "Apakah siswa mampu berkontribusi aktif menjalankan perannya di dalam kelompok?",
        },
    },
    {
        slug: "participation-cues",
        title: { en: "Explicit Participation Cues", id: "Panduan Partisipasi Eksplisit" },
        category: "PARTICIPATION",
        summary: {
            en: "State what taking part looks like in concrete actions.",
            id: "Nyatakan secara konkret apa saja bentuk tindakan yang terhitung sebagai partisipasi.",
        },
        why: {
            en: "Makes unwritten social expectations visible and attainable.",
            id: "Membuat norma sosial yang tak tertulis menjadi kasat mata dan mudah dijangkau siswa.",
        },
        steps: {
            en: [
                "List 2–3 concrete ways to participate (e.g. holding cards, nodding, sharing 1 word)",
                "Display them clearly for the whole group",
                "Point to them gently during the activity",
                "Acknowledge right away when a cue is used",
            ],
            id: [
                "Tulis 2–3 tindakan nyata berpartisipasi (misal: memegang bahan, mengajukan 1 pertanyaan)",
                "Tampilkan panduan tersebut di tengah meja kelompok",
                "Ingatkan kembali panduan tersebut di tengah diskusi",
                "Beri apresiasi ketika siswa mempraktikkan salah satunya",
            ],
        },
        observe: {
            en: "Does the student use any of the listed ways to take part?",
            id: "Apakah siswa mencoba mempraktikkan bentuk partisipasi yang tertera?",
        },
    },
    {
        slug: "task-division",
        title: { en: "Clear Task Division", id: "Pembagian Tugas Terstruktur" },
        category: "PARTICIPATION",
        summary: {
            en: "Split group work into clearly owned individual parts.",
            id: "Bagi tugas kelompok menjadi bagian individual yang memiliki kepemilikan jelas.",
        },
        why: {
            en: "Ensures each member has a defined share of the work.",
            id: "Memastikan setiap anggota memiliki porsi kontribusi nyata tanpa saling mendominasi.",
        },
        steps: {
            en: [
                "Split the group assignment into distinct mini-tasks",
                "Assign one mini-task per member",
                "Set clear instructions on how individual parts combine",
                "Check in on each part before the final merge",
            ],
            id: [
                "Pecah tugas besar kelompok menjadi sub-tugas yang terpisah",
                "Bagikan satu sub-tugas kepada masing-masing siswa",
                "Tetapkan cara bagaimana tiap bagian disatukan kembali",
                "Tinjau kontribusi tiap siswa sebelum hasil akhir digabungkan",
            ],
        },
        observe: {
            en: "Does the student complete their part and participate in combining?",
            id: "Apakah siswa menuntaskan porsinya dan ikut saat sesi penggabungan kelompok?",
        },
    },
    {
        slug: "sentence-starters",
        title: { en: "Sentence Starters", id: "Kalimat Pembuka Diskusi" },
        category: "PARTICIPATION",
        summary: {
            en: "Provide phrases to begin speaking in discussions.",
            id: "Sediakan pilihan frasa pembuka untuk memulai berbicara dalam diskusi.",
        },
        why: {
            en: "Gives words to start with, so joining a conversation feels safe and possible.",
            id: "Memberikan kalimat awal siap pakai sehingga memulai bicara terasa aman dan mudah.",
        },
        steps: {
            en: [
                "Prepare 3–4 starter phrases on a table card",
                "Model how to use one starter during instruction",
                "Invite the student to point or read a starter",
                "Give positive praise when a starter is spoken",
            ],
            id: [
                'Siapkan 3–4 contoh kalimat pembuka di kartu meja (misal: "Menurut saya...")',
                "Contohkan cara menggunakannya di depan kelas",
                "Ajak siswa membaca salah satu kalimat pembuka saat gilirannya",
                "Beri senyuman dan apresiasi ketika siswa mencoba berbicara",
            ],
        },
        observe: {
            en: "Does the student speak up more often with a starter available?",
            id: "Apakah siswa lebih berani mengemukakan pendapat saat kalimat pembuka tersedia?",
        },
    },
];

export const RESULT_LABELS_DATA: Record<Locale, Record<string, string>> = {
    en: {
        VERY_HELPFUL: "Very Helpful",
        HELPFUL: "Helpful",
        SOME_CHANGE: "Limited Improvement",
        NOT_HELPFUL: "Not Helpful",
    },
    id: {
        VERY_HELPFUL: "Sangat membantu",
        HELPFUL: "Membantu",
        SOME_CHANGE: "Ada sedikit perubahan",
        NOT_HELPFUL: "Kurang membantu",
    },
};

export const REASON_LABELS_DATA: Record<Locale, Record<string, string>> = {
    en: {
        STILL_NEEDED_ASSISTANCE: "Student still needed significant assistance",
        DIFFICULT_TO_APPLY: "Strategy was difficult to apply",
        BARRIER_CHANGED: "Barrier appeared in a different way",
        OTHER: "Other",
    },
    id: {
        STILL_NEEDED_ASSISTANCE: "Siswa masih membutuhkan banyak bantuan",
        DIFFICULT_TO_APPLY: "Strategi sulit diterapkan di kelas",
        BARRIER_CHANGED: "Hambatan muncul dalam bentuk yang berbeda",
        OTHER: "Lainnya",
    },
};

export const STATUS_LABELS_DATA: Record<Locale, Record<string, string>> = {
    en: {
        PLANNED: "Planned",
        IN_PROGRESS: "In progress",
        NEEDS_REFLECTION: "Needs reflection",
        COMPLETED: "Completed",
    },
    id: {
        PLANNED: "Direncanakan",
        IN_PROGRESS: "Sedang berjalan",
        NEEDS_REFLECTION: "Perlu refleksi",
        COMPLETED: "Selesai",
    },
};

export const RESULT_LABELS = RESULT_LABELS_DATA.en;
export const REASON_LABELS = REASON_LABELS_DATA.en;
export const STATUS_LABELS = STATUS_LABELS_DATA.en;

export type PlanStatus = "PLANNED" | "IN_PROGRESS" | "NEEDS_REFLECTION" | "COMPLETED";
export type ReflectionResult = "VERY_HELPFUL" | "HELPFUL" | "SOME_CHANGE" | "NOT_HELPFUL";
export type ReflectionReason = "STILL_NEEDED_ASSISTANCE" | "DIFFICULT_TO_APPLY" | "BARRIER_CHANGED" | "OTHER";

// Helpers that resolve according to the provided locale (default: "id")
export function getLocalizedCategories(locale: Locale = "id") {
    return CATEGORIES_DATA.map((c) => ({
        id: c.id,
        title: c.title[locale],
        short: c.short[locale],
        description: c.description[locale],
        icon: c.icon,
        meaning: c.meaning[locale],
        clarifications: c.clarifications.map((cl) => ({
            id: cl.id,
            label: cl.label[locale],
            barrier: cl.barrier[locale],
            insight: cl.insight[locale],
            supports: cl.supports.map((s) => ({
                slug: s.slug,
                reason: s.reason[locale],
            })),
        })),
    }));
}

export function getLocalizedInterventions(locale: Locale = "id") {
    return INTERVENTIONS_DATA.map((i) => ({
        slug: i.slug,
        category: i.category,
        title: i.title[locale],
        summary: i.summary[locale],
        why: i.why[locale],
        steps: i.steps[locale],
        observe: i.observe[locale],
    }));
}

export function getCategory(id: string, locale: Locale = "id") {
    return getLocalizedCategories(locale).find((c) => c.id === id);
}

export function getClarification(categoryId: string, clarificationId: string, locale: Locale = "id") {
    return getCategory(categoryId, locale)?.clarifications.find((c) => c.id === clarificationId);
}

export function getIntervention(slug: string, locale: Locale = "id") {
    return getLocalizedInterventions(locale).find((i) => i.slug === slug);
}

// Backward compatibility references (defaulting to Indonesian)
export const CATEGORIES = getLocalizedCategories("id");
export const INTERVENTIONS = getLocalizedInterventions("id");

export interface Category {
    id: BarrierCategory;
    title: string;
    short: string;
    description: string;
    icon: "list-checks" | "book-open" | "target" | "pen-line" | "users";
    meaning: string;
    clarifications: Clarification[];
}

export interface Clarification {
    id: string;
    label: string;
    barrier: string;
    insight: string;
    supports: { slug: string; reason: string }[];
}

export interface Intervention {
    slug: string;
    title: string;
    category: BarrierCategory;
    summary: string;
    why: string;
    steps: string[];
    observe: string;
}

export interface PlanRow {
    id: string;
    studentId: string | null;
    student: { id: string; name: string } | null;
    teacherName?: string | null;
    barrierCategory: BarrierCategory;
    clarificationId: string;
    barrierTitle: string;
    interventionSlug: string;
    goal: string;
    timing: string;
    status: PlanStatus;
    reflectionResult: ReflectionResult | null;
    reflectionReason: ReflectionReason | null;
    reflectionNote: string | null;
    reflectedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Knowledge bundle (defaults + localisation) ──────────────────────────────

/** Built-in knowledge. Used as seed data and as fallback when the DB is empty. */
export const DEFAULT_KNOWLEDGE: KnowledgeData = {
    interventions: INTERVENTIONS_DATA,
    clarifications: CATEGORIES_DATA.flatMap((c) => c.clarifications.map((cl) => ({ ...cl, category: c.id }))),
};

export function localizeKnowledge(data: KnowledgeData, locale: Locale = "id") {
    const categories: Category[] = CATEGORIES_DATA.map((c) => ({
        id: c.id,
        title: c.title[locale],
        short: c.short[locale],
        description: c.description[locale],
        icon: c.icon,
        meaning: c.meaning[locale],
        clarifications: data.clarifications
            .filter((cl) => cl.category === c.id)
            .map((cl) => ({
                id: cl.id,
                label: cl.label[locale],
                barrier: cl.barrier[locale],
                insight: cl.insight[locale],
                supports: cl.supports.map((s) => ({ slug: s.slug, reason: s.reason[locale] })),
            })),
    }));
    const interventions: Intervention[] = data.interventions.map((i) => ({
        slug: i.slug,
        category: i.category,
        title: i.title[locale],
        summary: i.summary[locale],
        why: i.why[locale],
        steps: i.steps[locale],
        observe: i.observe[locale],
    }));
    return { categories, interventions };
}
