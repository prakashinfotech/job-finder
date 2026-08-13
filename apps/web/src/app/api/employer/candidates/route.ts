import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { prisma } from '@jobfinder/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() ?? '';
    const location = searchParams.get('location')?.trim() ?? '';
    const expMin = Number(searchParams.get('expMin') ?? '');
    const expMax = Number(searchParams.get('expMax') ?? '');
    const salaryMax = Number(searchParams.get('salaryMax') ?? '');

    const candidates = await prisma.user.findMany({
      where: {
        role: UserRole.JOB_SEEKER,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { profile: { bio: { contains: query, mode: 'insensitive' } } },
              ],
            }
          : {}),
        ...(location
          ? { profile: { location: { contains: location, mode: 'insensitive' } } }
          : {}),
        ...(Number.isFinite(expMin) && expMin >= 0
          ? { profile: { experienceYears: { gte: expMin } } }
          : {}),
        ...(Number.isFinite(expMax) && expMax > 0
          ? { profile: { experienceYears: { lte: expMax } } }
          : {}),
        ...(Number.isFinite(salaryMax) && salaryMax > 0
          ? { profile: { salaryExpectation: { lte: salaryMax } } }
          : {}),
      },
      include: { profile: true },
      take: 50,
      orderBy: { profileCompletion: 'desc' },
    });

    const result = candidates.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone ? `+91 ****${u.phone.slice(-4)}` : '',
      location: u.profile?.location ?? null,
      experienceYears: u.profile?.experienceYears ?? null,
      skills: u.profile?.bio
        ? u.profile.bio
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 8)
        : [],
      salaryExpectation: u.profile?.salaryExpectation ?? null,
      resumeUrl: u.profile?.resumeUrl ?? null,
      profileCompletion: u.profileCompletion,
    }));

    return NextResponse.json({ candidates: result });
  } catch (err) {
    console.error('[employer/candidates]', err);
    return NextResponse.json({ ok: false, message: 'Internal server error.' }, { status: 500 });
  }
}
