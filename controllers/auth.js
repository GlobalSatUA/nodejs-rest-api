const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const jimp = require("jimp");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const uuid = require('uuid');
const {sendVerificationEmail} = require("./mail");
const mongoose = require('mongoose');

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

    const avatarURL = gravatar.url(email,{s: '100', r: 'x', d: 'retro'});

    const verificationToken = uuid.v4();

    const newUser = new User({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken, 
    });

    await newUser.save();

sendVerificationEmail(newUser.email, newUser.verificationToken);

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

  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  async function updateAvatar(req, res, next) {
    try {
      upload.single("avatar")(req, res, async function (err) {
        if (err) {
          return next(err);
        }
  
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
  
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const user = await User.findOne({ _id: userId, token });
  
        if (!user) {
          return res.status(401).json({ message: "Not authorized" });
        }
  
        const uniqueFileNameTmp = `${user._id}-${Date.now()}${path.extname(
          req.file.originalname
        )}`;
        const filePathTmp = path.join(__dirname, '..', 'tmp', uniqueFileNameTmp);
  
        await fs.writeFile(filePathTmp, req.file.buffer);
  
        const image = await jimp.read(filePathTmp);
        await image.resize(250, 250).writeAsync(filePathTmp);
  
        const uniqueFileName = `${user._id}-${Date.now()}${path.extname(
          req.file.originalname
        )}`;
        const filePath = path.join(__dirname, '..', 'public', 'avatars', uniqueFileName);
  
        await fs.rename(filePathTmp, filePath);
  
        user.avatarURL = `/avatars/${uniqueFileName}`;
        await user.save();
  
        return res.status(200).json({ avatarURL: user.avatarURL });
      });
    } catch (error) {
      return next(error);
    }
  };

  async function verificationToken(req, res, next) {
    try {
      const verificationToken = req.params.verificationToken;
  
      const user = await User.findOne({ verificationToken });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.verificationToken !== verificationToken) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }
  
      user.verify = true;
      user.verificationToken = null;
      await user.save();

      return res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };



  async function reSendMail(req, res, next) {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: 'missing required field email' });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.verify) {
        return res.status(400).json({ message: 'Verification has already been passed' });
      }
    
      sendVerificationEmail(email, user.verificationToken);
      return res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  
  
  
  
module.exports = { register, login, logout, getCurrentUser, updateAvatar, verificationToken, reSendMail };
