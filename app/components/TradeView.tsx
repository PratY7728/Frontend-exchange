import { useEffect, useRef } from "react";
import { ChartManager } from "../utils/ChartManager";
import { getKlines } from "../utils/httpClient";
import { KLine } from "../utils/types";
import { SignalingManager } from "../utils/SignalingManager";

export function TradeView({
  market,
}: {
  market: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager>(null);


  useEffect(() => {
    const init = async () => {


      let klineData: KLine[] = [];
      try {
        klineData = await getKlines(market, "1h", Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000), Math.floor(new Date().getTime() / 1000)); 
      } catch (e) { }

      if (chartRef) {
        if (chartManagerRef.current) {
          chartManagerRef.current.destroy();
        }

        const chartManager = new ChartManager(
          chartRef.current,
          [
            ...klineData?.map((x) => ({
              close: parseFloat(x.close),
              high: parseFloat(x.high),
              low: parseFloat(x.low),
              open: parseFloat(x.open),
              timestamp: new Date(x.end), 
            })),
          ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
          {
            background: "#0e0f14",
            color: "white",
          }
        );
        //@ts-ignore
        chartManagerRef.current = chartManager;
      }
    };
    init();

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`kline.1h.${market}`]
     });

     SignalingManager.getInstance().registerCallback("kline",
      ( data: any) => {
            const klineUpdated = {
              close: parseFloat(data.close),
              end: data.end,
              high: parseFloat(data.high),
              low: parseFloat(data.low),
              open: parseFloat(data.open),
              start: data.start,
              trades: data.trades,
              volume: data.volume,
              newCandleInitiated: data.newCandleInitiated
            }
            if (chartManagerRef.current) {
              chartManagerRef.current.update(klineUpdated);
            }
      }
      ,`KLINE-${market}`);

    return () => {
      SignalingManager.getInstance().deRegisterCallback("kline",`KLINE-${market}`);
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`kline.1h.${market}`]
       });
    }
  }, [market, chartRef]);
  

  return (
    <>
      <div ref={chartRef} style={{ height: "520px", width: "100%", marginTop: 4 }}></div>
    </>
  );
}
