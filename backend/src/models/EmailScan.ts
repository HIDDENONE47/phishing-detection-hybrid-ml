import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailScan extends Document {
  userId: mongoose.Types.ObjectId;
  from: string;
  subject?: string;
  content: string;
  isPhishing: boolean;
  score: number;
  features?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const EmailScanSchema = new Schema<IEmailScan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    from: {
      type: String,
      required: true
    },
    subject: {
      type: String
    },
    content: {
      type: String,
      required: true
    },
    isPhishing: {
      type: Boolean,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    features: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

const EmailScan = mongoose.model<IEmailScan>('EmailScan', EmailScanSchema);

export default EmailScan;