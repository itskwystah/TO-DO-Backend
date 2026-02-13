import Account from "@/models/account/account.model";
import {
    AcctDocType,
    AcctFilType,
    AcctType,
} from "@/types/account/account.type"

export const findAcctS = async (
    filter: AcctFilType,
): Promise<AcctDocType | null> => {
    const account = await Account.findOne(filter).exec ();
    return account as AcctDocType | null;
};

export const regS = async (data: AcctType) => {
    const account = await Account.create(data);
    return account;
};