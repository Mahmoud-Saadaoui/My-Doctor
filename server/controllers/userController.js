import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jsonwebtoken from 'jsonwebtoken';
import prisma from '../config/db.js';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  userType: true,
  createdAt: true,
  updatedAt: true,
};

const publicUserWithProfileSelect = {
  ...publicUserSelect,
  profile: true,
};

const createToken = user => jsonwebtoken.sign(
  { sub: user.id, userType: user.userType },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
);

export const register = async (req, res, next) => {
  const {
    name,
    email,
    password,
    userType = 'normal',
    location,
    specialization,
    address,
    workingHours,
    phone,
  } = req.body;

  // Generate email verification token (24-hour expiry)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const user = await prisma.$transaction(async tx => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: await bcrypt.hash(password, 12),
          userType,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        },
      });

      if (userType === 'doctor') {
        await tx.profile.create({
          data: {
            userId: createdUser.id,
            specialization,
            address,
            workingHours,
            phone,
          },
        });
      }

      return createdUser;
    });

    res.status(201).json({
      message: req.t('auth.register.success'),
      messageKey: 'auth.register.success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: req.t('auth.register.emailAlreadyUsed'),
        messageKey: 'auth.register.emailAlreadyUsed',
      });
    }

    return next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: req.t('auth.login.invalidCredentials'),
        messageKey: 'auth.login.invalidCredentials',
      });
    }

    // Block sign-in until the email address has been verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: req.t('auth.emailNotVerified'),
        messageKey: 'auth.emailNotVerified',
        language: req.language,
      });
    }

    return res.status(200).json({
      accessToken: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const me = (req, res) => {
  res.json(req.currentUser);
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.currentUser.id },
      select: publicUserWithProfileSelect,
    });

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const {
    name,
    password,
    // userType is intentionally NOT read from req.body.
    // Role changes must go through the admin approval flow.
    specialization,
    address,
    location,
    workingHours,
    phone,
  } = req.body;

  try {
    const updated = await prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { id: req.currentUser.id } });

      if (!user) {
        return false;
      }

      // Build update data without userType - role is managed by admins only
      const userData = {};
      if (name !== undefined) userData.name = name;
      if (password) userData.password = await bcrypt.hash(password, 12);
      if (location) {
        userData.latitude = location.latitude ?? null;
        userData.longitude = location.longitude ?? null;
      }

      await tx.user.update({
        where: { id: user.id },
        data: userData,
      });

      // Use the existing user's role, not anything from the request body
      if (user.userType === 'doctor') {
        const existingProfile = await tx.profile.findUnique({ where: { userId: user.id } });
        const profileData = {
          specialization: specialization ?? existingProfile?.specialization,
          address: address ?? existingProfile?.address,
          workingHours: workingHours ?? existingProfile?.workingHours,
          phone: phone ?? existingProfile?.phone,
        };

        if (existingProfile) {
          await tx.profile.update({
            where: { userId: user.id },
            data: profileData,
          });
        } else {
          await tx.profile.create({
            data: {
              userId: user.id,
              ...profileData,
            },
          });
        }
      } else {
        await tx.profile.deleteMany({ where: { userId: user.id } });
      }

      return true;
    });

    if (!updated) {
      return res.status(404).json({
        message: req.t('auth.userNotFound'),
        messageKey: 'auth.userNotFound',
      });
    }

    return res.status(200).json({
      message: req.t('auth.profileUpdated'),
      messageKey: 'auth.profileUpdated',
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.currentUser.id } });
    return res.status(200).json({
      message: req.t('auth.accountDeleted'),
      messageKey: 'auth.accountDeleted',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: req.t('auth.userNotFound'),
        messageKey: 'auth.userNotFound',
      });
    }

    return next(error);
  }
};
