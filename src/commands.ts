import HomeAssistant from "./homeassistant";
import { Message } from "./types";

export default class Commands {
    private ha: HomeAssistant

    constructor(ha: HomeAssistant) {
        this.ha = ha;
    }

    async processMessage(msg: Message) {
        console.log(msg.content.split(' '))
        const params = msg.content.split(' ');
        switch(params[0]) {
            case 'set':
                console.log(await this.ha.services.call(params[1], params[2] == 'on' ? 'turn_on' : 'turn_off'));
                break;
        }
    }
}