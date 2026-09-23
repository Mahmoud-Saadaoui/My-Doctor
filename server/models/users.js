const { DataTypes } = require('sequelize');
const db = require('./database');


const User = db.define('user', {
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: { isEmail: true },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    userType: {
        type: DataTypes.ENUM('doctor', 'normal'),
        allowNull: false,
        defaultValue: 'normal',
    },
    latitude: {
        type: DataTypes.DOUBLE,
    },
    longitude: {
        type: DataTypes.DOUBLE,
    }
}, {
    tableName: 'users',
    timestamps: true,
});

User.associate = models => {
    User.hasOne(models.Profile, { as: 'profile', foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Availability, { as: 'availabilities', foreignKey: 'doctorId', onDelete: 'CASCADE' });
    User.hasMany(models.Appointment, { as: 'patientAppointments', foreignKey: 'patientId', onDelete: 'CASCADE' });
    User.hasMany(models.Appointment, { as: 'doctorAppointments', foreignKey: 'doctorId', onDelete: 'CASCADE' });
}


module.exports = User;
