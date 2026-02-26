const bcrybt = require('bcryptjs')
const models = require('../models')
const jsonwebtoken = require('jsonwebtoken')

exports.register = async (req, res) => {
    const {name, email, password, userType, location, specialization, address, workingHours, phone} = req.body;

    try {
        const hashPassword = await bcrybt.hash(password, 10)
        const user = await models.User.create({
            name,
            email,
            password: hashPassword,
            userType,
            latitude: location?.latitude,
            longitude: location?.longitude
        })

        if(userType === 'doctor') {
            const profile = await models.Profile.create({
                userId: user.id,
                specialization,
                address,
                workingHours,
                phone
            })
        }

        res.status(200).json({message: "تم إنشاء حسابك بنجاح"})
    } catch (e) {
        console.log("Registration error:", e);
        res.status(500).json({
            errors: [{message: e.message || "حدث خطأ أثناء التسجيل"}]
        })
    }
}


exports.login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await models.User.findOne({where: {email}})

        if(!user) {
            return res.status(401).json({
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحين"
            })
        }

        const authSuccess = await bcrybt.compare(password, user.password)

        if(!authSuccess) { 
            return res.status(401).json({
                message: "البريد الإلكتروني أو كلمة المرور غير صحيحين"
            })
        }

        const token = jsonwebtoken.sign({id: user.id, name: user.name, email: user.email}, process.env.JWT_SECRET);

        res.status(200).json({accessToken:  token})
    } catch (e) {
        
    }
}


exports.me = (req, res) => {
    const user = req.currentUser;
    res.json(user)
}

exports.getProfile = async (req, res) => {
    try {
        const result = await models.User.findOne({
            where: {id: req.currentUser.id},
            include: [{model: models.Profile, as: "profile"}],
            attributes: {exclude: ["password"]}
        })

        res.status(200).json(result)
    } catch (e) {
        res.status(500).json(e)
    }
}


exports.updateProfile = async (req, res) => {
    const {name, password, userType, specialization, address, location, workingHours, phone } = req.body;

    try {
      const updateData = {
        name,
        userType,
      };

      if (password) {
        updateData.password = await bcrybt.hash(password, 10);
      }

      if (location) {
        updateData.latitude = location.latitude;
        updateData.longitude = location.longitude;
      }

      // Update user
      await models.User.update(updateData, {where : {
        id: req.currentUser.id
      }})

    if(userType === "doctor") {
          // Check if profile exists, if not create it, if yes update it
          const existingProfile = await models.Profile.findOne({
            where: {userId: req.currentUser.id}
          });

          if (existingProfile) {
            // Update existing profile
            await models.Profile.update({
              specialization,
              address,
              workingHours,
              phone
            }, {where: {userId: req.currentUser.id}})
          } else {
            // Create new profile
            await models.Profile.create({
              userId: req.currentUser.id,
              specialization,
              address,
              workingHours,
              phone
            })
          }
    }
    res.status(200).json({
        message: "تم تعديل البيانات بنجاح"
    })
    } catch (e) {
      console.log("Update error:", e);
      res.status(500).json({
        errors: [{message: e.message || "حدث خطأ أثناء التحديث"}]
      });
    }
  }

  exports.deleteProfile = async (req, res) => {
    try {
      // First delete the profile if it exists (for doctors)
      await models.Profile.destroy({
        where: { userId: req.currentUser.id },
      });

      // Then delete the user
      await models.User.destroy({
        where: { id: req.currentUser.id },
      });

      res.status(200).json({
        message: "تم حذف الحساب بنجاح"
      });
    } catch (e) {
      console.log("Delete error:", e);
      res.status(500).json({
        errors: [{message: e.message || "حدث خطأ أثناء الحذف"}]
      });
    }
  };