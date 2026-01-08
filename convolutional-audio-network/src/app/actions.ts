"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

// --- FIX: Standard Stable Initialization ---
const prisma = new PrismaClient();
// -------------------------------------------

export async function saveAnalysis(fileName: string, topPrediction: any) {
  const { userId } = await auth();
  
  if (!userId) return null;

  try {
    return await prisma.analysis.create({
      data: {
        userId,
        fileName,
        topClass: topPrediction.class,
        confidence: topPrediction.confidence,
      },
    });
  } catch (error) {
    console.error("Failed to save analysis:", error);
    return null;
  }
}

export async function getHistory() {
  const { userId } = await auth();
  
  if (!userId) return [];

  try {
    return await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
}