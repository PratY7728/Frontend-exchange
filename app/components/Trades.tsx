"use client";
import { useEffect, useState } from "react";
import { Trade } from "../utils/types";
import { getTrades } from "../utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";

// Props for the Trades component
export const Trades = ({ market }: { market: string }) => {
  const [trade, setTrade] = useState<Trade[]>([]);

  useEffect(() => {
    // fetch intial trades
    getTrades(market).then((trades) => {
      setTrade(trades.slice(0, 15)); 
    });
    const signalingManager = SignalingManager.getInstance();

    // Subscribe to WebSocket updates for the current market
    signalingManager.sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    // Register the callback to handle real-time trade updates
    signalingManager.registerCallback(
      "trade",
      (data: Trade) => {
        console.log("New trade received from WebSocket:", data); 
        setTrade((originalTrades) => {
           // Prepend the new trade and limit to the most recent 15 trades
          const tradeAfterUpdate: Trade[] = [data, ...originalTrades];

          // If there are more than 15 trades, remove the oldest (last one)
          if (tradeAfterUpdate.length > 15) {
            tradeAfterUpdate.pop(); // Remove the last trade (oldest)
          }

          console.log("Updated trades array:", tradeAfterUpdate); 
          return tradeAfterUpdate;
        });
      },
      `TRADE-${market}`
    );

    // Clean up: Unsubscribe from WebSocket updates only when the market changes
    return () => {
      signalingManager.sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
      signalingManager.deRegisterCallback("trade", `TRADE-${market}`);
    };
  }, [market]); // Dependency array includes 'market', so this effect runs when 'market' changes

  return (
    <div className="trade-table">
      <TableHeader />
      {trade.map((trade) => (
        <RecentTrade key={trade.id} trade={trade} />
      ))}
    </div>
  );
};

function TableHeader() {
  return (
    <div className="flex justify-between text-xs text-white py-2">
      <div>Price (USDC)</div>
      <div>Quantity (SOL)</div>
      <div>Timestamp</div>
    </div>
  );
}

function RecentTrade({ trade }: { trade: Trade }) {
  const { price, quantity, timestamp, isBuyerMaker } = trade;
  const formattedTime = new Date(timestamp).toLocaleTimeString();

  return (
    <div className={`flex justify-between py-1 ${isBuyerMaker ? "text-red-500" : "text-green-500"}`}>
      <div>{price}</div>
      <div>{quantity}</div>
      <div>{formattedTime}</div>
    </div>
  );
}
