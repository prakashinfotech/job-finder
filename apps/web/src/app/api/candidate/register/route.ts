import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { prisma } from '@jobfinder/db';

export const dynamic = 'force-dynamic';

type RegisterBody = {
  phone: string;
  name?: string;
  role?: string;
  preferredCity?: string;
};

const roleMap: Record<string, UserRole> = {
  fresher: UserRole.JOB_SEEKER,
  experienced: UserRole.JOB_SEEKER,
  'blue-collar': UserRole.JOB_SEEKER,
  'white-collar': UserRole.JOB_SEEKER,
  'part-time': UserRole.JOB_SEEKER,
  remote: UserRole.JOB_SEEKER,
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterBody;
    const phone = body.phone?.replace(/\D/g, '');

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ ok: false, message: 'Invalid phone number' }, { status: 400 });
    }

    const fullPhone = `+91${phone}`;
    const email = `candidate.${phone}@apna-candidate.local`;
    const name = body.name?.trim() || `Candidate ${phone.slice(-4)}`;
    const userRole = roleMap[body.role ?? ''] ?? UserRole.JOB_SEEKER;

    const user = await prisma.user.upsert({
      where: { phone: fullPhone },
      update: {
        name,
        role: userRole,
      },
      create: {
        phone: fullPhone,
        email,
        name,
        role: userRole,
        isVerified: true,
        profileCompletion: body.name ? 20 : 5,
      },
    });

    // Upsert profile with preferred city if provided
    if (body.preferredCity) {
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: { location: body.preferredCity },
        create: { userId: user.id, location: body.preferredCity },
      });
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error('[candidate/register]', error);
    return NextResponse.json({ ok: false, message: 'Registration failed' }, { status: 500 });
  }
}
