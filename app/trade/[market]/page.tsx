"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Trades } from "@/app/components/Trades";
import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const { market } = useParams();
  
  // State to track whether 'Depth' or 'Trades' is selected
  const [view, setView] = useState<'book' | 'trades'>('book');

  return (
    <div className="flex flex-row flex-1">
      <div className="flex flex-col flex-1">
        <MarketBar market={market as string} />
        <div className="flex flex-row h-[920px] border-y border-slate-800">
          <div className="flex flex-col flex-1">
            <TradeView market={market as string} />
          </div>
          <div className="flex flex-col w-[250px] overflow-hidden">
            {/* Toggle buttons to switch between Depth (Book) and Trades */}
            <div className="flex justify-around py-2 border-b border-slate-800">
              <button
                onClick={() => setView('book')}
                className={`${
                  view === 'book' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-white'
                }`}
              >
                Order Book
              </button>
              <button
                onClick={() => setView('trades')}
                className={`${
                  view === 'trades' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-white'
                }`}
              >
                Trades
              </button>
            </div>

            {/* Conditionally render Depth or Trades based on selected view */}
            {view === 'book' && <Depth market={market as string} />}
            {view === 'trades' && <Trades market={market as string} />}
          </div>
        </div>
      </div>
      <div className="w-[10px] flex-col border-slate-800 border-l"></div>
      <div>
        <div className="flex flex-col w-[250px]">
          <SwapUI market={market as string} />
        </div>
      </div>
    </div>
  );
}
