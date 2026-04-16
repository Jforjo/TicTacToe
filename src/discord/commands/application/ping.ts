import { APIChatInputApplicationCommandInteraction, APIInteractionResponse, ApplicationCommandType, ComponentType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { ConvertSnowflakeToDate, CreateInteractionResponse, FollowupMessage } from "../../discordUtils";
import { NextResponse } from "next/server";

export default async function(
    interaction: APIChatInputApplicationCommandInteraction
): Promise<
    NextResponse<
        {
            success: boolean;
            error?: string;
        } | APIInteractionResponse
    >
> {
    // User sees the "[bot] is thinking..." message
    await CreateInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
    });

    const timestamp = ConvertSnowflakeToDate(interaction.id);

    await FollowupMessage(interaction.token, {
        flags: MessageFlags.IsComponentsV2,
        components: [
            {
                type: ComponentType.Container,
                accent_color: 0xFB9B00,
                components: [
                    {
                        type: ComponentType.TextDisplay,
                        content: "**Pong!**",
                    },
                    {
                        type: ComponentType.Separator
                    },
                    {
                        type: ComponentType.TextDisplay,
                        content: `Response time: ${Date.now() - timestamp.getTime()}ms • <t:${Math.floor(Date.now() / 1000)}:F>`
                    }
                ]
            }
        ],
    }, null, true);

    return NextResponse.json(
        { success: true },
        { status: 200 }
    );
}
export const CommandData = {
    name: "ping",
    description: "Pings the bot!",
    type: ApplicationCommandType.ChatInput,
}