import { CreateInteractionResponse } from "@/discord/discordUtils";
import { APIInteractionResponse, APIMessageComponentButtonInteraction, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { NextResponse } from "next/server";

export default async function(
    interaction: APIMessageComponentButtonInteraction
): Promise<
    NextResponse<
        {
            success: boolean;
            error?: string;
        } | APIInteractionResponse
    >
> {
    await CreateInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: "o/",
            flags: MessageFlags.Ephemeral,
        }
    });
    return NextResponse.json(
        { success: false, error: "Not implemented" },
        { status: 501 }
    );
}