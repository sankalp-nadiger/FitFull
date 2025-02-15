import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    chatRoomId: { type: String, required: true },

    // Sender can be either a "User" or a "Doctor"
    sender: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userType: { type: String, enum: ['User', 'Doctor'], required: true }
    },

    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.model('Message', messageSchema);
