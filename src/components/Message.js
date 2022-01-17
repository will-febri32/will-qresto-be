exports.duplicate = (key) => ({
  status: "invalid",
  message: `Your ${key} already exist.`,
});

exports.error = () => ({
  status: "error",
  message: "Oops... something is wrong!",
});

exports.invalid = (message) => ({
  status: "invalid",
  message,
});

exports.notexist = (key) => ({
  status: "invalid",
  message: `Your ${key} not exist.`,
});
