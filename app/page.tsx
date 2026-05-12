"use client";
import { useEffect, useState } from 'react';

const REFRESH_RATE = 60 * 1000;
const MAX_BAR_HEIGHT = 160;

export default function ElectionOverlay() {
  const [data, setData] = useState<number[]>([]);

  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/votes?t=${Date.now()}`);
      const json = await res.json();

      const raw: number[] = json.votes ?? [];
      const total = raw.reduce((sum, v) => sum + v, 0);
      const percentages = raw.map((v) =>
        total > 0 ? parseFloat(((v / total) * 100).toFixed(1)) : 0
      );

      setData((prev) => {
        const same = prev.length === percentages.length &&
          prev.every((val, i) => val === percentages[i]);
        return same ? prev : percentages;
      });
    } catch (err) {
      console.error("Data fetch failed", err);
    }
  };

  useEffect(() => {
    fetchVotes();
    const interval = setInterval(fetchVotes, REFRESH_RATE);
    return () => clearInterval(interval);
  }, []);

  const maxVal = Math.max(...data);

  return (
    <main className="w-[100%] h-[300px] bg-transparent overflow-hidden font-sans select-none">
      <div className="absolute bottom-0 left-0 w-full px-4 pb-4 bg-gradient-to-t from-[#002b58] to-transparent">
        <div className="relative flex justify-between items-end overflow-hidden gap-[15px]">
          <img src={`/logo.svg`} className='w-[300px] bottom-0 left-0' />
          <div className='absolute bottom-[55px] w-full border-t border-[4px] border-[#e0003a]'></div>
          <div className="flex-1 grid grid-cols-19">
            {data.map((pct, index) => (
              <div key={index} className="w-[45px] flex flex-col items-center">
                <div className="relative w-full flex flex-col items-center justify-end h-[100px]">
                  <span className="absolute text-[#e0003a] text-[20px] font-[900] mb-2">
                    {pct.toFixed(1)}
                  </span>
                  <div
                    style={{ height: `${(pct / 100) * MAX_BAR_HEIGHT}px` }}
                    className="w-[45px] rounded-t-md transition-all duration-1000 ease-out shadow-lg bg-gradient-to-t from-[#0073b8] to-transparent"
                  />
                </div>

                <div className={`w-[45px] pt-[10px] h-[50px] flex items-center justify-center`}>
                  <img
                    src={`/logos/${index + 1}.svg`}
                    alt={`Party ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}