import { AcctDocType } from "@/types/models/account.type";
import { model, Model, Schema } from "mongoose"

const AcctSchema = new Schema<AcctDocType>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true },
);

const Acct: Model<AcctDocType> = model<
    AcctDocType,
    Model<AcctDocType>
>("accounts", AcctSchema);

export default Acct;


