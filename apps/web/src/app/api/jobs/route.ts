import { NextResponse } from 'next/server';
import { getPublishedJobs } from '../../../lib/db-jobs';
import { jobs as staticJobs } from '../../../lib/jobs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbJobs = await getPublishedJobs();
    // Merge DB jobs with static jobs; DB jobs take precedence for matching IDs
    const dbIds = new Set(dbJobs.map((j) => j.id));
    const merged = [...dbJobs, ...staticJobs.filter((j) => !dbIds.has(j.id))];
    return NextResponse.json({ jobs: merged });
  } catch {
    // DB unavailable — serve static data so the UI always has content
    return NextResponse.json({ jobs: staticJobs });
  }
}
