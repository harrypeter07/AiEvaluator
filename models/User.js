import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			trim: true,
			minlength: [3, "Username must be at least 3 characters long"],
			maxlength: [30, "Username cannot exceed 30 characters"],
			match: [
				/^[a-zA-Z0-9_]+$/,
				"Username can only contain letters, numbers, and underscores",
			],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [
				/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
				"Please enter a valid email address",
			],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters long"],
		},
		role: {
			type: String,
			enum: ["user", "admin", "teacher"],
			default: "user",
		},
		assignments: {
			type: [
				{
					name: String,
					submittedAt: Date,
					grade: Number,
					feedback: String,
				},
			],
			default: [],
		},
		googleId: {
			type: String,
			sparse: true,
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: function (doc, ret) {
				delete ret.password;
				delete ret.__v;
				return ret;
			},
		},
	}
);

// Index for faster queries
userSchema.index({ email: 1, googleId: 1 });

// Method to safely get user data without sensitive information
userSchema.methods.toSafeObject = function () {
	const obj = this.toObject();
	delete obj.password;
	delete obj.__v;
	return obj;
};

// Static method to find user by email (case insensitive)
userSchema.statics.findByEmail = function (email) {
	return this.findOne({ email: new RegExp(email, "i") });
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
