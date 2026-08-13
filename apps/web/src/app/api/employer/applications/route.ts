import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';
import { prisma } from '@jobfinder/db';

export const dynamic = 'force-dynamic';

const DEMO_RECRUITER_EMAIL = 'demo.employer@apna-clone.local';

export async function GET() {
  try {
    const recruiter = await prisma.user.findUnique({
      where: { email: DEMO_RECRUITER_EMAIL },
      include: { companies: true },
    });

    if (!recruiter) {
      return NextResponse.json({ applicants: [] });
    }

    const companyIds = recruiter.companies.map((c) => c.id);

    const applications = await prisma.application.findMany({
      where: {
        job: { companyId: { in: companyIds } },
      },
      include: {
        user: {
          include: { profile: true },
        },
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const applicants = applications.map((app) => ({
      id: app.id,
      candidateName: app.user.name,
      candidatePhone: app.user.phone ?? '',
      jobTitle: app.job.title,
      jobId: app.job.id,
      status: app.status as string,
      appliedAt: app.createdAt.toISOString(),
      experience: app.job.experience ?? undefined,
      location: app.user.profile?.location ?? app.job.city ?? undefined,
    }));

    return NextResponse.json({ applicants });
  } catch (err) {
    console.error('[employer/applications GET]', err);
    return NextResponse.json({ ok: false, message: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { applicationId: string; status: string };
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { ok: false, message: 'applicationId and status are required.' },
        { status: 400 },
      );
    }

    const validStatuses = Object.values(ApplicationStatus) as string[];
    // Also allow OFFER as a virtual stage (map to INTERVIEW_SCHEDULED in DB until schema is extended)
    const dbStatus = status === 'OFFER' ? ApplicationStatus.INTERVIEW_SCHEDULED : status;

    if (!validStatuses.includes(dbStatus)) {
      return NextResponse.json(
        { ok: false, message: `Invalid status: ${status}` },
        { status: 400 },
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: dbStatus as ApplicationStatus },
    });

    return NextResponse.json({ ok: true, id: updated.id, status: updated.status });
  } catch (err) {
    console.error('[employer/applications PATCH]', err);
    return NextResponse.json({ ok: false, message: 'Internal server error.' }, { status: 500 });
  }
}
