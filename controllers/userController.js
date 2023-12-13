const UserModel = require("../models/User.model.js");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/functions.js");

/** POST: http://localhost:9000/api/register
 * @param:{
        "username":"example123",
        "password":"example@123",
        "email":"example@gmail.com",
        "firstName":"bill",
        "lastName":"william",
        "mobile":8009860560,
        "address":"Apt. 556, Kulas Light, Gwenborough",
        "profile":""
    } 
 */
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      password,
      email,
    } = req.body;

    console.log(" Files: ", req.file)

    const profile = req.file ? req.file.filename : "base64";

    // check the existing user
    const existUsername = new Promise((resolve, reject) => {
      UserModel.findOne({ username })
        .then((user) => {
          if (user) reject({ error: "Please use unique username" });

          resolve();
        })
        .catch((error) => {
          res.status(500).send({ error });
        });
    });

    // check for existing email
    const existEmail = new Promise((resolve, reject) => {
      UserModel.findOne({ email })
        .then((user) => {
          if (user) return reject({ error: "Please use unique email" });

          resolve();
        })
        .catch((error) => {
          return reject({ error });
        });
    });

    Promise.all([existUsername, existEmail])
      .then(() => {
        if (password) {
          bcrypt
            .hash(password, 10)
            .then((hashPassword) => {
              const user = new UserModel({
                firstName,
                lastName,
                username,
                profile,
                email,
                password: hashPassword,
              });

              // return save result as a response
              user
                .save()
                .then((user) => {
                  const access = generateAccessToken({
                    userId: user.id,
                    username: user.username,
                  });

                  const refresh = generateRefreshToken({
                    userId: user.id,
                    username: user.username,
                  });

                  const { password, _id: id, __v, ...rest } = Object.assign(
                    {},
                    user.toJSON()
                  );

                  return res.status(201).send({ id, ...rest, access, refresh });
                })
                .catch((err) => {
                  res.status(500).send({ err });
                });
            })
            .catch((err) => {
              console.log(" Error ", err);

              return res.status(500).send({
                error: "unable to hashed password",
              });
            });
        }
      })
      .catch((err) => {
        console.log(" Error ", err);
        return res.status(500).send({ err });
      });
  } catch (error) {
    console.log(" Error ", err);
    return res.status(500).send(error);
  }
};

/**
 * @param:{
        "username":"example123",
        "password":"example@123"
    }  
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    UserModel.findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then(async (passwordCheck) => {
            if (!passwordCheck)
              return res.status(404).send({ error: "Don't have Password" });

            const access = generateAccessToken({
              userId: user.id,
              username: user.username,
            });

            const refresh = generateRefreshToken({
              userId: user.id,
              username: user.username,
            });

            const { password, _id: id, __v, ...rest } = Object.assign(
              {},
              user.toJSON()
            );

            return res
              .status(200)
              .send({ id, ...rest, access, refresh });
          })
          .catch((error) => {
            return res.status(404).send({ error: "Password does not match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "Username doesn't found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/** GET: http://localhost:9000/api/users/example123 */
exports.getUser = async (req, res) => {
  const { username } = req.params;

  if (!username) res.status(501).send({ error: "Invalid Username" });

  const user = await UserModel.findOne({ username }).select("-password")

  if (!user) res.status(404).send({ message: "Couldn't find the user" });

  return res.status(200).send(user);
};

/** PUT: http://localhost:9000/api/update-user
  * @param:{
    firstName:'',
    address:'',
    profile:""
  }
*/
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.user;

    if (userId) {
      const body = req.file
        ? { ...req.body, profile: req.file.filename }
        : req.body;

      // update the data
      await UserModel.findByIdAndUpdate(
        { _id: userId },
        { $set: body },
        { new: true }
      ).select("-password")
        .then((user) => {
          return res.status(201).send(user);
        })
        .catch((error) => {
          return res.status(400).send({ error });
        });
    } else {
      return res.status(400).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    return res.status(400).send({ error });
  }
};

exports.getUserDetails = async (req, res) => {
  const { userId } = req.user;

  return await UserModel.findOne({ _id: userId }).select("-password").then(async (user) => res.status(200).json(user));
};

/** GET: http://localhost:9000/api/generate-otp/?username=example123 */
exports.generateOTP = async (req, res) => {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  res.status(201).send({ code: req.app.locals.OTP });
};

/** GET: http://localhost:9000/api/verify-otp/?username=example&code=###### */
exports.verifyOTP = async (req, res) => {
  const { code } = req.query;

  if (parseInt(req.app.locals.OTP) == parseInt(code)) {
    req.app.locals.OTP = null; //reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify successfully!" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
};

// successfully redirect user when OTP is valid
/** GET: http://localhost:9000/api/create-reset-session */
exports.createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false; //allow access to this route only once

    return res.status(201).send({ msg: "access granted!" });
  }
  return res.status(440).send({ error: "Session expired!" });
};

//update the password when we have valid session
/** PUT: http://localhost:9000/api/reset-password 
 * @param:{
    "username":"abc",
    "password":"abc@1234"
  }
 * 
*/
exports.resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { username, password } = req.body;

    try {
      await UserModel.findOne({ username })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then((hashPassword) => {
              UserModel.updateOne({ _id: user.id }, { password: hashPassword })
                .then((data) => {
                  req.app.locals.resetSession = false;
                  return res.status(201).send({ msg: "Record Updated!" });
                })
                .catch((error) => {
                  return res
                    .status(500)
                    .send({ error: "Enable to hashed password" });
                });
            })
            .catch((error) => {
              return res
                .status(500)
                .send({ error: "Enable to hashed password" });
            });
        })
        .catch((error) => {
          return res.status(404).send({ error: "Username not Found" });
        });
    } catch (error) {
      return res.status(404).send({ error });
    }
  } catch (error) {
    return res.status(400).send({ error });
  }
};

exports.refreshToken = async (req, res) => {
  const { refresh } = req.body;

  if (refresh == null) return res.sendStatus(403);

  jwt.verify(refresh, process.env.JWT_REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    console.log(" User Id ", user);

    const access = generateAccessToken({
      userId: user.userId,
      username: user.username,
    });

    res.json({
      refresh,
      access,
    });
  });
};



