import { PrismaClient, UserRole, JobStatus } from "@prisma/client";

const prisma = new PrismaClient();

const recruiter = {
  id: "seed-recruiter-jobfinder",
  role: UserRole.RECRUITER,
  name: "JobFinder Demo Recruiter",
  email: "recruiter@jobfinder-clone.local",
  phone: "+910000000001",
  isVerified: true,
  profileCompletion: 100,
};

const jobs = [
  {
    id: "customer-support-executive-821244861",
    title: "Customer Support Executive",
    company: "Aarambh Services",
    city: "Bengaluru/Bangalore",
    salaryText: "Rs. 18,000 - Rs. 26,000 monthly",
    salaryMin: 18000,
    salaryMax: 26000,
    mode: "Work from Office",
    type: "Full Time",
    department: "Customer Support",
    shift: "Day Shift",
    postedDaysAgo: 1,
    experience: "Freshers only",
    english: "Basic English",
    tag: "Actively hiring",
    openings: 12,
    location: "Koramangala, Bengaluru",
    interviewAddress: "Aarambh Services, 4th Block, Koramangala, Bengaluru",
    description:
      "Aarambh Services is hiring freshers for a customer support role. The job involves helping customers over calls and chat, resolving basic queries, and coordinating with internal teams.",
    responsibilities: [
      "Handle inbound and outbound customer queries professionally.",
      "Maintain daily call records and update customer information.",
      "Coordinate with operations teams for faster query resolution.",
    ],
    requirements: [
      "Freshers can apply with basic computer knowledge.",
      "Comfortable speaking with customers in English and Hindi.",
      "Able to work from office in a day shift.",
    ],
    benefits: ["Paid training", "Performance incentives", "Growth to team lead roles"],
    skills: ["Customer support", "Calling", "Chat support", "Basic computer"],
  },
  {
    id: "field-sales-associate-624118305",
    title: "Field Sales Associate",
    company: "Growmore Retail",
    city: "New Delhi",
    salaryText: "Rs. 20,000 - Rs. 35,000 monthly",
    salaryMin: 20000,
    salaryMax: 35000,
    mode: "Field Job",
    type: "Full Time",
    department: "Sales & BD",
    shift: "Day Shift",
    postedDaysAgo: 2,
    experience: "Any experience",
    english: "Good English",
    tag: "High incentives",
    openings: 8,
    location: "Connaught Place, New Delhi",
    interviewAddress: "Growmore Retail, Connaught Place, New Delhi",
    description:
      "Growmore Retail is looking for energetic sales associates to onboard retailers, explain product offerings, and build strong customer relationships in assigned areas.",
    responsibilities: [
      "Visit assigned markets and generate qualified leads.",
      "Explain pricing, offers, and product benefits to merchants.",
      "Meet daily visit targets and maintain follow-up reports.",
    ],
    requirements: [
      "Freshers and experienced candidates can apply.",
      "Comfortable with local travel and field meetings.",
      "Strong communication and negotiation skills.",
    ],
    benefits: ["Travel allowance", "Attractive incentives", "Fast-track promotion"],
    skills: ["Field sales", "Lead generation", "Retail onboarding", "Negotiation"],
  },
  {
    id: "back-office-executive-420913772",
    title: "Back Office Executive",
    company: "Finline Operations",
    city: "Mumbai/Bombay",
    salaryText: "Rs. 16,000 - Rs. 24,000 monthly",
    salaryMin: 16000,
    salaryMax: 24000,
    mode: "Work from Office",
    type: "Full Time",
    department: "Back Office",
    shift: "Day Shift",
    postedDaysAgo: 5,
    experience: "Freshers only",
    english: "Basic English",
    tag: "Verified",
    openings: 5,
    location: "Andheri East, Mumbai",
    interviewAddress: "Finline Operations, Andheri East, Mumbai",
    description:
      "Finline Operations needs back office executives for data verification, document checks, and daily reporting support for the operations team.",
    responsibilities: [
      "Verify customer records and documents accurately.",
      "Prepare daily MIS and status reports.",
      "Support internal teams with operational follow-ups.",
    ],
    requirements: [
      "Good typing speed and basic MS Excel knowledge.",
      "Attention to detail and willingness to learn.",
      "Freshers can apply.",
    ],
    benefits: ["Fixed day shift", "PF benefits", "Learning support"],
    skills: ["Data entry", "MS Excel", "Document verification", "MIS reporting"],
  },
  {
    id: "telecaller-183506294",
    title: "Telecaller",
    company: "Brightpath Solutions",
    city: "Hyderabad",
    salaryText: "Rs. 15,000 - Rs. 28,000 monthly",
    salaryMin: 15000,
    salaryMax: 28000,
    mode: "Work from Office",
    type: "Full Time",
    department: "Customer Support",
    shift: "Day Shift",
    postedDaysAgo: 3,
    experience: "Any experience",
    english: "Basic English",
    tag: "Immediate joining",
    openings: 10,
    location: "Madhapur, Hyderabad",
    interviewAddress: "Brightpath Solutions, Madhapur, Hyderabad",
    description:
      "Brightpath Solutions is hiring telecallers for lead follow-up, customer assistance, and appointment scheduling for partner businesses.",
    responsibilities: [
      "Call interested customers and explain service details.",
      "Schedule appointments and update call outcomes.",
      "Follow call quality guidelines and daily targets.",
    ],
    requirements: [
      "Clear communication in Hindi or Telugu.",
      "Basic computer knowledge.",
      "Freshers and experienced candidates can apply.",
    ],
    benefits: ["Joining bonus", "Monthly incentives", "Friendly team environment"],
    skills: ["Telecalling", "Lead follow-up", "Customer service", "Hindi"],
  },
  {
    id: "content-moderator-950214688",
    title: "Content Moderator",
    company: "Nextwave Business Services",
    city: "Pune",
    salaryText: "Rs. 22,000 - Rs. 32,000 monthly",
    salaryMin: 22000,
    salaryMax: 32000,
    mode: "Work from Office",
    type: "Full Time",
    department: "Back Office",
    shift: "Night Shift",
    postedDaysAgo: 6,
    experience: "Freshers only",
    english: "Good English",
    tag: "Night shift",
    openings: 6,
    location: "Viman Nagar, Pune",
    interviewAddress: "Nextwave Business Services, Viman Nagar, Pune",
    description:
      "Nextwave Business Services is hiring content moderators to review digital content, flag policy issues, and support trust and safety workflows.",
    responsibilities: [
      "Review text and image content based on policy guidelines.",
      "Escalate sensitive cases to senior reviewers.",
      "Maintain accuracy and productivity targets.",
    ],
    requirements: [
      "Comfortable working night shifts from office.",
      "Good English reading and comprehension skills.",
      "Freshers can apply.",
    ],
    benefits: ["Night shift allowance", "Cab facility", "Health insurance"],
    skills: ["Content moderation", "Policy review", "English", "Trust and safety"],
  },
  {
    id: "delivery-partner-375620194",
    title: "Delivery Partner",
    company: "QuickKart Logistics",
    city: "Chennai",
    salaryText: "Rs. 25,000 - Rs. 40,000 monthly",
    salaryMin: 25000,
    salaryMax: 40000,
    mode: "Field Job",
    type: "Full Time",
    department: "Delivery",
    shift: "Flexible Shift",
    postedDaysAgo: 8,
    experience: "Any experience",
    english: "No English required",
    tag: "Weekly payout",
    openings: 20,
    location: "T Nagar, Chennai",
    interviewAddress: "QuickKart Logistics hub, T Nagar, Chennai",
    description:
      "QuickKart Logistics is onboarding delivery partners for hyperlocal deliveries with flexible working hours and weekly payout options.",
    responsibilities: [
      "Pick up and deliver orders in assigned areas.",
      "Use the delivery app to update order status.",
      "Follow safety and customer service guidelines.",
    ],
    requirements: [
      "Bike or scooter with valid driving license.",
      "Smartphone with internet access.",
      "Freshers and experienced candidates can apply.",
    ],
    benefits: ["Weekly payout", "Flexible shift", "Insurance support"],
    skills: ["Delivery", "Driving", "Local travel", "Customer service"],
  },
  {
    id: "online-tutor-708431256",
    title: "Online Tutor",
    company: "Learnlane Academy",
    city: "Remote",
    salaryText: "Rs. 12,000 - Rs. 22,000 monthly",
    salaryMin: 12000,
    salaryMax: 22000,
    mode: "Work from Home",
    type: "Part Time",
    department: "Customer Support",
    shift: "Evening Shift",
    postedDaysAgo: 1,
    experience: "Freshers only",
    english: "Good English",
    tag: "Remote",
    openings: 4,
    location: "Work from home",
    interviewAddress: "Online interview",
    description:
      "Learnlane Academy is hiring online tutors to support school students with guided practice sessions and doubt resolution from home.",
    responsibilities: [
      "Conduct online learning sessions in the evening.",
      "Help students revise concepts and solve doubts.",
      "Share session feedback with academic coordinators.",
    ],
    requirements: [
      "Good English communication and subject clarity.",
      "Laptop or desktop with stable internet.",
      "Freshers with teaching interest can apply.",
    ],
    benefits: ["Work from home", "Flexible hours", "Teaching certificate"],
    skills: ["Online tutoring", "Teaching", "Student support", "English"],
  },
  {
    id: "marketing-intern-514907223",
    title: "Marketing Intern",
    company: "Launchpad Brands",
    city: "Gurugram",
    salaryText: "Rs. 10,000 - Rs. 18,000 monthly",
    salaryMin: 10000,
    salaryMax: 18000,
    mode: "Work from Office",
    type: "Internship",
    department: "Sales & BD",
    shift: "Day Shift",
    postedDaysAgo: 4,
    experience: "Freshers only",
    english: "Basic English",
    tag: "Internship",
    openings: 3,
    location: "Sector 44, Gurugram",
    interviewAddress: "Launchpad Brands, Sector 44, Gurugram",
    description:
      "Launchpad Brands is offering a marketing internship for freshers who want hands-on exposure to campaigns, lead generation, and brand activations.",
    responsibilities: [
      "Assist with marketing campaigns and lead research.",
      "Coordinate with sales teams for campaign follow-ups.",
      "Prepare simple reports on campaign performance.",
    ],
    requirements: [
      "Basic communication and spreadsheet skills.",
      "Interest in sales, marketing, or brand management.",
      "Available for full internship duration.",
    ],
    benefits: ["Internship certificate", "Pre-placement opportunity", "Mentorship"],
    skills: ["Marketing", "Lead research", "Campaign support", "Spreadsheets"],
  },
];

function companyId(name: string) {
  return `seed-company-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function postedAt(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function main() {
  await prisma.user.upsert({
    where: { email: recruiter.email },
    update: recruiter,
    create: recruiter,
  });

  for (const job of jobs) {
    const company = await prisma.company.upsert({
      where: { id: companyId(job.company) },
      update: {
        name: job.company,
        industry: job.department,
        verificationStatus: "verified",
      },
      create: {
        id: companyId(job.company),
        ownerId: recruiter.id,
        name: job.company,
        industry: job.department,
        verificationStatus: "verified",
      },
    });

    await prisma.job.upsert({
      where: { id: job.id },
      update: {
        companyId: company.id,
        title: job.title,
        description: job.description,
        skills: job.skills,
        salaryText: job.salaryText,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        city: job.city,
        location: job.location,
        mode: job.mode,
        type: job.type,
        department: job.department,
        shift: job.shift,
        experience: job.experience,
        english: job.english,
        tag: job.tag,
        openings: job.openings,
        interviewAddress: job.interviewAddress,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits,
        status: JobStatus.PUBLISHED,
        createdAt: postedAt(job.postedDaysAgo),
      },
      create: {
        id: job.id,
        companyId: company.id,
        title: job.title,
        description: job.description,
        skills: job.skills,
        salaryText: job.salaryText,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        city: job.city,
        location: job.location,
        mode: job.mode,
        type: job.type,
        department: job.department,
        shift: job.shift,
        experience: job.experience,
        english: job.english,
        tag: job.tag,
        openings: job.openings,
        interviewAddress: job.interviewAddress,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits,
        status: JobStatus.PUBLISHED,
        createdAt: postedAt(job.postedDaysAgo),
      },
    });
  }
}

main()
  .then(async () => {
    console.log(`Seeded ${jobs.length} jobs.`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
