import { ChannelType } from 'discord.js';
import { getGuildConfig, setGuildConfig } from '../../services/config/guildConfig.js';
import { createError, ErrorTypes } from '../../utils/errorHandler.js';

export async function configureClosedTicketRedirect(interaction, client, category) {
  if (!category || category.type !== ChannelType.GuildCategory) {
    throw createError(
      'Invalid closed-ticket redirect',
      ErrorTypes.VALIDATION,
      'The closed-ticket redirect must be a server category. Discord cannot move a channel inside another text channel.',
    );
  }

  const config = await getGuildConfig(client, interaction.guildId);
  config.ticketClosedRedirectChannelId = category.id;

  await setGuildConfig(client, interaction.guildId, config);

  return category;
}

// The actual /ticket redirconfig command lives in ticket.js because Discord
// requires all /ticket subcommands to be registered on the same command.
