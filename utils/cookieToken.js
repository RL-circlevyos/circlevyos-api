const cookieToken = (user, req, res) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // signed: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  user.password = undefined;
  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = cookieToken;
