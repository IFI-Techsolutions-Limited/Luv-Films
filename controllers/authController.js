const passport = require('passport');
const bcryptjs = require('bcryptjs');

//------------ User Model ------------//
const User = require('../models/User');

//------------ Register Handle ------------//
exports.registerHandle = (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 8) {
        errors.push({ msg: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
        return res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }

    User.findOne({ email: email }).then(user => {
        if (user) {
            errors.push({ msg: 'Email ID already registered' });
            return res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
        }

        const newUser = new User({
            name,
            email,
            password,
            verified: true
        });

        bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then(() => {
                        req.flash(
                            'success_msg',
                            'You are now registered and can log in.'
                        );
                        res.redirect('/auth/login');
                    })
                    .catch(err => console.log(err));
            });
        });
    });
};

//------------ Forgot Password Handle ------------//
exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    let errors = [];

    if (!email) {
        errors.push({ msg: 'Please enter an email ID' });
        return res.render('forgot', { errors, email });
    }

    User.findOne({ email: email }).then(user => {
        if (!user) {
            errors.push({ msg: 'User with Email ID does not exist!' });
            return res.render('forgot', { errors, email });
        }

        // Email sending removed — go straight to reset page for local/demo use
        res.redirect(`/auth/reset/${user._id}`);
    });
};

exports.resetPassword = (req, res) => {
    var { password, password2 } = req.body;
    const id = req.params.id;

    if (!password || !password2) {
        req.flash('error_msg', 'Please enter all fields.');
        return res.redirect(`/auth/reset/${id}`);
    }

    if (password.length < 8) {
        req.flash('error_msg', 'Password must be at least 8 characters.');
        return res.redirect(`/auth/reset/${id}`);
    }

    if (password != password2) {
        req.flash('error_msg', 'Passwords do not match.');
        return res.redirect(`/auth/reset/${id}`);
    }

    bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(password, salt, (err, hash) => {
            if (err) throw err;
            password = hash;

            User.findByIdAndUpdate(
                { _id: id },
                { password },
                function (err) {
                    if (err) {
                        req.flash('error_msg', 'Error resetting password!');
                        return res.redirect(`/auth/reset/${id}`);
                    }
                    req.flash('success_msg', 'Password reset successfully!');
                    res.redirect('/auth/login');
                }
            );
        });
    });
};

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
};

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
};
