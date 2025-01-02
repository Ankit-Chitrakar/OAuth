const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 4001;

const app = express();
app.use(cors());

app.get('/', (req, res)=>{
    res.send(`<h1>Welcome to OAuth API Server</h1>`);
})

app.get('/auth/github', (req, res)=>{
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo,security_events`;

    res.redirect(githubAuthUrl);
});

app.get('/auth/github/callback', async (req, res)=>{
    const { code } = req.query;

    try{
        if(!code){
            return res.status(404).json({message: 'Authorization code was not provided'});
        }

        const tokenResponse = await axios.post(`https://github.com/login/oauth/access_token`, {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {headers: {Accept: 'application/json'}});

        res.cookie('access_token', tokenResponse.data.access_token);

        const profile = `${process.env.FRONTEND_BASE_URL}/v1/profile/github`
        res.redirect(profile)

    }catch(err){
        res.status(500).json({message: err.message})
    }
});

app.get('/auth/google', (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:4000/auth/google/callback&response_type=code&scope=profile+email`;

    res.redirect(googleAuthUrl);
})

app.get('/auth/google/callback', async (req, res) => {
    const {code} = req.query;
    try{
        if(!code){
            return res.status(404).json({message: 'Authorization code was not provided'});
        }

        const tokenResponse = await axios.post(`https://oauth2.googleapis.com/token`, {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            redirect_uri: `http://localhost:4000/auth/google/callback`,
            grant_type: 'authorization_code'
        }, {headers: {"Content-Type": "application/x-www-form-urlencoded"}})

        res.cookie('access_token', tokenResponse.data.access_token);
        res.redirect(`${process.env.FRONTEND_BASE_URL}/v1/profile/google`)
    }catch(err){
        res.status(500).json({message: err.message});
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
