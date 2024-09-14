import { KLine, Ticker, Trade } from "./types";

export const BASE_URL = "wss://ws.backpack.exchange/"

export class SignalingManager {
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: any = {};
    private id: number;
    private initialized: boolean = false;

    private constructor() {
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    init() {
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        }
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data?.e;
            if (this.callbacks[type]) {
                //@ts-ignore
                this.callbacks[type].forEach(({ callback }) => {
                    if (type === "ticker") {
                        const x= parseFloat(message.data.c);
                        const y = parseFloat(message.data.o);
                        const pes = (x-y).toFixed(2);
                        const res = (((x-y)*100)/y).toFixed(2);
                        const bvol = parseFloat(message.data.v);
                        const pri = parseFloat(message.data.c);
                        const res1 = (bvol * pri).toFixed(2);
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: res1,
                            quoteVolume: message.data.V,
                            symbol: message.data.s,
                            priceChangePercent: res,
                            priceChange: pes,
                        }

                        callback(newTicker);
                   }
                   if( type === "trade")
                   {
                    const price = parseFloat(message.data.p);
                    const quantity = parseFloat(message.data.q);
                    const quoteQuantity = (price * quantity).toFixed(2);
                    const newTrade: Partial<Trade> = {
                         id: message.data.t,
                         isBuyerMaker: message.data.m,
                         price: message.data.p,
                         quantity: message.data.q,
                         quoteQuantity: quoteQuantity,
                         timestamp: message.data.T/1000
                    }
                    callback(newTrade)
                   }
                   if (type === "depth") {
                        // const newTicker: Partial<Ticker> = {
                        //     lastPrice: message.data.c,
                        //     high: message.data.h,
                        //     low: message.data.l,
                        //     volume: message.data.v,
                        //     quoteVolume: message.data.V,
                        //     symbol: message.data.s,
                        // }
                        // console.log(newTicker);
                        // callback(newTicker);
                        const updatedBids = message.data.b;
                        const updatedAsks = message.data.a;
                        callback({ bids: updatedBids, asks: updatedAsks });
                    }
                    if(type ==="kline")
                    {
                        const newKline: Partial<any> ={
                            close: message.data.c,
                            end: message.data.T,
                            high: message.data.h,
                            low: message.data.l,
                            open: message.data.o,
                            start: message.data.t,
                            trades: message.data.n,
                            volume: message.data.v,
                            newCandleInitiated: message.data.x,
                        }
                        callback(newKline);
                    }
                });
            }
        }
    }

    sendMessage(message: any) {
        const messageToSend = {
            ...message,
            id: this.id++
        }
        if (!this.initialized) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: any, id: string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
        // "ticker" => callback
    }

    async deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {
            //@ts-ignore
            const index = this.callbacks[type].findIndex(callback => callback.id === id );
            if (index !== -1) {
                this.callbacks[type].splice(index, 1);
            }
        }
    }
}