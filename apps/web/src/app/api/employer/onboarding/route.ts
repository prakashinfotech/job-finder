import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@jobfinder/db';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

type OnboardingBody = {
  companyName: string;
  gstNumber?: string;
  industry: string;
  companySize: string;
  website?: string;
  description?: string;
  hrName: string;
  hrEmail: string;
  hrDesignation?: string;
  hiringScale: string;
  hiringRoles?: string;
  candidateFilters?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OnboardingBody;

    const { companyName, industry, hrName, hrEmail } = body;

    if (!companyName?.trim() || !hrName?.trim() || !hrEmail?.trim()) {
      return NextResponse.json(
        { ok: false, message: 'Company name, HR name, and email are required.' },
        { status: 400 },
      );
    }

    // Upsert the recruiter user
    const user = await prisma.user.upsert({
      where: { email: hrEmail.trim().toLowerCase() },
      update: {
        name: hrName.trim(),
        role: UserRole.RECRUITER,
        isVerified: true,
        profileCompletion: 80,
      },
      create: {
        email: hrEmail.trim().toLowerCase(),
        name: hrName.trim(),
        role: UserRole.RECRUITER,
        isVerified: true,
        profileCompletion: 80,
      },
    });

    // Upsert the company
    const existingCompany = await prisma.company.findFirst({
      where: { ownerId: user.id },
    });

    const companyData = {
      ownerId: user.id,
      name: companyName.trim(),
      industry: industry ?? null,
      verificationStatus: body.gstNumber ? 'pending_verification' : 'unverified',
    };

    if (existingCompany) {
      await prisma.company.update({
        where: { id: existingCompany.id },
        data: companyData,
      });
    } else {
      await prisma.company.create({ data: companyData });
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    console.error('[onboarding]', err);
    return NextResponse.json(
      { ok: false, message: 'Internal server error.' },
      { status: 500 },
    );
  }
}
