export default class HomeAssistant {
    private url: string;
    private token: string;

    constructor(url: string, token: string) {
        this.url = url;
        this.token = token;
    }

    states = {
        list: async () => {
            return await this.homeFetch('GET', 'states');
        },
        get: async (entityId: string) => {
            return await this.homeFetch('GET', `states/${entityId}`);
        },
        set: async (entityId: string, body: any) => {
            return await this.homeFetch('POST', `states/${entityId}`, body)
        },
        update: async (entityId: string, body: any) => {
            const current = await (await this.states.get(entityId)).json();
            return await this.states.set(entityId, Object.assign(current, body));
        }
    }
    
    services = {
        call: async (entityId: string, service: any) => {
            return await this.homeFetch('POST', `services/${entityId.split('.')[0]}/${service}`, {
                entity_id: entityId
            });
        }
    }

    private async homeFetch(method: string, path: string, body: any | undefined = undefined) {
        let res = await fetch(`${this.url}/api/${path}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if(method == 'GET') return await res.json();
        return res;
    }
}