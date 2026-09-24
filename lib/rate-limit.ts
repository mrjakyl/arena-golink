import "server-only";
import { query } from "@/lib/db";

/** One bounded counter per teammate, shared across all serverless instances. */
export async function allowMutation(email: string): Promise<boolean> {
  const rows = await query(
    `INSERT INTO mutation_limits (identity, count, "resetAt")
     VALUES ($1, 1, now() + interval '1 minute')
     ON CONFLICT (identity) DO UPDATE SET
       count = CASE WHEN mutation_limits."resetAt" <= now()
         THEN 1 ELSE LEAST(mutation_limits.count + 1, 61) END,
       "resetAt" = CASE WHEN mutation_limits."resetAt" <= now()
         THEN now() + interval '1 minute' ELSE mutation_limits."resetAt" END
     RETURNING count`,
    [email.toLowerCase()],
  );
  return Number(rows[0]?.count) <= 60;
}
