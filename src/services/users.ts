import bcrypt from 'bcryptjs';

import { usersRepository } from '../repositories/users';

export enum Role {
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
}

const getRoleFromString = (role: string): Role | null => {
    return Object.values(Role).includes(role as Role) ? (role as Role) : null;
};

export interface UserModel {
    id: string;
    email: string;
    role: Role;
}

class UsersService {
    constructor() {
        this.create = this.create.bind(this);
        this.getByEmail = this.getByEmail.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
    }

    public async create(email: string, password: string, userRole: string = Role.CLIENT): Promise<UserModel | null> {
        const hashedPassword = await bcrypt.hash(password, 10); 
        const role = getRoleFromString(userRole);
        if (!role) {
            return null;
        }

        const user = await usersRepository.create(email, hashedPassword, role);
        if (!user) {
            return null;
        }

        return { id: user.id, email: user.email, role: role }; 
    }

    public async getByEmail(email: string): Promise<UserModel | null> {
        const user = await usersRepository.findByEmail(email);
        if (!user) {
            return null;
        }

        const role = getRoleFromString(user.role);
        if (!role) {
            return null;
        }

        return { id: user.id, email: user.email, role: role }; 
    }

    public async validatePassword(email: string, password: string): Promise<boolean> {
        const user = await usersRepository.findByEmail(email);
        if (!user) {
            return false;
        }

        return await bcrypt.compare(password, user.password);
    }
}

export const usersService = new UsersService();

