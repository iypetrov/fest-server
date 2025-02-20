import mongoose, { Document } from 'mongoose';

export interface UserEntity extends Document {
    email: string;
    password: string;
    role: string;
}

const UserSchema = new mongoose.Schema<UserEntity>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role : { type: String, required: true },
});

const userDocument = mongoose.model<UserEntity>('User', UserSchema);

class UsersRepository {
    constructor() {
        this.create= this.create.bind(this);
        this.findById = this.findById.bind(this);
        this.findByEmail = this.findByEmail.bind(this);
    }

    async create(email: string, password: string, role: string): Promise<UserEntity> {
        return new userDocument({ email, password, role }).save();
    }

    async findById(id: string): Promise<UserEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid user id:', id);
            return null; 
        }
        return userDocument.findById(new mongoose.Types.ObjectId(id));
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return userDocument.findOne({ email });
    }
}

export const usersRepository = new UsersRepository();

