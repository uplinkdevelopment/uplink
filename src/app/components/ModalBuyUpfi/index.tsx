import { useEffect, useState } from "react";

interface ModalBuyUpfiProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function ModalBuyUpfi({ open, setOpen }: ModalBuyUpfiProps) {
    return (
        <>
            {open &&
                <div className="fixed w-full h-screen bg-transparent z-50" onClick={() => setOpen(false)}>
                    <div className="absolute top-1/4 left-0 right-0 max-w-[380px] lg:max-w-[400px] mx-auto p-6 rounded-2xl border border-gray-700 bg-[#1f1f1f]/[0.8] backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="mb-0 text-primary-color">Buy $UPFI</h3>
                            <label className="text-xl cursor-pointer" onClick={() => setOpen(false)}>x</label>
                        </div>
                        <div className="mt-6">
                            <h4 className="text-gray-400">BRC-20</h4>
                            <a href="https://unisat.io/market/brc20?tick=UPFI" target="_blank">
                                <div className="flex items-center justify-center h-12 rounded-lg bg-[#343434] text-white cursor-pointer">
                                    <img src="/images/unisat.png" alt="" className="w-6 h-6 object-contain mr-2" />
                                    <span>Unisat Market</span>
                                </div>
                            </a>
                            <a href="https://www.okx.com/web3/marketplace/ordinals/brc20/UPFI" target="_blank">
                                <div className="flex items-center justify-center h-12 mt-3 rounded-lg bg-[#343434] text-white cursor-pointer">
                                    <img src="/images/okx-white.png" alt="" className="w-auto h-5 object-contain mr-2" />
                                    <span>Okx Market</span>
                                </div>
                            </a>
                        </div>

                        <div className="mt-6 mb-4">
                            <h4 className="text-gray-400">ERC-20</h4>
                            <a href="https://pancakeswap.finance/swap?outputCurrency=0x34e7B24c6203cf361b73e426E0b9CFbB28dcC01F" target="_blank">
                                <div className="flex items-center justify-center h-12 rounded-lg bg-[#343434] text-white cursor-pointer">
                                    <img src="/images/cake-token.png" alt="" className="w-auto h-6 object-contain mr-2" />
                                    <span>Pancake</span>
                                </div>
                            </a>
                            <div className="flex items-center justify-center h-12 mt-3 rounded-lg bg-[#343434] text-white">
                                <img src="/images/uniswap.png" alt="" className="w-auto h-8 object-contain mr-2" />
                                <span>Uniswap <span className="text-sm text-gray-400">(coming soon)</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}