import { Snowflake } from "discord-api-types/globals";
import { RESTPutAPIApplicationCommandsJSONBody, Routes, RESTPutAPIApplicationCommandsResult, RouteBases, RESTPostAPIInteractionCallbackWithResponseResult, RESTPostAPIInteractionCallbackJSONBody, RESTPatchAPIWebhookWithTokenMessageJSONBody, RESTPatchAPIWebhookWithTokenMessageResult } from "discord-api-types/v10";

export const DISCORD_EPOCH = 1420070400000;

/**
 * Converts a snowflake ID string into a JS Date object using the provided epoch (in ms), or Discord's epoch if not provided
 * @param {Snowflake} snowflake The snowflake ID to convert
 * @param {number} [epoch=DISCORD_EPOCH] The epoch to use when converting the snowflake
 * @returns {Date} The Date object equivalent to the given snowflake ID
 */
export function ConvertSnowflakeToDate(snowflake: Snowflake, epoch: number = DISCORD_EPOCH): Date {
	// Convert snowflake to BigInt to extract timestamp bits
	// https://discord.com/developers/docs/reference#snowflakes
	const milliseconds = BigInt(snowflake) >> BigInt(22);
	return new Date(Number(milliseconds) + epoch);
}

/**
 * Installs the given global application commands to the Discord API.
 * If the request fails due to rate limiting, this function will retry after the specified delay.
 * If the request fails for any other reason, this function will throw an error.
 * @param {RESTPutAPIApplicationCommandsJSONBody} commands The global application commands to install
 * @param {number} [retryCount=0] The number of times to retry the request after encountering a rate limit
 * @returns {Promise<RESTPutAPIApplicationCommandsResult | undefined>} A promise that resolves to the result of the Discord API request, or undefined if the request fails after retrying
 */
export async function InstallGlobalCommands(
    commands: RESTPutAPIApplicationCommandsJSONBody,
    retryCount: number = 0
): Promise<RESTPutAPIApplicationCommandsResult | undefined> {
    if (!process.env.DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not defined');
    if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is not defined');

    if (retryCount > 5) return;
    
    const endpoint = Routes.applicationCommands(process.env.DISCORD_CLIENT_ID);
    const url = RouteBases.api + endpoint;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(commands),
    });

    let data: RESTPutAPIApplicationCommandsResult;
    try {
        data = await res.json() as RESTPutAPIApplicationCommandsResult;
    } catch (err) {
        console.error("InstallGlobalCommands Error", JSON.stringify(err, null, 2));
        console.error("InstallGlobalCommands res", res);
        throw new Error('Failed to parse Discord API response as JSON');
    }
    
    if (!res.ok) {
        if (res.status === 429) {
            const retryAfter = res.headers.get('retry-after');
            if (retryAfter && !isNaN(Number(retryAfter))) {
                await new Promise(resolve => setTimeout(resolve, Number(retryAfter) * 1000));
                return await InstallGlobalCommands(commands, retryCount + 1);
            }
        }
        console.error("InstallGlobalCommands Data", JSON.stringify(data, null, 2));
    }

    return data;
}

/**
 * Creates a Discord API interaction response.
 * @param {Snowflake} id The ID of the interaction to respond to
 * @param {Snowflake} token The token of the interaction to respond to
 * @param {RESTPostAPIInteractionCallbackJSONBody} messageData The data to send in the response
 * @returns {Promise<RESTPostAPIInteractionCallbackWithResponseResult | undefined>} A promise that resolves to the result of the Discord API request, or undefined if the request fails after retrying
 */
export async function CreateInteractionResponse(
    id: Snowflake,
    token: Snowflake,
    messageData: RESTPostAPIInteractionCallbackJSONBody
): Promise<RESTPostAPIInteractionCallbackWithResponseResult | undefined> {
    if (!process.env.DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not defined');
    if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is not defined');

    const endpoint = Routes.interactionCallback(id, token);
    const url = RouteBases.api + endpoint;

    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(messageData));

    const res = await fetch(url, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
        method: 'POST',
        body: formData,
    });

    if (res.status === 204) return;

    let data;
    try {
        data = await res.json() as RESTPostAPIInteractionCallbackWithResponseResult;
    } catch (err) {
        console.error("CreateInteractionResponse Error", JSON.stringify(err, null, 2));
        console.error("CreateInteractionResponse res", res);
        console.error("CreateInteractionResponse messageData", JSON.stringify(messageData, null, 2));
        throw new Error('Failed to parse Discord API response as JSON');
    }
    
    if (!res.ok) {
        if (res.status === 429) {
            const retryAfter = res.headers.get('retry-after');
            if (retryAfter && !isNaN(Number(retryAfter))) {
                await new Promise(resolve => setTimeout(resolve, Number(retryAfter) * 1000));
                return await CreateInteractionResponse(id, token, messageData);
            }
        }
        console.error("CreateInteractionResponse Data", JSON.stringify(data, null, 2));
        console.error("CreateInteractionResponse messageData", JSON.stringify(messageData, null, 2));
    }

    return data;
}

/**
 * Sends a follow-up message to Discord.
 * @param {Snowflake} token The ID of the interaction to follow up to.
 * @param {RESTPatchAPIWebhookWithTokenMessageJSONBody} messageData The message data to send.
 * @param {{ id: number, url: string, filename: string }[] | null} [attachmentURLs] The attachment URLs to send.
 * @param {boolean} [isComponentV2=false] Whether the message should be sent as a component v2 message.
 * @returns {Promise<RESTPatchAPIWebhookWithTokenMessageResult | undefined>} A promise that resolves to the result of the Discord API request, or undefined if the request fails.
 */
export async function FollowupMessage(
    token: Snowflake,
    messageData: RESTPatchAPIWebhookWithTokenMessageJSONBody,
    attachmentURLs?: {
        id: number,
        url: string,
        filename: string
    }[] | null,
    isComponentV2: boolean = false
): Promise<RESTPatchAPIWebhookWithTokenMessageResult | undefined> {
    if (!process.env.DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not defined');
    if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is not defined');

    const endpoint = Routes.webhookMessage(process.env.DISCORD_CLIENT_ID, token, "@original");
    const url = RouteBases.api + endpoint + (isComponentV2 ? '?with_components=true' : '');

    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(messageData));
    if (attachmentURLs) {
        await Promise.all(attachmentURLs.map(async (attachment) => {
            const blob = await fetch(attachment.url).then(res => res.blob());
            formData.append(`files[${attachment.id}]`, blob, attachment.filename);
        }));
    }

    const res = await fetch(url, {
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
        method: 'PATCH',
        body: formData,
    });

    let data;
    try {
        data = await res.json() as RESTPatchAPIWebhookWithTokenMessageResult;
    } catch (err) {
        console.error("FollowupMessage Error", JSON.stringify(err, null, 2));
        console.error("FollowupMessage res", res);
        console.error("FollowupMessage messageData", JSON.stringify(messageData, null, 2));
        throw new Error('Failed to parse Discord API response as JSON');
    }
    
    if (!res.ok) {
        if (res.status === 429) {
            const retryAfter = res.headers.get('retry-after');
            console.log('FollowupMessage Retrying', retryAfter);
            if (retryAfter && !isNaN(Number(retryAfter))) {
                await new Promise(res => setTimeout(res, Number(retryAfter) * 1000));
                return await FollowupMessage(token, messageData, attachmentURLs, isComponentV2);
            }
        }
        console.error("FollowupMessage Data", JSON.stringify(data, null, 2));
        console.error("FollowupMessage messageData", JSON.stringify(messageData, null, 2));
    }

    return data;
}
