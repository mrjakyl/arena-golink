CREATE TABLE links (
  name VARCHAR(64) PRIMARY KEY,
  url TEXT NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

-- statement-breakpoint

CREATE TABLE mutation_limits (
  identity TEXT PRIMARY KEY,
  count INTEGER NOT NULL CHECK (count BETWEEN 1 AND 61),
  "resetAt" TIMESTAMPTZ NOT NULL
);
