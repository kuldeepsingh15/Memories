import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import { google } from 'googleapis';
import { totp } from 'otplib';

totp.options = { step: 300 };

const createTransporter = async () => {
  const OAuth2 = google.auth.OAuth2;

  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject('Failed to create access token :(');
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ username }).lean();

    if (!user) {
      return res.json({ message: 'Invalid username/password' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match || email !== user.email) {
      return res.json({ message: 'Invalid email/password' });
    }

    const token = jwt.sign(
      {
        username: username,
        email: email,
      },
      process.env.JWT_SECRET,
    );

    return res.status(200).json({
      message: 'ok',
      token: token,
      user: {
        username: user.username,
        email: user.email,
        joinedAt: user.joinedAt,
        following: user.following,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: 'ok' });
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({ message: 'Username/Email already exists' });
    }

    return res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Invalid Email' });
    }

    const isValidOTP = totp.check(otp, process.env.OTP_SECRET);
    if (!isValidOTP) {
      return res.json({ message: 'Wrong OTP!' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'ok' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgot = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email }).select({ password: 0 }).lean();

    if (!user) {
      return res.json({ message: 'Invalid Email' });
    }

    const sendEmail = async (emailOptions) => {
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(emailOptions);
    };

    const token = totp.generate(process.env.OTP_SECRET);

    const html = `
      <h3>Hello ${user.username}, </h3>
      <p>We have received a request for password reset for your account. Here, is the six-digit OTP to continue.</p>
      <h1 style="text-align: center;">${token}</h1>
      <p>It will be valid for the next five minutes. Please do not share OTP with anyone.</p>
      <br/>
      <p>If you did not make this request, you can safely ignore this email.</p>
      <p>Thank You</p>
    `;

    const mailDetails = {
      from: `Memories ${process.env.EMAIL}`,
      to: email,
      subject: 'Password Change',
      html: html,
    };

    await sendEmail(mailDetails);
    return res.status(200).json({ message: 'ok' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const authenticate = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ username: decoded.username })
      .select({ password: 0 })
      .lean();

    return res.status(200).json({
      message: 'ok',
      user: user,
    });
  } catch (err) {
    return res.sendStatus(500).json({ message: err.message });
  }
};
