const router = require("express").Router();

const {
  register,
  login,
  verification,
} = require("./controllers/AuthController");

router.post("/login", login);
router.post("/register", register);
router.post("/validate", verification);

module.exports = router;
