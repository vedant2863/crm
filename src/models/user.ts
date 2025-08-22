import mongoose, { Schema } from "mongoose";


const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
        password: { type: String, required: true },
        phone: { type: String },
        company: { type: String },
        position: { type: String },
        timezone: { type: String, default: "UTC" },
        language: { type: String, default: "en" },
        notifications: {
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: false },
            dealUpdates: { type: Boolean, default: true },
            taskReminders: { type: Boolean, default: true },
            contactActivities: { type: Boolean, default: false },
            weeklyReports: { type: Boolean, default: true }
        },
        security: {
            twoFactorAuth: { type: Boolean, default: false },
            sessionTimeout: { type: Number, default: 30 },
            loginHistory: { type: Boolean, default: true }
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;