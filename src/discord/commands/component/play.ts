import { ConvertSnowflakeToDate, CreateInteractionResponse } from "@/discord/discordUtils";
import { convertDecodeBoard, convertEncodeBoard, getNextMove, isBoardFull, isWinningBoard } from "@/discord/tictactoeNextMove";
import { APIComponentInContainer, APIInteractionResponse, APIMessageComponentButtonInteraction, ButtonStyle, ComponentType, InteractionResponseType, MessageFlags } from "discord-api-types/v10";
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
    if (
        !interaction.message.components ||
        interaction.message.components[0].type !== ComponentType.Container ||
        interaction.message.components[0].components[2].type !== ComponentType.ActionRow ||
        interaction.message.components[0].components[2].components.length !== 3 ||
        interaction.message.components[0].components[2].components.some(component => component.type !== ComponentType.Button) ||
        interaction.message.components[0].components[3].type !== ComponentType.ActionRow ||
        interaction.message.components[0].components[3].components.length !== 3 ||
        interaction.message.components[0].components[3].components.some(component => component.type !== ComponentType.Button) ||
        interaction.message.components[0].components[4].type !== ComponentType.ActionRow ||
        interaction.message.components[0].components[4].components.length !== 3 ||
        interaction.message.components[0].components[4].components.some(component => component.type !== ComponentType.Button)
    ) {
        await CreateInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: "Invalid message components",
                flags: MessageFlags.Ephemeral,
            }
        });
        return NextResponse.json(
            { success: false, error: "Invalid message components" },
            { status: 400 }
        );
    }

    const params = interaction.data.custom_id.split("-");
    if (params.length === 4 && params[3] === "disabled") {
        await CreateInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: "You cannot play here!",
                flags: MessageFlags.Ephemeral,
            }
        });
        return NextResponse.json(
            { success: false, error: "You cannot play here" },
            { status: 400 }
        );
    }

    const boardState = parseInt(params[2]);
    if (isNaN(boardState) || boardState < 0 || boardState > convertEncodeBoard("222222222")) {
        await CreateInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: "Invalid board state",
                flags: MessageFlags.Ephemeral,
            }
        });
        return NextResponse.json(
            { success: false, error: "Invalid board state" },
            { status: 400 }
        );
    }
    
    // await CreateInteractionResponse(interaction.id, interaction.token, {
    //     type: InteractionResponseType.DeferredChannelMessageWithSource,
    // });

    const board = convertDecodeBoard(boardState);
    const newBoardTemp = board.substring(0, parseInt(params[1])) + '1' + board.substring(parseInt(params[1]) + 1);
    if (isBoardFull(newBoardTemp)) {
        await CreateInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: interaction.message.components.map((component) => {
                    if (component.type !== ComponentType.Container) return component;
                    return {
                        ...component,
                        components: component.components.map((childComponent) => {
                            if (childComponent.type !== ComponentType.ActionRow) return childComponent;
                            return {
                                ...childComponent,
                                components: childComponent.components.map((grandchildComponent) => {
                                    if (grandchildComponent.type !== ComponentType.Button) return grandchildComponent;
                                    return {
                                        ...grandchildComponent,
                                        disabled: true,
                                    };
                                }),
                            };
                        }),
                    };
                })
            }
        });
        return NextResponse.json(
            { success: false, error: "The board is full" },
            { status: 400 }
        );
    }

    const nextMove = getNextMove(newBoardTemp, '2');
    if (newBoardTemp[nextMove] !== '0') {
        await CreateInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `The computer move ${nextMove} is invalid! (board state: ${newBoardTemp})`,
                flags: MessageFlags.Ephemeral,
            }
        });
        return NextResponse.json(
            { success: false, error: `The computer move ${nextMove} is invalid` },
            { status: 400 }
        );
    }

    const newBoard = newBoardTemp.substring(0, nextMove) + '2' + newBoardTemp.substring(nextMove + 1);
    if (isWinningBoard(newBoard, '2')) {
        await CreateInteractionResponse(interaction.id, interaction.token, {
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: interaction.message.components.map((component) => {
                    if (component.type !== ComponentType.Container) return component;
                    return {
                        type: ComponentType.Container,
                        accent_color: 0x999999,
                        components: component.components.map((childComponent) => {
                            if (childComponent.type !== ComponentType.ActionRow) return childComponent;
                            return {
                                ...childComponent,
                                components: childComponent.components.map((grandchildComponent) => {
                                    if (grandchildComponent.type !== ComponentType.Button) return grandchildComponent;
                                    return {
                                        ...grandchildComponent,
                                        disabled: true,
                                    };
                                }),
                            };
                        }),
                    };
                })
            }
        })
    }

    const newBoardState = convertEncodeBoard(newBoard);

    const timestamp = ConvertSnowflakeToDate(interaction.id);

    await CreateInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseType.UpdateMessage,
        data: {
            flags: MessageFlags.IsComponentsV2,
            components: [
                {
                    type: ComponentType.Container,
                    accent_color: 0x999999,
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
                                    label: newBoard[0] === '1' ? "X" : newBoard[0] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-0-${newBoardState}${newBoard[0] !== '0' ? "-disabled" : ""}`,
                                },
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[1] === '1' ? "X" : newBoard[1] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-1-${newBoardState}${newBoard[1] !== '0' ? "-disabled" : ""}`,
                                },
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[2] === '1' ? "X" : newBoard[2] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-2-${newBoardState}${newBoard[2] !== '0' ? "-disabled" : ""}`,
                                },
                            ]
                        },
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[3] === '1' ? "X" : newBoard[3] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-3-${newBoardState}${newBoard[3] !== '0' ? "-disabled" : ""}`,
                                },
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[4] === '1' ? "X" : newBoard[4] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-4-${newBoardState}${newBoard[4] !== '0' ? "-disabled" : ""}`,
                                },
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[5] === '1' ? "X" : newBoard[5] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-5-${newBoardState}${newBoard[5] !== '0' ? "-disabled" : ""}`,
                                },
                            ]
                        },
                        {
                            type: ComponentType.ActionRow,
                            components: [
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[6] === '1' ? "X" : newBoard[6] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-6-${newBoardState}${newBoard[6] !== '0' ? "-disabled" : ""}`,
                                },
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[7] === '1' ? "X" : newBoard[7] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-7-${newBoardState}${newBoard[7] !== '0' ? "-disabled" : ""}`,
                                },
                                {
                                    type: ComponentType.Button,
                                    label: newBoard[8] === '1' ? "X" : newBoard[8] === '2' ? "O" : "\u200b",
                                    style: ButtonStyle.Secondary,
                                    custom_id: `play-8-${newBoardState}${newBoard[8] !== '0' ? "-disabled" : ""}`,
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
        }
    });


    return NextResponse.json(
        { success: false },
        { status: 200 }
    );
}