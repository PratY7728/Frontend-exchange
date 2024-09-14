"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker, getTrades } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";

export function Depth({ market }: { market: string }) {
    const [bids, setBids] = useState<[string, string][]>([]);
    const [asks, setAsks] = useState<[string, string][]>([]);
    const [price, setPrice] = useState<string>();

    useEffect(() => {
        let isComponentActive = true; // Flag to prevent setting state after unmounting
        // If you have asynchronous functions (like API calls) that are still in progress 
        // when the component unmounts or the market changesthey might resolve and update the state with old data
        // even after the component should have reset
        setBids([]);
        setAsks([]);
        setPrice(undefined);

        const signalingManager = SignalingManager.getInstance();

        // Fetch initial depth, ticker, and trades
        const fetchInitialData = async () => {
            try {
                const depthData = await getDepth(market);
                if (!isComponentActive) return;

                const initialBids = depthData.bids
                    .filter(([_, quantity]) => parseFloat(quantity) > 0)
                    .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA)); // Sort bids descending

                const initialAsks = depthData.asks
                    .filter(([_, quantity]) => parseFloat(quantity) > 0)
                    .sort(([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB)); // Sort asks ascending

                setBids(initialBids);
                setAsks(initialAsks);

                const tickerData = await getTicker(market);
                const tradesData = await getTrades(market);

                if (!isComponentActive) return;

                setPrice(tradesData[0].price || tickerData.lastPrice); // Set the latest price
            } catch (error) {
                console.error("Error fetching initial market data:", error);
            }
        };

        fetchInitialData();

        
        const depthCallback = (data: any) => {
            if (!isComponentActive) return; // Prevent state updates if component is no longer active

            // Update bids
            setBids((currentBids) => {
                const currentBidsMap = new Map(currentBids);
                data.bids.forEach(([price, quantity]: [string, string]) => {
                    if (parseFloat(quantity) > 0) {
                        currentBidsMap.set(price, quantity); // Add or update
                    } else {
                        currentBidsMap.delete(price); // Remove bids with zero quantity
                    }
                });
                return Array.from(currentBidsMap).sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA));
            });

            // Update asks
            setAsks((currentAsks) => {
                const currentAsksMap = new Map(currentAsks);
                data.asks.forEach(([price, quantity]: [string, string]) => {
                    if (parseFloat(quantity) > 0) {
                        currentAsksMap.set(price, quantity); 
                    } else {
                        currentAsksMap.delete(price); 
                    }
                });
                return Array.from(currentAsksMap).sort(([priceA], [priceB]) => parseFloat(priceA) - parseFloat(priceB));
            });
        };

        // Register WebSocket subscription for depth data
        signalingManager.registerCallback("depth", depthCallback, `DEPTH-${market}`);
        signalingManager.sendMessage({ method: "SUBSCRIBE", params: [`depth.${market}`] });

        // Cleanup function to run when component unmounts or market changes
        return () => {
            isComponentActive = false; // Set the flag to false when component unmounts
            signalingManager.sendMessage({ method: "UNSUBSCRIBE", params: [`depth.${market}`] });
            signalingManager.deRegisterCallback("depth", `DEPTH-${market}`);
        };
    }, [market]); 

    return (
        <div>
            <TableHeader />
            {asks && <AskTable asks={asks} />}
            {price && <div className="text-white">{price}</div>}
            {bids && <BidTable bids={bids} />}
        </div>
    );
}

function TableHeader() {
    return (
        <div className="flex justify-between text-xs">
            <div className="text-white">Price</div>
            <div className="text-white">Size</div>
            <div className="text-white">Total</div>
        </div>
    );
}
