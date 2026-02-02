import mongoose, { Document, Schema } from 'mongoose';

export interface IScanHistory extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'url' | 'email';
  content: string;
  result: {
    isPhishing: boolean;
    confidence: number;
    features: {
      [key: string]: any;
    };
  };
  createdAt: Date;
}

const scanHistorySchema = new Schema<IScanHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['url', 'email'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  result: {
    isPhishing: {
      type: Boolean,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    features: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
scanHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IScanHistory>('ScanHistory', scanHistorySchema); 