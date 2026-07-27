import { NextRequest } from "next/server";

export function verifyHermesAuth(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return false;
    }
    const token = authHeader.split(" ")[1];
    const expectedToken = process.env.HERMES_API_KEY;
    
    // If HERMES_API_KEY is not set in environment, block everything for security.
    if (!expectedToken || token !== expectedToken) {
        return false;
    }
    return true;
}
