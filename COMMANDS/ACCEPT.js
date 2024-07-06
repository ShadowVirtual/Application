const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('accept')
    .setDescription('Accept an application')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to accept')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('response')
        .setDescription('Response message')
        .setRequired(true)),

  async execute(interaction) {
    const { user: messageAuthor, member: messageMember, guild, options } = interaction;

    const errNoPermsReview = new EmbedBuilder()
      .setTitle("🔒  **Access Denied** ")
      .setAuthor({ name: messageAuthor.username, iconURL: messageAuthor.displayAvatarURL() })
      .setFooter({ text: "Reviewer Role is required to review applications!" })
      .setColor("Random");

    if (!messageMember.roles.cache.some(r => r.id === config.REVIEWER_ID)) {
      return interaction.reply({ embeds: [errNoPermsReview], ephemeral: true });
    }

    const dUser = options.getUser('user');
    const dMessage = options.getString('response');

    if (!dUser) {
      return interaction.reply({ content: "Mention someone to accept!", ephemeral: true });
    }

    if (dMessage.length < 1) {
      const noRespMsg = new EmbedBuilder()
        .setTitle('📛 **Error**')
        .setDescription('Please write a response message')
        .setFooter({ text: 'USAGE: /accept [user] [response]' })
        .setColor("Random");

      return interaction.reply({ embeds: [noRespMsg], ephemeral: true });
    }

    const acceptUSER = new EmbedBuilder()
      .setTitle('**Congratulations!**')
      .setDescription(`You got a response from application in [${guild.name}]`)
      .addFields(
        { name: 'Status:', value: 'Accepted' },
        { name: 'Accepted by:', value: `${messageAuthor}` },
        { name: 'Response Message:', value: `${dMessage}` }
      )
      .setFooter({ text: "Contact the staff for more details" })
      .setColor("Random");

    await dUser.send({ embeds: [acceptUSER] });

    const acceptConfirm = new EmbedBuilder()
      .setTitle('**Applicant Accepted**')
      .setDescription(`You can check your inbox, ${dUser}!`)
      .setColor("Random");

    await interaction.reply({ embeds: [acceptConfirm] });
  }
};
