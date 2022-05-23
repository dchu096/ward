// Packages
const { Client, Intents, Discord, message } = require('discord.js');
const { Signale } = require('signale');
const pool = require('./pool');
const { MessageActionRow, MessageButton, MessageEmbed, Interactions } = require('discord.js');
// Config
const config = require('./config.json');
const moment = require("moment");
const os = require('os');
const cpuStat = require("cpu-stat");

// Variables
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
});
const logger = new Signale({ scope: 'Discord' });
const prefix = config.discord['prefix'];






// Function to start the Discord bot
function main() {

    console.log("\n")
    console.log(`    :::       :::    :::    ::::::::: ::::::::: ::::::::::::::    ::: `)
    console.log(`   :+:       :+:  :+: :+:  :+:    :+::+:    :+::+:       :+:+:   :+:  `)
    console.log(`  +:+       +:+ +:+   +:+ +:+    +:++:+    +:++:+       :+:+:+  +:+   `)
    console.log(` +#+  +:+  +#++#++:++#++:+#++:++#: +#+    +:++#++:++#  +#+ +:+ +#+    `)
    console.log(`+#+ +#+#+ +#++#+     +#++#+    +#++#+    +#++#+       +#+  +#+#+#     `)
    console.log(`#+#+# #+#+# #+#     #+##+#    #+##+#    #+##+#       #+#   #+#+#      `)
    console.log(`###   ###  ###     ######    ############ #############    #### `)

    client.login(config.discord.token).catch(() => {
        logger.fatal('Intents not enabled.');
        process.exit(0);
    }).then(() => {
        logger.success(`Successfully logged into ${client.user.username}`);
    });
}

// New Status
client.on('ready', () => {
    const status = config.discord['status'];
    client.user.setActivity(status, {type: 'WATCHING'});
    logger.success('Successfully set the status');
});

// Commands


client.on("messageCreate", async (message) => {

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Exit and stop if the prefix is not there or if user is a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if(command === "ping"){

        const pingembed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${client.user.username} Ping`)
            .addField(`Latency:`, ` ${Date.now() - message.createdTimestamp}ms.`, false)
            .addField(`API Latency:`, `${Math.round(client.ws.ping)}ms.`, false)

        message.channel.send({ embeds: [pingembed] });
    }

    if(command === "help"){

        const pingembed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${client.user.username} Help`)
            .setDescription(`HR Warden is Hosting Remade's verify bot`)
            .addField(`Commands`, `HR Warden Commands`, false)
            .addField(`${prefix}help`, `List all the commands the bot have`, false)
            .addField(`${prefix}ping`, `List the ping of the bot`, false)
            .addField(`${prefix}system`, `List the sys info of the bot`, false)
            .addField(`${prefix}verify`, `Verify yourself (if you havnt)`, false)
            .addField(`${prefix}eval`, `[owner] Evaulate a code`, false)

        message.channel.send({ embeds: [pingembed] });
    }

    const clean = async (text) => {
        if (text && text.constructor.name == "Promise")
            text = await text;

        if (typeof text !== "string")
            text = require("util").inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));

        return text;
    }

    if(command === "system"){

        let { version } = require("discord.js");

        cpuStat.usagePercent(function(err, percent, seconds) {
            if (err) {
                return console.log(err);
            }

            let secs = Math.floor(message.client.uptime % 60);
            let days = Math.floor((message.client.uptime % 31536000) / 86400);
            let hours = Math.floor((message.client.uptime / 3600) % 24);
            let mins = Math.floor((message.client.uptime / 60) % 60);

            //let duration = moment.duration(bot.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
            let embedStats = new MessageEmbed()
                .setTitle("System Stats")
                .setColor("#87CEEB")
                .addField("• CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
                .addField("• CPU usage", `\`${percent.toFixed(2)}%\``,true)
                .addField("• Mem Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
                .addField("• Average Loads", `\`${os.loadavg()}\``,true)
                .addField("• Uptime ", `${days}d ${hours}h ${mins}m ${secs}s`, false) //`${duration}`, true)
                .addField("• Platform", `\`\`${os.platform()}\`\``,true)
                .addField("• Arch", `\`${os.arch()}\``,true)
                .addField("• Discord.js", `v${version}`, true)
                // .addField("• Node", `${process.version}`, true)
                .setFooter("Thats the OS that the bot runs on!")

            message.channel.send({ embeds: [embedStats] }).catch(O_o => {});
        })
    }

    if(command === "eval"){

        const args2 = message.content.split(" ").slice(1);

        const deniedembed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Error`)
            .setDescription(`You are not allowed to access this command`)


        if (message.author.id !== '420839496263925767') {
            message.channel.send({ embeds: [deniedembed] });
        }

        try {
            // Evaluate (execute) our input
            const evaled = eval(args2.join(" "));

            // Put our eval result through the function
            // we defined above
            const cleaned = await clean(evaled);

            // Reply in the channel with our result
            message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
        } catch (err) {
            // Reply in the channel with our error
            message.channel.send(`\`ERROR\` \`\`\`xl\n${cleaned}\n\`\`\``);
        }


    }

    if(command === "verify"){
        if (message.member.roles.cache.has(config.discord['verified-role-id'])) {

            const verifiedembed = new MessageEmbed()
                .setColor('#0099ff')
                .setDescription(`You are already verified. No need to do it again!`);

            await message.reply({ embeds: [verifiedembed] })
            return;
        } else {
            message.channel.send('Please check your DMS!')
            const linkID = pool.createLink(message.author.id);
            const embed2 = new MessageEmbed()
                .setTitle('HostingRemade Verification')
                .setDescription(`${config.https ? 'https://' : 'http://'}${config.domain}/verify/${linkID}`)
                .setColor('BLUE');
            client.channels.cache.get('897370981578969138').send(`Hello ${message.member.user.tag}, welcome to HostingRemade! To participate in this server, you must verify your account. I have sent you a DM with the verification link, link will expire in 15 minutes.`)
                .then(message.author.send({ embeds: [embed2] })).catch(() => {
                client.channels.cache.get('897370981578969138').send(`${message.member.user.tag}, i am unable to send DMs to you. Please make sure you have DMs enabled and retry this command.`);
            });
        }

    }
});

// Events
// Send user the captcha when they join the server
client.on('guildMemberAdd', member => {
    if (member.user.bot) return;
    const linkID = pool.createLink(member.id);
    const embed = new MessageEmbed()
        .setTitle('Hostingremade Verification')
        .setDescription(`${config.https ? 'https://' : 'http://'}${config.domain}/verify/${linkID}`)
        .setColor('BLUE');
    try {
        client.channels.cache.get('897370981578969138').send(`Hello ${member.user.tag}, welcome to HostingRemade! To participate in this server, you must verify your account. I have sent you a DM with the verification link, link will expire in 15 minutes.`)
            .then(member.send({ embeds: [embed] }))
    } catch (err) {
        client.channels.cache.get('897370981578969138').send(`${member.user.tag}, i am unable to send DMs to you. Please make sure you have DMs enabled and retry ///verify`);
    }
});


// Add verified role to user
async function addRole(userID) {
    try {
        const guild = await client.guilds.fetch(config.discord['guild-id']);
        const role = await guild.roles.fetch(config.discord['verified-role-id']);
        const member = await guild.members.fetch(userID);
        member.roles.add(role).then(member.send(`You are now verified. If you still do not see the channels please DM a administrator.`)).catch(() => {
            logger.error(`Failed to add role to user!`);
            return;
        });

    } catch (e) {
        logger.error(e);
    }
}

// Remove another role from user.
async function removeRole(userID) {
    const ifremrole = config.discord['remove-role'];
    if (ifremrole == true) {
        try {
            const guild = await client.guilds.fetch(config.discord['guild-id']);
            const remrole = await guild.roles.fetch(config.discord['remove-role-id']);
            const member = await guild.members.fetch(userID);

            member.roles.remove(remrole).catch(() => {
                logger.error(`Failed to remove role to user ${member.user.tag}! (Maybe role is above bot role?)`);
                return;
            });
            logger.info(`Removed role to user ${member.user.tag}.`);
        } catch (e) {
            logger.error(`Failed to add role to user ${userID}!`);
        }
    } else {
        logger.info(`Remove role is set to false, step skipped.`)
    }
}

module.exports = {
    run: main,
    addRole,
    removeRole
}
