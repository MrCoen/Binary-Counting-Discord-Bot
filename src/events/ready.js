exports.run = (client) => {
    
    client.user.setActivity("αManager.exe",{
        type:"PLAYING",
    })
    console.log(`${client.user.tag} is ready`);
}