import { NextResponse } from 'next/server';
import { ApplicationStatus, JobStatus } from '@prisma/client';
import { prisma } from '@jobfinder/db';

export const dynamic = 'force-dynamic';

// Demo recruiter — matches the one used in job posting actions
const DEMO_RECRUITER_EMAIL = 'demo.employer@apna-clone.local';

export async function GET() {
  try {
    const recruiter = await prisma.user.findUnique({
      where: { email: DEMO_RECRUITER_EMAIL },
      include: { companies: { include: { jobs: { include: { applications: true } } } } },
    });

    if (!recruiter) {
      return NextResponse.json({
        stats: {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          newApplications: 0,
          shortlisted: 0,
          hired: 0,
        },
        recentJobs: [],
      });
    }

    const allJobs = recruiter.companies.flatMap((c) => c.jobs);
    const allApplications = allJobs.flatMap((j) => j.applications);

    const stats = {
      totalJobs: allJobs.length,
      activeJobs: allJobs.filter((j) => j.status === JobStatus.PUBLISHED).length,
      totalApplications: allApplications.length,
      newApplications: allApplications.filter((a) => a.status === ApplicationStatus.APPLIED).length,
      shortlisted: allApplications.filter((a) => a.status === ApplicationStatus.SHORTLISTED).length,
      hired: allApplications.filter((a) => a.status === ApplicationStatus.HIRED).length,
    };

    const recentJobs = allJobs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map((job) => ({
        id: job.id,
        title: job.title,
        location: job.location ?? job.city ?? 'Remote',
        openings: job.openings,
        applicationCount: job.applications.length,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
      }));

    return NextResponse.json({ stats, recentJobs });
  } catch (err) {
    console.error('[dashboard]', err);
    return NextResponse.json({ ok: false, message: 'Internal server error.' }, { status: 500 });
  }
}
