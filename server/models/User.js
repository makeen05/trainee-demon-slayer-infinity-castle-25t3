import mongoose from 'mongoose';
// password hashing library
import bcrypt from 'bcryptjs';

// Define UserSchema like username, email, password, createdAt
// Validate Email format
// Hash passwords
// Method to check if password is correct during login
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function() {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return;
  
  // Generate salt (random data added to password)
  const salt = await bcrypt.genSalt(10);
  // Hash password (one-way encryption)
  this.password = await bcrypt.hash(this.password, salt);
  // No next() call needed - async/await handles it
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);