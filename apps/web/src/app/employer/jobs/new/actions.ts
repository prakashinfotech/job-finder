'use server';

import { JobStatus, UserRole } from '@prisma/client';
import { prisma } from '@jobfinder/db';

type CreateJobState = {
  ok: boolean;
  message: string;
  jobId?: string;
  fields?: Record<string, string>;
};

const recruiter = {
  id: 'demo-employer-recruiter',
  role: UserRole.RECRUITER,
  name: 'Demo Employer',
  email: 'demo.employer@jobfinder-clone.local',
  phone: '+919999999999',
  isVerified: true,
  profileCompletion: 100,
};

function readRequiredText(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function readOptionalText(formData: FormData, key: string) {
  const value = readRequiredText(formData, key);
  return value.length > 0 ? value : undefined;
}

function readNumber(formData: FormData, key: string) {
  const value = Number(readRequiredText(formData, key));
  return Number.isFinite(value) ? value : undefined;
}

function readList(formData: FormData, key: string) {
  return readRequiredText(formData, key)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readSubmittedFields(formData: FormData) {
  const fields = [
    'companyName',
    'department',
    'title',
    'city',
    'location',
    'mode',
    'type',
    'shift',
    'openings',
    'salaryMin',
    'salaryMax',
    'experience',
    'english',
    'description',
    'skills',
    'responsibilities',
    'requirements',
    'benefits',
    'interviewAddress',
  ];

  return fields.reduce<Record<string, string>>((values, key) => {
    values[key] = String(formData.get(key) ?? '');
    return values;
  }, {});
}

function buildSalaryText(salaryMin?: number, salaryMax?: number) {
  if (!salaryMin && !salaryMax) {
    return undefined;
  }

  const formatter = new Intl.NumberFormat('en-IN');

  if (salaryMin && salaryMax) {
    return `Rs. ${formatter.format(salaryMin)} - Rs. ${formatter.format(salaryMax)} monthly`;
  }

  return `Rs. ${formatter.format(salaryMin ?? salaryMax ?? 0)} monthly`;
}

export async function createJobPosting(_: CreateJobState, formData: FormData): Promise<CreateJobState> {
  const fields = readSubmittedFields(formData);
  const companyName = readRequiredText(formData, 'companyName');
  const title = readRequiredText(formData, 'title');
  const description = readRequiredText(formData, 'description');
  const city = readRequiredText(formData, 'city');
  const location = readRequiredText(formData, 'location');
  const skills = readRequiredText(formData, 'skills')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
  const openings = readNumber(formData, 'openings') ?? 1;
  const salaryMin = readNumber(formData, 'salaryMin');
  const salaryMax = readNumber(formData, 'salaryMax');

  if (!companyName || !title || !description || !city || !location) {
    return { ok: false, message: 'Please fill all required fields.', fields };
  }

  if (description.length < 20) {
    return { ok: false, message: 'Job description should be at least 20 characters.', fields };
  }

  if (skills.length === 0) {
    return { ok: false, message: 'Add at least one required skill.', fields };
  }

  if (openings < 1) {
    return { ok: false, message: 'Openings must be at least 1.', fields };
  }

  const user = await prisma.user.upsert({
    where: { email: recruiter.email },
    update: recruiter,
    create: recruiter,
  });

  const company = await prisma.company.upsert({
    where: { id: 'demo-employer-company' },
    update: {
      ownerId: user.id,
      name: companyName,
      industry: readOptionalText(formData, 'department'),
      verificationStatus: 'verified',
    },
    create: {
      id: 'demo-employer-company',
      ownerId: user.id,
      name: companyName,
      industry: readOptionalText(formData, 'department'),
      verificationStatus: 'verified',
    },
  });

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title,
      description,
      skills,
      salaryText: buildSalaryText(salaryMin, salaryMax),
      salaryMin,
      salaryMax,
      city,
      location,
      mode: readOptionalText(formData, 'mode'),
      type: readOptionalText(formData, 'type'),
      department: readOptionalText(formData, 'department'),
      shift: readOptionalText(formData, 'shift'),
      experience: readOptionalText(formData, 'experience'),
      english: readOptionalText(formData, 'english'),
      tag: 'New posting',
      openings,
      interviewAddress: readOptionalText(formData, 'interviewAddress'),
      responsibilities: readList(formData, 'responsibilities'),
      requirements: readList(formData, 'requirements'),
      benefits: readList(formData, 'benefits'),
      status: JobStatus.PUBLISHED,
    },
  });

  return {
    ok: true,
    jobId: job.id,
    message: `${title} has been published successfully.`,
  };
}
