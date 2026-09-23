const { DataTypes } = require('sequelize');
const db = require('./database');


const Profile = db.define('profile', {
    specialization: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    workingHours: {
        type: DataTypes.STRING(255),
    },
    phone: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    bio: {
        type: DataTypes.TEXT,
    },
    consultationFee: {
        type: DataTypes.DECIMAL(10, 2),
    },
    timezone: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: 'Africa/Tunis',
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    tableName: 'profiles',
    timestamps: true,
});

Profile.associate = models => {
    Profile.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
}

module.exports = Profile;