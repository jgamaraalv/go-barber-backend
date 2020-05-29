import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';

import AppError from '../errors/AppError';
import User from '../models/User';
import { tmpFolder } from '../config/upload';

interface ExecuteUserAvatarDTO {
  user_id: string;
  avatar_file_name: string;
}

class UpdateUserAvatarService {
  public async execute({
    user_id,
    avatar_file_name,
  }: ExecuteUserAvatarDTO): Promise<User> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar.', 401);
    }

    if (user.avatar) {
      const userAvatarFilePath = path.join(tmpFolder, user.avatar);
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    }

    user.avatar = avatar_file_name;

    await usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
