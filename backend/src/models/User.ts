import mongoose, { Document, Schema, CallbackWithoutResultAndOptionalError, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

interface INotifications {
  email: boolean;
  scanResults: boolean;
}

interface ISecurity {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  notifications: INotifications;
  security: ISecurity;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notifications: {
    email: {
      type: Boolean,
      default: true,
    },
    scanResults: {
      type: Boolean,
      default: true,
    },
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 120,
    },
  },
});

// Hash password before saving
userSchema.pre('save', async function(this: IUser, next: CallbackWithoutResultAndOptionalError): Promise<void> {
  if (!this.isModified('password')) {
    next();
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('An unknown error occurred');
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema); 