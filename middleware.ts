export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/profile",
    "/decks/create",
    "/settings",
    "/routines",
    "/",
    "/profile/:path*",
  ],
};
