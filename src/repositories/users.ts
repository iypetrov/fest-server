import mongoose, { Document } from 'mongoose';

export interface UserEntity extends Document {
    email: string;
    password: string;
    role: string;
    createdAt: Date;
}

const UserSchema = new mongoose.Schema<UserEntity>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role : { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const userDocument = mongoose.model<UserEntity>('User', UserSchema);

class UsersRepository {
    constructor() {
        this.create= this.create.bind(this);
        this.findById = this.findById.bind(this);
        this.findByEmail = this.findByEmail.bind(this);
    }

    public async create(email: string, password: string, role: string): Promise<UserEntity> {
        return new userDocument({ email, password, role }).save();
    }

    public async findById(id: string): Promise<UserEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return userDocument.findById(new mongoose.Types.ObjectId(id));
    }

    public async findByEmail(email: string): Promise<UserEntity | null> {
        return userDocument.findOne({ email });
    }
}

export const usersRepository = new UsersRepository();

