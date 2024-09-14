"use client";
import { useState } from "react";

export function SwapUI({ market }: { market: string }) {
  const [amount, setAmount] = useState(''); // to track quantity input
  const [price, setPrice] = useState('');   // to track price input
  const [availableBalance, setAvailableBalance] = useState(10000000); // Initial balance
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [type, setType] = useState('limit'); // 'limit' or 'market'
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // To manage 'Post Only' or 'IOC'

  // Handle form submission (buy/sell action)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior
    const orderType = type === 'limit' ? 'Limit Order' : 'Market Order';
    const action = activeTab === 'buy' ? 'Buy' : 'Sell';

    // Convert amount and price to numbers
    const totalAmount = parseFloat(amount);
    const totalPrice = parseFloat(price);

    // Check if input is valid
    if (isNaN(totalAmount) || isNaN(totalPrice) || totalAmount <= 0 || totalPrice <= 0) {
      console.error("Invalid input");
      return;
    }

    // Calculate the total cost or gain based on buy or sell action
    const totalCost = totalAmount * totalPrice;
    //@ts-ignore
    if (action === 'buy') {
      if (totalCost > availableBalance) {
        console.error("Insufficient balance");
        return; // Do nothing if balance is insufficient
      }
      setAvailableBalance(prevBalance => prevBalance - totalCost); // Deduct cost for buying
      console.log(`Buying: Cost: ${totalCost}, New Balance: ${availableBalance - totalCost}`);
      //@ts-ignore
    } else if (action === 'sell') {
      setAvailableBalance(prevBalance => prevBalance + totalCost); // Add the gain for selling
      console.log(`Selling: Gain: ${totalCost}, New Balance: ${availableBalance + totalCost}`);
    }

    // Clear form inputs after submission
    setAmount('');           // Reset quantity
    setPrice('');            // Reset price
    setSelectedOption(null); // Uncheck any selected option
  };

  return (
    <div>
      <div className="flex flex-col text-white">
        <div className="flex flex-row h-[60px]">
          <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
          <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <div className="px-3">
              <div className="flex flex-row flex-0 gap-5">
                <LimitButton type={type} setType={setType} />
                <MarketButton type={type} setType={setType} />
              </div>
            </div>
            <div className="flex flex-col px-3">
              <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-row">
                    <p className="text-xs font-normal text-baseTextMedEmphasis">Available Balance</p>
                    <p className="font-medium text-xs text-baseTextHighEmphasis">{availableBalance.toFixed(2)} USDC</p> {/* Updated available balance */}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Price
                  </p>
                  <div className="flex flex-col relative">
                    <input
                      step="0.01"
                      placeholder="0"
                      className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                      type="text"
                      value={price} // Set value from state
                      onChange={(e) => setPrice(e.target.value)} // Update price state
                    />
                    <div className="flex flex-row absolute right-1 top-1 p-2">
                      <div className="relative">
                        <img src="/usdc.webp" className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-normal text-baseTextMedEmphasis">
                  Quantity
                </p>
                <div className="flex flex-col relative">
                  <input
                    step="0.01"
                    placeholder="0"
                    className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                    type="text"
                    value={amount} // Set value from state
                    onChange={(e) => setAmount(e.target.value)} // Update amount state
                  />
                  <div className="flex flex-row absolute right-1 top-1 p-2">
                    <div className="relative">
                      <img src="/sol.webp" className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end flex-row">
                  <p className="font-medium pr-2 text-xs text-baseTextMedEmphasis">≈ 0.00 USDC</p>
                </div>
                <div className="flex justify-center flex-row mt-2 gap-3">
                  <div
                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                    onClick={() => setAmount('25')}
                  >
                    25%
                  </div>
                  <div
                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                    onClick={() => setAmount('50')}
                  >
                    50%
                  </div>
                  <div
                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                    onClick={() => setAmount('75')}
                  >
                    75%
                  </div>
                  <div
                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                    onClick={() => setAmount('100')}
                  >
                    Max
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="font-semibold focus:ring-blue-200 focus:none focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4 bg-greenPrimaryButtonBackground text-greenPrimaryButtonText active:scale-98"
              >
                {activeTab === 'buy' ? 'Buy' : 'Sell'}
              </button>
              <div className="flex justify-between flex-row mt-1">
                <div className="flex flex-row gap-2">
                  <div className="flex items-center">
                    <input
                      className="form-checkbox rounded border border-solid border-baseBorderMed bg-base-950 font-light text-transparent shadow-none shadow-transparent outline-none ring-0 ring-transparent checked:border-baseBorderMed checked:bg-base-900 checked:hover:border-baseBorderMed focus:bg-base-900 focus:ring-0 focus:ring-offset-0 focus:checked:border-baseBorderMed cursor-pointer h-5 w-5"
                      id="postOnly"
                      type="checkbox"
                      checked={selectedOption === 'postOnly'}
                      onChange={() => setSelectedOption(selectedOption === 'postOnly' ? null : 'postOnly')}
                    />
                    <label className="ml-2 text-xs">Post Only</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      className="form-checkbox rounded border border-solid border-baseBorderMed bg-base-950 font-light text-transparent shadow-none shadow-transparent outline-none ring-0 ring-transparent checked:border-baseBorderMed checked:bg-base-900 checked:hover:border-baseBorderMed focus:bg-base-900 focus:ring-0 focus:ring-offset-0 focus:checked:border-baseBorderMed cursor-pointer h-5 w-5"
                      id="ioc"
                      type="checkbox"
                      checked={selectedOption === 'ioc'}
                      onChange={() => setSelectedOption(selectedOption === 'ioc' ? null : 'ioc')}
                    />
                    <label className="ml-2 text-xs">IOC</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function LimitButton({ type, setType }: { type: string, setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType('limit')}
    >
      <div
        className={`text-sm font-medium py-1 border-b-2 ${
          type === 'limit'
            ? 'border-accentBlue text-baseTextHighEmphasis'
            : 'border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis'
        }`}
      >
        Limit
      </div>
    </div>
  );
}

function MarketButton({ type, setType }: { type: string, setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType('market')}
    >
      <div
        className={`text-sm font-medium py-1 border-b-2 ${
          type === 'market'
            ? 'border-accentBlue text-baseTextHighEmphasis'
            : 'border-b-2 border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis'
        } `}
      >
        Market
      </div>
    </div>
  );
}

function BuyButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
  return (
    <div
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${
        activeTab === 'buy'
          ? 'border-b-greenBorder bg-greenBackgroundTransparent'
          : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'
      }`}
      onClick={() => setActiveTab('buy')}
    >
      <p className="text-center text-sm font-semibold text-greenText">Buy</p>
    </div>
  );
}

function SellButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
  return (
    <div
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${
        activeTab === 'sell'
          ? 'border-b-redBorder bg-redBackgroundTransparent'
          : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'
      }`}
      onClick={() => setActiveTab('sell')}
    >
      <p className="text-center text-sm font-semibold text-redText">Sell</p>
    </div>
  );
}
