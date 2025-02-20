import { Request, Response } from 'express';

import { usersService } from '../services/users';

class UsersController {
    constructor() {
        this.getUserById = this.getUserById.bind(this);
    }

    public async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await usersService.getUserById(id);
            if (!user) {
                res.status(400).send('User doesn\'t exists');
                return;
            }

            res.status(200).json({ id: user.id, email: user.email, role: user.role });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to get user by id');
        }
    }
}

export const usersController = new UsersController();

