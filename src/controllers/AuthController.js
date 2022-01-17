const Bcrypt = require("bcrypt");
const Joi = require("joi");
const JWT = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

const Message = require("../components/Message");
const { User, Verification } = require("../../models");

exports.login = async (req, res) => {
  try {
    const { body } = req;

    // Validation.
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(24).required(),
    });
    const { error } = schema.validate(body);
    if (error)
      return res.status(400).send(Message.invalid(error.details[0].message));

    // Validate email.
    const user = await User.findOne({
      where: { email: body.email },
      attributes: { exclude: ["base_code", "secret_code"] },
    });
    if (!user) return res.status(400).send(Message.notexist("email"));

    // Validate password.
    const valid = await Bcrypt.compare(body.password, user.password);
    delete user.dataValues["password"];
    if (!valid)
      return res
        .status(400)
        .send(Message.invalid("Your email and password are not valid!"));

    // Check valid.
    if (!user.valid) {
      return res
        .status(400)
        .send(Message.invalid("Check your email for verification!"));
    }
    delete user.dataValues["valid"];

    // Create token.
    const token = JWT.sign({ id: user.id }, process.env.SECRET_KEY);

    res.status(200).send({
      status: "success",
      message: "Login is success!",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(Message.error());
  }
};

exports.register = async (req, res) => {
  try {
    const { body } = req;

    // Validation.
    const schema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().min(4).max(24).required(),
      address: Joi.string().required(),
      phone_number: Joi.string().regex(/^\d+$/).required(),
      password: Joi.string().min(6).max(24).required(),
    });
    const { error } = schema.validate(body);
    if (error)
      return res.status(400).send(Message.invalid(error.details[0].message));

    // Check duplicate email.
    const duplicate = await User.findOne({ where: { email: body.email } });
    if (duplicate) return res.status(400).send(Message.duplicate("email"));

    // Encryption.
    const hashedPassword = await Bcrypt.hash(
      body.password,
      parseInt(process.env.HASH_STRENGTH)
    );

    // Create user.
    const user = await User.create(
      {
        ...body,
        password: hashedPassword,
        verification: {
          secret: uuidv4(),
        },
      },
      {
        include: {
          as: "verification",
          model: Verification,
        },
      }
    );
    delete user.dataValues["password"];

    res.status(200).send({
      status: "success",
      message: "Registration is success!",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(Message.error());
  }
};

exports.verification = async (req, res) => {
  try {
    const { query } = req;

    // Validation.
    const schema = Joi.object({
      base: Joi.string().required(),
      secret: Joi.string().required(),
    });
    const { error } = schema.validate(query);
    if (error)
      return res.status(400).send(Message.invalid(error.details[0].message));

    // Validate user.
    const user = await User.findOne({
      include: {
        as: "verification",
        model: Verification,
        where: {
          [Op.and]: {
            id: query.base,
            secret: query.secret,
          },
        },
      },
    });
    if (!user)
      return res
        .status(400)
        .send(Message.invalid("Your verification is not valid!"));

    // Update user.
    await User.update({ valid: true }, { where: { id: user.id } });

    res.status(200).send({
      status: "success",
      message: "Your verification is success!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(Message.error());
  }
};

exports.resend = async (req, res) => {
  try {
    const { body } = req;

    // Validation.
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });
    const { error } = schema.validate(body);
    if (error)
      return res.status(400).send(Message.invalid(error.details[0].message));

    // Validate user.
    const user = await User.findOne({ where: { email: body.email } });
    if (!user) return res.status(400).send(Message.notexist("email"));

    // Update the code for verification.
    await User.update(
      { base_code: uuidv4(), secret_code: uuidv4() },
      { where: { id: user.id } }
    );

    res.status(200).send({
      status: "success",
      message: "Resend verfication is success!",
    });
  } catch (error) {
    console.log(error);
  }
};
