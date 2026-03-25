import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "./generated/prisma/client";

type LessonBlockDelegate = {
  findMany(args?: Prisma.LessonBlockFindManyArgs): Prisma.PrismaPromise<unknown[]>;
  createMany(args: Prisma.LessonBlockCreateManyArgs): Prisma.PrismaPromise<Prisma.BatchPayload>;
  deleteMany(args?: Prisma.LessonBlockDeleteManyArgs): Prisma.PrismaPromise<Prisma.BatchPayload>;
};

export type PrismaClientWithLessonBlocks = PrismaClient & {
  lessonBlock: LessonBlockDelegate;
};

export type TransactionClientWithLessonBlocks = Prisma.TransactionClient & {
  lessonBlock: LessonBlockDelegate;
};

declare global {
  // eslint-disable-next-line no-var
  var __academyPrisma__: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma =
  globalThis.__academyPrisma__ ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__academyPrisma__ = prisma;
}

export const prismaWithLessonBlocks = prisma as PrismaClientWithLessonBlocks;
