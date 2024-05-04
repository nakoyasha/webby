import { Schema, model } from "mongoose"

export enum BlockedReason {
    BadHeader = "bad_header",
    BadUserAgent = "bad_user_agent",
    BadRoute = "bad_route",
}

export type BlockedLog = {
    ip: string,
    reason: BlockedReason
    blocked_on: Date,
}

export const BlockedLogSchema = new Schema<BlockedLog>({
    ip: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        enum: ["bad_header", "bad_user_agent", "bad_route"],
        required: true,
    },
    blocked_on: {
        type: Date,
        required: true,
    }
})

export const BlockedLogModel = model("blocked_log", BlockedLogSchema, "BlockedLogs")