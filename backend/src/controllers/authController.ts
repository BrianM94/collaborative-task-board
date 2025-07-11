import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/userService";
import { User } from "../models/User";
import { config } from "../config/config";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: "Usuario y contraseña requeridos" });
      return;
    }
    const existing = await UserService.findByUsername(username);
    if (existing) {
      res.status(409).json({ message: "El usuario ya existe" });
      return;
    }
    const user = await UserService.createUser(username, password);
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: "Usuario y contraseña requeridos" });
      return;
    }
    const user = await UserService.findByUsername(username);
    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }
    const valid = await UserService.validatePassword(user, password);
    if (!valid) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.JWT_SECRET!,
      { expiresIn: "8h" }
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
