import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';
import { prisma } from '@jobfinder/db';

export const dynamic = 'force-dynamic';

type ApplyBody = {
  phone: string;
  jobId: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ApplyBody;
    const phone = body.phone?.replace(/\D/g, '');
    const jobId = body.jobId?.trim();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ ok: false, message: 'Invalid phone number' }, { status: 400 });
    }

    if (!jobId) {
      return NextResponse.json({ ok: false, message: 'Missing jobId' }, { status: 400 });
    }

    const fullPhone = `+91${phone}`;
    const user = await prisma.user.findUnique({ where: { phone: fullPhone } });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Candidate not found' }, { status: 404 });
    }

    // Verify the job exists and is published
    const job = await prisma.job.findFirst({
      where: { id: jobId, status: 'PUBLISHED' },
    });

    if (!job) {
      return NextResponse.json({ ok: false, message: 'Job not found' }, { status: 404 });
    }

    // Upsert so duplicate applies are idempotent
    const application = await prisma.application.upsert({
      where: {
        // Prisma requires a unique constraint — use findFirst + create pattern
        // since there's no composite unique on (userId, jobId) in the schema
        id: `${user.id}-${jobId}`,
      },
      update: {},
      create: {
        id: `${user.id}-${jobId}`,
        userId: user.id,
        jobId,
        status: ApplicationStatus.APPLIED,
      },
    });

    return NextResponse.json({ ok: true, applicationId: application.id });
  } catch (error) {
    console.error('[applications/post]', error);
    return NextResponse.json({ ok: false, message: 'Application failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone')?.replace(/\D/g, '');

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ ok: false, message: 'Invalid phone number' }, { status: 400 });
    }

    const fullPhone = `+91${phone}`;
    const user = await prisma.user.findUnique({ where: { phone: fullPhone } });

    if (!user) {
      return NextResponse.json({ applications: [] });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      select: { jobId: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('[applications/get]', error);
    return NextResponse.json({ ok: false, message: 'Failed to fetch applications' }, { status: 500 });
  }
}
