import mongoose, { Document, Schema } from 'mongoose';

export interface IURLScan extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  isPhishing: boolean;
  score: number;
  features?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const URLScanSchema = new Schema<IURLScan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    url: {
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

const URLScan = mongoose.model<IURLScan>('URLScan', URLScanSchema);

export default URLScan;