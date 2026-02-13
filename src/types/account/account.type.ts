import { Document } from "mongoose";

export type AcctType = {
    name: string;
    email: string;
    password: string;
};

export type AcctFilType = Partial<AcctType>;

export type AcctDocType = AcctType & Document;

