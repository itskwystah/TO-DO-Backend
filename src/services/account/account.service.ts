import Account from "@/models/account/account.model";
import {
  AcctDocType,
  AcctFilType,
  AcctType,
  SessionType,
} from "@/types/models/account.type";

export const findAcctS = async (
  filter: AcctFilType,
  selectFields?: string,
): Promise<AcctDocType | null> => {
  const account = await Account.findOne(filter)
    .select(selectFields || "")
    .exec();
  return account as AcctDocType | null;
};

export const pushSessionS = async (accountId: string, session: SessionType) => {
  return Account.findByIdAndUpdate(
    accountId,
    { $push: { sessions: session } },
    { new: true },
  );
};

export const regS = async (data: AcctType) => {
  const account = await Account.create(data);
  return account;
};
