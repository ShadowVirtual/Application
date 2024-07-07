const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const fs = require('fs');
const path = require('path');

// Path to the file that stores accepted users
const acceptedUsersFilePath = path.join(__dirname, '../acceptedUsers.json');

// Ensure the acceptedUsers.json file exists, create it if it doesn't
if (!fs.existsSync(acceptedUsersFilePath)) {
  fs.writeFileSync(acceptedUsersFilePath, JSON.stringify([]));
}

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

    // Load accepted users
    const acceptedUsers = JSON.parse(fs.readFileSync(acceptedUsersFilePath));

    // Check if the user is already accepted
    if (acceptedUsers.includes(dUser.id)) {
      const alreadyAccepted = new EmbedBuilder()
        .setTitle('📛 **Error**')
        .setDescription('This user has already been accepted.')
        .setColor("Random");

      return interaction.reply({ embeds: [alreadyAccepted], ephemeral: true });
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

    await interaction.reply({ embeds: [acceptConfirm], ephemeral: true });

    // Add the user to the accepted users list and save
    acceptedUsers.push(dUser.id);
    fs.writeFileSync(acceptedUsersFilePath, JSON.stringify(acceptedUsers, null, 2));
  }
};
