const setSucureCookie = (res, token)=>{
    res.cookie('access_token', token, {
        httpOnly: true,
        maxAge: 5 * 60 * 1000, // 5 minutes
        secure: false
    });
    return res;
}

module.exports = {setSucureCookie}