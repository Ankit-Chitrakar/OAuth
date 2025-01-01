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
        console.log('Code received from GitHub:', req.query.code);
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
