import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@jobfinder/db';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const phone = (formData.get('phone') as string | null)?.replace(/\D/g, '');

    // ── Validate phone ────────────────────────────────────────────────────────
    if (!phone || phone.length !== 10) {
      return NextResponse.json({ ok: false, message: 'Invalid phone number' }, { status: 400 });
    }

    // ── Validate file presence ────────────────────────────────────────────────
    if (!file) {
      return NextResponse.json({ ok: false, message: 'No resume file provided' }, { status: 400 });
    }

    // ── Validate file size ────────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, message: 'File size must be under 5 MB' },
        { status: 400 },
      );
    }

    // ── Validate MIME type ────────────────────────────────────────────────────
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, message: 'Only PDF and DOCX files are allowed' },
        { status: 400 },
      );
    }

    // ── Validate file extension ───────────────────────────────────────────────
    const originalName = file.name ?? '';
    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { ok: false, message: 'Only .pdf and .docx files are allowed' },
        { status: 400 },
      );
    }

    // ── Upsert user (may not exist yet if resume step runs before register) ──
    const fullPhone = `+91${phone}`;
    const email = `candidate.${phone}@apna-candidate.local`;
    const user = await prisma.user.upsert({
      where: { phone: fullPhone },
      update: {},
      create: {
        phone: fullPhone,
        email,
        name: `Candidate ${phone.slice(-4)}`,
        role: UserRole.JOB_SEEKER,
        isVerified: true,
        profileCompletion: 5,
      },
    });

    // ── Save file to disk ─────────────────────────────────────────────────────
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    await mkdir(uploadDir, { recursive: true });

    // Use userId + timestamp to avoid collisions and prevent path traversal
    const safeFilename = `${user.id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const resumeUrl = `/uploads/resumes/${safeFilename}`;

    // ── Upsert profile with resumeUrl ─────────────────────────────────────────
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { resumeUrl },
      create: { userId: user.id, resumeUrl },
    });

    // Bump profile completion to reflect resume uploaded (cap at 100)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileCompletion: {
          set: Math.min((user.profileCompletion ?? 0) + 30, 100),
        },
      },
    });

    return NextResponse.json({ ok: true, resumeUrl });
  } catch (error) {
    console.error('[candidate/resume]', error);
    return NextResponse.json({ ok: false, message: 'Upload failed' }, { status: 500 });
  }
}
