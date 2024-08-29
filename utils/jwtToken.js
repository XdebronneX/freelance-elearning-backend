const sendToken = (user, statusCode, res) => {
    // Create a JWT token
    const token = user.getJwtToken();

    // Send the token in the response body
    res.status(statusCode).json({
        success: true,
        token,
        user
    });
}

module.exports = sendToken;