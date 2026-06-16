export interface SessionData {
    userId: string;
    status: SessionStatus;
    createdAt: string;
}
export type SessionStatus = "active" | "blocked";
