import { User } from "../models/User";
import bcrypt from "bcrypt";

export class UserService {
  static async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    // @ts-expect-error: Sequelize typing issue
    return User.create({ username, password: hashedPassword });
  }

  static async findByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username } });
  }

  static async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
