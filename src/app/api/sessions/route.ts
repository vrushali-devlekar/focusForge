import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateAndUpdateStreak } from "@/lib/streak";
import { parseDayKey, addDays } from "@/lib/day";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Account suspended: " + (user.blockedReason || "Access restricted.") },
        { status: 403 }
      );
    }

    // The browser passes its own calendar day so "today" follows the user's timezone
    const todayDate = parseDayKey(new URL(req.url).searchParams.get("day"));

    // 1. Fetch Today's DailyStat
    const todayStat = await db.dailyStat.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: todayDate,
        },
      },
    });

    // 2. Fetch last 30 days of stats for contribution heatmap
    const thirtyDaysAgo = addDays(todayDate, -29);
    const recentHistory = await db.dailyStat.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { date: "asc" },
    });

    // 3. Fetch recent focus sessions
    const recentSessions = await db.focusSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    const totalSeconds = todayStat?.totalSeconds ?? 0;
    const targetSeconds = todayStat?.targetSeconds ?? 7200; // default 2 hours
    // Today's streakCount only becomes non-zero once today's goal is met. Until
    // then, show the streak still alive from yesterday instead of a misleading 0.
    let streakCount = todayStat?.streakCount ?? 0;
    if (streakCount === 0) {
      const yesterdayStat = recentHistory.find(
        (stat) => stat.date.getTime() === addDays(todayDate, -1).getTime()
      );
      if (yesterdayStat && yesterdayStat.totalSeconds >= yesterdayStat.targetSeconds) {
        streakCount = yesterdayStat.streakCount;
      }
    }
    const progressPercentage = Math.min(
      Math.round((totalSeconds / targetSeconds) * 100),
      100
    );
    const isGoalMet = totalSeconds >= targetSeconds;

    return NextResponse.json({
      todayStats: {
        totalSeconds,
        targetSeconds,
        streakCount,
        progressPercentage,
        isGoalMet,
      },
      recentHistory,
      recentSessions,
    });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: "Account suspended: " + (user.blockedReason || "Access restricted.") },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { duration, startedAt, endedAt } = body;

    // Requirement: Prevent saving accidental clicks shorter than 10 seconds
    if (typeof duration !== "number" || duration < 10) {
      return NextResponse.json(
        { error: "Session duration must be at least 10 seconds to log." },
        { status: 400 }
      );
    }

    const startDate = startedAt ? new Date(startedAt) : new Date(Date.now() - duration * 1000);
    const endDate = endedAt ? new Date(endedAt) : new Date();
    const todayDate = parseDayKey(body.day);

    // Distraction Shield stats are optional; null means the shield was off
    const toNonNegativeInt = (value: unknown): number | null =>
      typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
    const distractionCount = toNonNegativeInt(body.distractionCount);
    const rawAwaySeconds = toNonNegativeInt(body.awaySeconds);
    const awaySeconds =
      rawAwaySeconds === null ? null : Math.min(rawAwaySeconds, Math.round(duration));

    // 1. Create the FocusSession record
    const sessionData: Record<string, unknown> = {
      userId: user.id,
      duration: Math.round(duration),
      startedAt: startDate,
      endedAt: endDate,
    };
    if (distractionCount !== null) {
      sessionData.distractionCount = distractionCount;
      sessionData.awaySeconds = awaySeconds ?? 0;
    }

    const focusSession = await (db.focusSession.create as any)({
      data: sessionData,
    });

    // 2. Upsert Today's DailyStat
    const dailyStat = await db.dailyStat.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: todayDate,
        },
      },
      update: {
        totalSeconds: { increment: Math.round(duration) },
      },
      create: {
        userId: user.id,
        date: todayDate,
        totalSeconds: Math.round(duration),
        targetSeconds: 7200, // 2 hours default
        streakCount: 0,
      },
    });

    // 3. Compute and update streak continuity
    const activeStreak = await calculateAndUpdateStreak(
      user.id,
      todayDate,
      dailyStat.totalSeconds,
      dailyStat.targetSeconds
    );

    return NextResponse.json({
      success: true,
      focusSession,
      todayTotalSeconds: dailyStat.totalSeconds,
      activeStreak,
    });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
