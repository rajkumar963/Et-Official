import * as repository from './users.repository';
import { userDto } from '../../models/User';
import { HttpError } from '../../utils/http-error';
export async function get(userId: string) {
  const user = await repository.findById(userId);
  if (!user) throw new HttpError(401, 'Account no longer exists');
  return userDto(user);
}
export async function update(userId: string, data: { name?: string; startingBalance?: number }) {
  const user = await repository.update(userId, data);
  if (!user) throw new HttpError(404, 'Account not found');
  return userDto(user);
}
