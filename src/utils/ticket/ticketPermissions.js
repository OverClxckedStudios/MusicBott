import { PermissionFlagsBits } from 'discord.js';
import { getGuildConfig } from '../../services/config/guildConfig.js';
import { getTicketData } from '../database.js';

export const TICKET_TIER_1_ROLE_ID = '1541110583108173905';
export const TICKET_TIER_2_ROLE_ID = '1541110042307076206';

export async function getTicketPermissionContext({ client, interaction }) {
  const guildId = interaction.guildId;
  const channelId = interaction.channelId;

  const [config, ticketData] = await Promise.all([
    getGuildConfig(client, guildId),
    getTicketData(guildId, channelId),
  ]);

  const member = interaction.member;
  const permissions = member?.permissions;
  const roles = member?.roles?.cache;

  const hasManageChannels = Boolean(
    permissions?.has?.(PermissionFlagsBits.ManageChannels),
  );

  const tier1RoleId = config.ticketTier1RoleId || TICKET_TIER_1_ROLE_ID;
  const tier2RoleId = config.ticketTier2RoleId || TICKET_TIER_2_ROLE_ID;

  const isTier2 = Boolean(tier2RoleId && roles?.has?.(tier2RoleId));
  const isTier1 = Boolean(
    isTier2 || (tier1RoleId && roles?.has?.(tier1RoleId)),
  );

  const staffRoleId = config.ticketStaffRoleId || null;
  const hasTicketStaffRole = Boolean(
    staffRoleId && roles?.has?.(staffRoleId),
  );

  const isTicketCreator = Boolean(
    ticketData?.userId &&
    String(ticketData.userId) === String(interaction.user.id),
  );

  // Tiered moderation is deliberately separate from Discord Manage Channels.
  // This prevents a generic Manage Channels permission from bypassing the
  // requested Tier 1/Tier 2 hierarchy.
  return {
    config,
    ticketData,
    hasManageChannels,
    hasTicketStaffRole,
    isTicketCreator,
    isTier1,
    isTier2,

    // Existing ticket-management actions.
    canManageTicket: hasManageChannels || hasTicketStaffRole,

    // Tiered moderation actions.
    canCloseTicket: isTier1,
    canRenameTicket: isTier1,
    canReopenTicket: isTier1,
    canUnclaimTicket: isTier1,
    canDeleteTicket: isTier2,

    // Claim/priority/pin retain the existing staff-management behaviour.
    canClaimTicket: hasManageChannels || hasTicketStaffRole || isTier1,
    canChangePriority: hasManageChannels || hasTicketStaffRole || isTier1,
    canPinTicket: hasManageChannels || hasTicketStaffRole || isTier1,
  };
}

export function getTierLabel(context) {
  if (context?.isTier2) return 'Tier 2';
  if (context?.isTier1) return 'Tier 1';
  return 'No ticket moderation tier';
}
