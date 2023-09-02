const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const {
    registrationSchema,
    loginSchema,
  } = require('../schema/userSchema');

async function register(req, res, next) {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Error, required fields are missing"});
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use"});
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      email,
      password: hashedPassword,
      subscription: "starter",
    });

    await newUser.save();

    return res.status(201).json({ user: { email: newUser.email, subscription: newUser.subscription } });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: "Error, required fields are missing" });
      }
  
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: "Email or password is wrong" });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log('Password does not match for user:', user.email);
        return res.status(401).json({ message: "Email or password is wrong" });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      user.token = token;
      await user.save();
  
      return res.status(200).json({ token, user: { email: user.email, subscription: user.subscription } });
    } catch (error) {
      return next(error);
    }
  }
  
  

  async function logout(req, res, next) {
    const token = req.header("Authorization").replace("Bearer ", "");
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      const userId = decoded.userId;
  
      const user = await User.findOne({ _id: userId, token });
  
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }
  
      user.token = "";
      await user.save();
  
      res.status(204).send();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  const getCurrentUser = async (req, res) => {
    try {
      const { email, subscription } = req.user;
  
      res.status(200).json({ email, subscription });
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  };
  

module.exports = { register, login, logout, getCurrentUser };
