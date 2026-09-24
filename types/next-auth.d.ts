import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Profile {
    email_verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    teamVerified?: boolean;
  }
}
