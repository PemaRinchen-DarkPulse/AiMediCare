const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: false,
    },
    dob: {
        type: Date,
    },
    otp: {
        value: {
            type: String,
        },
        expiresAt: {
            type: Date,
        }
    }
}, { timestamps: true });

userSchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
