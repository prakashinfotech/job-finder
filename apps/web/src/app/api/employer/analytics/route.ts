import { NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';
import { prisma } from '@jobfinder/db';

export const dynamic = 'force-dynamic';

const DEMO_RECRUITER_EMAIL = 'demo.employer@apna-clone.local';

const STAGE_LABELS: Record<string, string> = {
  APPLIED: 'New applicants',
  VIEWED: 'Viewed',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export async function GET() {
  try {
    const recruiter = await prisma.user.findUnique({
      where: { email: DEMO_RECRUITER_EMAIL },
      include: { companies: true },
    });

    if (!recruiter) {
      return NextResponse.json({
        totalApplications: 0,
        totalHired: 0,
        totalRejected: 0,
        totalShortlisted: 0,
        totalInterviews: 0,
        avgTimeToHireDays: null,
        applicationsByJob: [],
        funnelStages: [],
        applicationsByDay: [],
      });
    }

    const companyIds = recruiter.companies.map((c) => c.id);

    const applications = await prisma.application.findMany({
      where: { job: { companyId: { in: companyIds } } },
      include: { job: true },
      orderBy: { createdAt: 'asc' },
    });

    const totalApplications = applications.length;
    const totalHired = applications.filter((a) => a.status === ApplicationStatus.HIRED).length;
    const totalRejected = applications.filter((a) => a.status === ApplicationStatus.REJECTED).length;
    const totalShortlisted = applications.filter(
      (a) => a.status === ApplicationStatus.SHORTLISTED,
    ).length;
    const totalInterviews = applications.filter(
      (a) => a.status === ApplicationStatus.INTERVIEW_SCHEDULED,
    ).length;

    // Avg time to hire: days between application creation and last update for HIRED apps
    const hiredApps = applications.filter((a) => a.status === ApplicationStatus.HIRED);
    const avgTimeToHireDays =
      hiredApps.length > 0
        ? Math.round(
            hiredApps.reduce((sum, a) => {
              const days = (a.updatedAt.getTime() - a.createdAt.getTime()) / 86_400_000;
              return sum + days;
            }, 0) / hiredApps.length,
          )
        : null;

    // Applications by job
    const jobMap = new Map<string, number>();
    for (const app of applications) {
      const title = app.job.title;
      jobMap.set(title, (jobMap.get(title) ?? 0) + 1);
    }
    const applicationsByJob = Array.from(jobMap.entries())
      .map(([jobTitle, count]) => ({ jobTitle, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Funnel stages
    const stageOrder = [
      ApplicationStatus.APPLIED,
      ApplicationStatus.VIEWED,
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW_SCHEDULED,
      ApplicationStatus.HIRED,
      ApplicationStatus.REJECTED,
    ];
    const funnelStages = stageOrder.map((stage) => {
      const count = applications.filter((a) => a.status === stage).length;
      const pct = totalApplications > 0 ? (count / totalApplications) * 100 : 0;
      return { stage: STAGE_LABELS[stage] ?? stage, count, pct };
    });

    // Applications by day (last 14 days)
    const now = new Date();
    const applicationsByDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = applications.filter(
        (a) => a.createdAt.toISOString().slice(0, 10) === dateStr,
      ).length;
      applicationsByDay.push({ date: dateStr, count });
    }

    return NextResponse.json({
      totalApplications,
      totalHired,
      totalRejected,
      totalShortlisted,
      totalInterviews,
      avgTimeToHireDays,
      applicationsByJob,
      funnelStages,
      applicationsByDay,
    });
  } catch (err) {
    console.error('[employer/analytics]', err);
    return NextResponse.json({ ok: false, message: 'Internal server error.' }, { status: 500 });
  }
}
