import { User } from '../../models/User';
export const findById = (userId: string) => User.findById(userId);
export const update = (
  userId: string,
  data: { name?: string; startingBalance?: number; image?: string },
) => User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
