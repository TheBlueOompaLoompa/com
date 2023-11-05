import HomeAssistant from "./homeassistant";
import config from './config';
import { Message } from "./types";
import Commands from "./commands";

const ha = new HomeAssistant(process.env.HASS_URL as string, process.env.HASS_TOKEN as string);
const commands = new Commands(ha);

const states = await ha.states.list();

let lightIds: string[] = [];

states.map(val => {
    if(val['entity_id'].startsWith('light')) lightIds.push(val['entity_id'])
})

const log = Bun.file('log.json');

function getSystemPrompt() {
    return `You are a house assistant, you are able to control different appliances, lights, and other things of that nature.
    You can control devices through commands specified below:
    "*set DEVICE_ID on|off" - used to turn lights on and off

    To use a command, make sure you only type out the command in the correct format, no confirming you are doing anything or any other sort of message.
    This will only be used to control the computer, it has to be perfect for the computer to read it properly.
    Your output is being fed back into the computer, make sure to only respond with the command, nothing else.
    You are not recommending commands to the user as your messages are being fed into a terminal when proper formatting is detected

    List of light ids:
    ${lightIds.join('\n')}
    `;
}

let messages: Message[] = await log.exists() ? await log.json() : [{
    role: 'system',
    content: getSystemPrompt(),
    context: []
}];

async function prompt(userPrompt: string) {
    messages[0] = {
        role: 'system',
        content: getSystemPrompt(),
        context: []
    }

    messages.push({
        role: 'user',
        content: userPrompt,
        context: []
    })

    const res = await fetch(`${config.url}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/event-stream'
        },
        body: JSON.stringify({
            model: config.model,
            prompt: userPrompt,
            system: messages[0].content,
            stream: false,
            context:
                messages.length > 3 && messages.at(-2).context != undefined
                    ? messages.at(-2).context
                    : undefined
        })
    });

    const data = await res.json();
    console.log(`User: ${userPrompt}\nAssistant: ${data.response}\n`);

    const msg = {
        role: 'assistant',
        content: data.response,
        context: data.context
    };

    await commands.processMessage(msg);

    messages.push(msg);
}

await prompt("Turn off the fan lights");
await prompt("Turn on the workspace light");

await Bun.write(log, JSON.stringify(messages));