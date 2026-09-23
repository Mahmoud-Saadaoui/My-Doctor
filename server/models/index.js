const User = require('./users');
const Profile = require('./profile');
const Availability = require('./availability');
const Appointment = require('./appointment');


const models = {
    User: User,
    Profile: Profile,
    Availability,
    Appointment,
}

Object.keys(models).forEach(key => {
    if('associate' in models[key]) {
        models[key].associate(models)
    }
})

module.exports = models;
