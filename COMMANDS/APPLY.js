const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const q = require('../questions.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Start an application process'),

  async execute(interaction) {
    const { user, client } = interaction;

    function EachEmbed(contentIndex) {
      const dmEmb = new EmbedBuilder()
        .setTitle(contentIndex)
        .setColor('Random')
        .setFooter({ text: 'Not replying will cancel the application' });

      return dmEmb;
    }

    const answers = [];
    const questions = Object.values(q);

    const startedApp = new EmbedBuilder()
      .setTitle("🔱 **Application Forwarded**")
      .setDescription('in applicant `DM` box.')
      .addFields({ name: 'Status', value: 'Applying...' })
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setThumbnail('https://miro.medium.com/max/1600/1*e_Loq49BI4WmN7o9ItTADg.gif')
      .setFooter({ text: 'Application has been started in Direct Messages (DM)...' })
      .setColor("Random");

    await interaction.reply({ embeds: [startedApp], ephemeral: true });

    const dmStartApp = new EmbedBuilder()
      .setTitle("📤 **Let's begin the application**")
      .setDescription('> Answer the questions below as sent')
      .setColor("Random");

    let appChannel = await user.send({ embeds: [dmStartApp] });

    for (let index = 0; index < questions.length; index++) {
      await user.send({ embeds: [EachEmbed(questions[index])] });
      let answer = await appChannel.channel.awaitMessages({
        filter: msg => msg.author.id === user.id,
        max: 1,
        time: 300000,
        errors: ['time']
      }).catch(() => {
        user.send('You did not answer in time, application cancelled.');
        throw new Error('User did not answer in time.');
      });
      answers[index] = answer.first().content;
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${user.username}'s Application`, iconURL: user.displayAvatarURL() })
      .setFooter({ text: `Tag: ${user.tag} | ID: ${user.id}` })
      .setColor('Random');

    questions.forEach((q, i) => {
      embed.addFields({ name: q, value: answers[i] });
    });

    const appLogs = client.channels.cache.get(config.LOG_CHANNEL);
    if (!appLogs) return console.error("[WARNING]: Log channel not set or invalid.");
    await appLogs.send({ embeds: [embed] });

    const finishedApp = new EmbedBuilder()
      .setTitle("✅ **Application Forwarded**")
      .setDescription('to `application-logs` of server.')
      .addFields({ name: 'Status', value: 'Applied!' })
      .setThumbnail('https://i.pinimg.com/originals/98/64/9a/98649add72e05e3cc1b8ae0e6f553c8e.gif')
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setFooter({ text: 'You will be notified soon.' })
      .setColor("Random");

    await interaction.followUp({ embeds: [finishedApp], ephemeral: true });

    const appFinishDM = new EmbedBuilder()
      .setTitle("✅ **Application has been sent!**")
      .setDescription('Please be patient while your application is reviewed by staff')
      .setThumbnail('https://i.pinimg.com/originals/98/64/9a/98649add72e05e3cc1b8ae0e6f553c8e.gif')
      .setFooter({ text: 'Good luck!' })
      .setColor("Random");

    await user.send({ embeds: [appFinishDM] });
  }
};
