import { AcctDocType, SessionType } from "@/types/models/account.type";
import { model, Model, Schema } from "mongoose";

const SessionSchema = new Schema<SessionType>(
  {
    sid: { type: String, required: true },
    ip: { type: String },
    geo: {
      range: [Number],
      country: String,
      region: String,
      eu: String,
      timezone: String,
      city: String,
      ll: [Number],
      metro: Number,
      area: Number,
    },
    userAgent: {
      browser: {
        name: String,
        version: String,
        type: String,
      },
      cpu: {
        architecture: String,
      },
      device: {
        vendor: String,
        model: String,
        type: String,
      },
      engine: {
        name: String,
        version: String,
      },
      os: {
        name: String,
        version: String,
      },
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: true, timestamps: false },
);

const AcctSchema = new Schema<AcctDocType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sessions: [SessionSchema],

    // OTP fields for forgot password
    forgotOtp: { type: String, default: null },
    forgotOtpExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

const Acct: Model<AcctDocType> = model<AcctDocType, Model<AcctDocType>>(
  "accounts",
  AcctSchema,
);

export default Acct;
