import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  feedback: string;
  createdAt: Date;
  status: 'open' | 'replied' | 'closed';
  adminReply?: string;
  repliedAt?: Date;
}

const FeedbackSchema: Schema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['open', 'replied', 'closed'],
    default: 'open',
  },
  adminReply: {
    type: String,
  },
  repliedAt: {
    type: Date,
  },
});

const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback; 