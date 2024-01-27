export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/profile",
    "/decks/create",
    "/games/create",
    "/settings",
    "/routines",
    "/",
    "/profile/:path*",
  ],
};
