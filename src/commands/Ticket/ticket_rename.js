import { ChannelType } from 'discord.js';
import { getTicketData, saveTicketData } from '../../utils/database.js';
import { logTicketEvent } from '../../utils/ticket/ticketLogging.js';
import { createError, ErrorTypes } from '../../utils/errorHandler.js';

const MAX_TICKET_NAME_LENGTH = 90;

export async function renameTicketChannel(interaction, newName) {
  if (!interaction.inGuild() || !interaction.channel) {
    throw createError(
      'Ticket rename outside guild',
      ErrorTypes.VALIDATION,
      'This action can only be used in a server.',
    );
  }

  if (interaction.channel.type !== ChannelType.GuildText) {
    throw createError(
      'Invalid ticket channel type',
      ErrorTypes.VALIDATION,
      'This action can only be used in a text ticket channel.',
    );
  }

  const ticketData = await getTicketData(interaction.guildId, interaction.channel.id);
  if (!ticketData) {
    throw createError(
      'Not a ticket channel',
      ErrorTypes.VALIDATION,
      'This is not a valid ticket channel.',
    );
  }

  const cleanedName = String(newName || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_ ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanedName) {
    throw createError(
      'Invalid ticket name',
      ErrorTypes.VALIDATION,
      'The ticket name must contain letters or numbers.',
    );
  }

  if (cleanedName.length > MAX_TICKET_NAME_LENGTH) {
    throw createError(
      'Ticket name too long',
      ErrorTypes.VALIDATION,
      `The ticket name must be ${MAX_TICKET_NAME_LENGTH} characters or fewer.`,
    );
  }

  const oldName = interaction.channel.name;
  await interaction.channel.setName(cleanedName, `Ticket renamed by ${interaction.user.tag}`);

  ticketData.name = cleanedName;
  ticketData.renamedFrom = oldName;
  ticketData.renamedBy = interaction.user.id;
  ticketData.renamedAt = new Date().toISOString();
  await saveTicketData(interaction.guildId, interaction.channel.id, ticketData);

  await logTicketEvent({
    client: interaction.client,
    guildId: interaction.guildId,
    event: {
      type: 'rename',
      ticketId: interaction.channel.id,
      ticketNumber: ticketData.id,
      userId: ticketData.userId,
      executorId: interaction.user.id,
      metadata: {
        oldName,
        newName: cleanedName,
      },
    },
  });

  return { ticketData, oldName, newName: cleanedName };
}

// The actual /ticket rename command lives in ticket.js because Discord
// requires all /ticket subcommands to be registered on the same command.
