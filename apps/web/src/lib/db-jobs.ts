import { JobStatus, type Job as PrismaJob, type Company } from '@prisma/client';
import { prisma } from '@jobfinder/db';
import type { Job } from './jobs';

type JobWithCompany = PrismaJob & {
  company: Company;
};

function daysSince(date: Date) {
  const elapsed = Date.now() - date.getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000));
}

function fallbackList(items: string[], fallback: string) {
  return items.length > 0 ? items : [fallback];
}

export function mapDbJob(job: JobWithCompany): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company.name,
    city: job.city ?? 'Remote',
    salary: job.salaryText ?? 'Salary not disclosed',
    salaryMin: job.salaryMin ?? 0,
    salaryMax: job.salaryMax ?? job.salaryMin ?? 0,
    mode: job.mode ?? 'Work from Office',
    type: job.type ?? 'Full Time',
    department: job.department ?? job.company.industry ?? 'Operations',
    shift: job.shift ?? 'Day Shift',
    postedDaysAgo: daysSince(job.createdAt),
    experience: job.experience ?? 'Any experience',
    english: job.english ?? 'Basic English',
    tag: job.tag ?? 'Actively hiring',
    openings: job.openings,
    location: job.location ?? job.city ?? 'Remote',
    interviewAddress: job.interviewAddress ?? 'Online interview',
    description: job.description,
    responsibilities: fallbackList(job.responsibilities, 'Manage day-to-day role responsibilities.'),
    requirements: fallbackList(job.requirements, 'Relevant skills and willingness to learn.'),
    benefits: fallbackList(job.benefits, 'Growth opportunity'),
  };
}

export async function getPublishedJobs() {
  const dbJobs = await prisma.job.findMany({
    where: { status: JobStatus.PUBLISHED },
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  });

  return dbJobs.map(mapDbJob);
}

export async function getPublishedJobBySlug(slug: string) {
  const job = await prisma.job.findFirst({
    where: {
      id: slug,
      status: JobStatus.PUBLISHED,
    },
    include: { company: true },
  });

  return job ? mapDbJob(job) : null;
}
