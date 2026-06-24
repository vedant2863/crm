"use server";

import { getServerSession as authGetServerSession } from "./auth";
import bcrypt from "bcryptjs";
import dbConnect from "../dbConnect";
import User from "@/models/user";

export async function getServerSession() {
    return await authGetServerSession();
}

export async function registerUser(input: {
    name: string;
    email: string;
    password: string;
}) {
    try {
        await dbConnect();
        const { name, email, password } = input;
        
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return { error: "Email already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "user",
        });

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
            error: null,
        };
    } catch (e) {
        const errMsg = e instanceof Error ? e.message : "Failed to register";
        return { error: errMsg };
    }
}