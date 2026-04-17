import { APIChatInputApplicationCommandInteraction, APIInteractionResponse, ApplicationCommandOptionType, ApplicationCommandType, ButtonStyle, ComponentType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { ConvertSnowflakeToDate, CreateInteractionResponse, FollowupMessage } from "../../discordUtils";
import { NextResponse } from "next/server";
import { MAIN_COLOUR } from "@/discord/utils";

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
                accent_color: MAIN_COLOUR,
                components: [
                    {
                        type: ComponentType.TextDisplay,
                        content: "## Tic Tac Toe (single player)!",
                    },
                    {
                        type: ComponentType.Separator
                    },
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-0-0",
                            },
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-1-0",
                            },
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-2-0",
                            },
                        ]
                    },
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-3-0",
                            },
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-4-0",
                            },
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-5-0",
                            },
                        ]
                    },
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-6-0",
                            },
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-7-0",
                            },
                            {
                                type: ComponentType.Button,
                                label: "\u200b",
                                style: ButtonStyle.Secondary,
                                custom_id: "play-8-0",
                            },
                        ]
                    },
                    {
                        type: ComponentType.Separator
                    },
                    {
                        type: ComponentType.TextDisplay,
                        content: `-# Response time: ${Date.now() - timestamp.getTime()}ms • <t:${Math.floor(Date.now() / 1000)}:F>`
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
    name: "play",
    description: "Initiate a game of Tic Tac Toe!",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "computer",
            description: "Play against the computer (single player)"
        }
    ]
}