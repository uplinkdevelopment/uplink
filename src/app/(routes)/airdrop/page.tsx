'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { postgresApi } from '../../utils/helpers/apiHelper'
import ConnectWalletButton from '../../components/ConnectWalletButton';
import { motion, useAnimation } from "framer-motion";

declare let window: any;

export default function Airdrop() {
    const [address, setAddress] = useState<string>('');
    const [isChecking, setIsChecking] = useState<boolean>(false); // appear airdrop card only once checking is done (false)
    const [claimStep, setClaimStep] = useState<number>(0) // 0 = nothing, 1 = in progress
    const [eligible, setEligible] = useState<boolean>(false);
    const [isClaimed, setIsClaimed] = useState<boolean>(false);
    const [amount, setAmount] = useState<string>('');

    const handleClaim = async () => {
        setClaimStep(1);
        const address = localStorage.getItem('walletAddress');
        const walletProvider = localStorage.getItem('walletProvider');

        // TEST
        // let res = await postgresApi("airdrop/season-1/claim", "POST", {
        //     address: address,
        //     txId: 'txid20240104',
        // });

        // console.log(JSON.stringify(res))

        // return;
        // END TEST

        let requestRes = await postgresApi("airdrop/season-1/claim/request", "POST", {
            address: address
        });

        // console.log(JSON.stringify(requestRes))

        if (requestRes.code === 1001) {
            let tx;

            try {
                let protocolWallet = requestRes.data.protocolWallet;
                let cost = requestRes.data.cost;

                if (walletProvider === 'unisat') {
                    tx = await window.unisat.sendBitcoin(protocolWallet, cost);
                } else if (localStorage.getItem('walletProvider') === 'okx') {
                    tx = await window.okxwallet.bitcoin.send({
                        from: address,
                        to: protocolWallet,
                        value: cost * 0.00000001
                    });
                } else {
                    toast(requestRes.msg)
                }

                let res = await postgresApi("airdrop/season-1/claim", "POST", {
                    address: address,
                    txId: walletProvider === 'unisat' ? tx : tx.txhash,
                });

                if (res.code === 1001) {
                    setIsClaimed(true);
                    toast('🎉 $UPFI will drop to your wallet within 24h 🎉')
                }

                setClaimStep(0);
            } catch (err: any) {
                setClaimStep(0);
                toast(err.message);
            }
        } else {
            setClaimStep(0);
            toast(requestRes.msg);
        }
    }

    const handleCheckEligibility = async () => {
        setIsChecking(true);
        let address = localStorage.getItem('walletAddress');
        let signature = localStorage.getItem('token');
        let walletProvider = localStorage.getItem('walletProvider');

        if (address && signature) {
            try {
                let publicKey = '';

                if (walletProvider === 'unisat') {
                    const unisat = (window as any).unisat;
                    publicKey = await unisat.getPublicKey();
                    // console.log(address);
                    // console.log(signature);
                    // console.log(publicKey);
                } else if (walletProvider === 'okx') {
                    const addressInfo = await (window as any).okxwallet.bitcoin.connect();
                    publicKey = addressInfo.publicKey;
                } else {

                }

                let res = await postgresApi("airdrop/season-1/list/check-eligibility", "POST", {
                    address: address,
                    publicKey: publicKey,
                    signature: signature,
                    walletProvider: walletProvider
                });

                if (res.code === 1001) {
                    setEligible(true);
                    setAmount(res.data.amount);
                    setIsClaimed(res.data.isClaimed);
                    setTimeout(() => {
                        setIsChecking(false);
                    }, 2000);
                } else if (res.code === 1004) {
                    setIsChecking(false);
                    setEligible(false);
                }
            } catch (err: any) {
                setTimeout(() => {
                    setIsChecking(false);
                }, 2000);
                // toast(err.message)
            }
        }
    }

    const formattedAmount = (amount: string) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    useEffect(() => {
        if (localStorage.getItem('walletAddress')) {
            setAddress(localStorage.getItem('walletAddress') || '');
            handleCheckEligibility();
        }

        const handleWalletAddressChange = () => {
            if (localStorage.getItem('walletAddress')) {
                setAddress(localStorage.getItem('walletAddress') || '');
                handleCheckEligibility();
            } else {
                setAddress('');
            }
        };

        window.addEventListener('walletAddressChanged', handleWalletAddressChange);

        return () => {
            window.removeEventListener('walletAddressChanged', handleWalletAddressChange);
        };
    }, [])

    return (
        <div className="relative min-h-screen -mb-10">
            <ToastContainer autoClose={4000} draggable={false} />
            <img src="/images/airdrop-bg.png" className="absolute top-0 left-0 w-full h-full object-cover opacity-5 -z-10" />
            <div className="container mx-auto pt-36">
                <div className="text-center">
                    <h3 className="text-[2rem] text-center lg:text-[2.5rem] xl:text-[2.7rem]">$UPFI Airdrop</h3>
                    <p>The airdrop you are waiting for is here</p>
                </div>

                {isChecking &&
                    <label className="block mt-10 text-center">
                        Checking is wallet eligible
                        <motion.span
                            className="inline-block mx-1"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            .
                        </motion.span>
                        <motion.span
                            className="inline-block mx-1"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
                        >
                            .
                        </motion.span>
                        <motion.span
                            className="inline-block mx-1"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                        >
                            .
                        </motion.span>
                    </label>
                }

                {address && !isChecking &&
                    <motion.div
                        className="relative max-w-[400px] mt-16 mx-auto p-5 pb-14 rounded-lg border border-white/[0.2] bg-[#232323] bg-transparent"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                    >
                        {
                            (eligible || !eligible) &&
                            <>
                                <motion.div
                                    className="absolute top-6 -left-56 w-10 h-10 border border-dashed border-white rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ duration: 0.5, delay: 1.5 }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 2, delay: 2, repeat: Infinity }}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white"></div>
                                    </motion.div>
                                </motion.div>
                                <motion.div
                                    className="absolute bottom-28 -right-32 w-6 h-6 border-2 border-white rounded-full"
                                    initial={{ opacity: .5, scale: 0 }}
                                    animate={{ opacity: [.5, 1, .5], scale: [0.7, 1.2, 0.7] }}
                                    transition={{ duration: 2, delay: 1.5, repeat: Infinity }}
                                >
                                </motion.div>
                                <motion.img
                                    src="/images/airdrop-star.png"
                                    alt=""
                                    className="absolute top-22 -right-40 w-10 h-auto object-contain"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ duration: 0.5, delay: 1.8 }}
                                />
                                <motion.img
                                    src="/images/airdrop-star-border.png"
                                    alt=""
                                    className="absolute bottom-32 -left-28 w-12 h-auto object-contain"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ duration: 0.5, delay: 2.1 }}
                                />
                            </>
                        }
                        <div className="absolute -top-3 -right-3 w-full h-full rounded-lg border border-white opacity-30"></div>
                        <label className="ml-2 text-primary-color">$UPFI</label>
                        <div className="relative w-[90%] h-52 mt-2 mx-auto">
                            <motion.img
                                src="/images/airdrop-vector-3.png"
                                alt=""
                                className="absolute w-full h-full object-contain"
                                animate={{ y: [-20, 0, -20], scale: [0.95, 1, 1, 0.95] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                            />
                            <motion.img
                                src="/images/airdrop-vector-1.png"
                                alt=""
                                className="absolute w-full h-full object-contain"
                            />
                            <motion.img
                                src="/images/airdrop-vector-2.png"
                                alt=""
                                className="absolute w-full h-full object-contain"
                                animate={{ y: [-20, 0, -20], scale: [0.95, 1, 1, 0.95] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                            />
                        </div>
                        {eligible
                            ? <div className="mt-6 text-center">
                                <label className="text-gray-400">You are eligible to get</label>
                                <motion.h3
                                    className="mt-2 text-[2.6rem] text-primary-color"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ ease: 'easeInOut', duration: 1.3, delay: .8 }}
                                >{formattedAmount(amount)} $UPFI</motion.h3>
                            </div>
                            : <h3 className="mt-6 text-center">Connected wallet not eligible to the airdrop.</h3>
                        }
                        {
                            eligible &&
                            <>
                                {!isClaimed
                                    ? <div className={`absolute -bottom-4 left-0 right-0 inline-flex items-center justify-center mx-auto w-40 h-14 p-1 rounded-full border-2 border-primary-color font-bold cursor-pointer ${claimStep === 1 && '!border-gray-400'}`}
                                        onClick={() => {
                                            if (claimStep === 0) {
                                                handleClaim()
                                            }
                                        }}
                                    >
                                        <div className={`flex items-center justify-center w-full h-full rounded-full bg-primary-color ${claimStep === 1 && '!bg-gray-600 !text-gray-400'}`}>
                                            {claimStep === 0 ? 'Claim' : 'Claiming...'}
                                        </div>
                                    </div>
                                    : <div className="absolute -bottom-4 left-0 right-0 inline-flex items-center justify-center mx-auto w-40 h-14 p-1 rounded-full border-2 border-gray-400 font-bold cursor-pointer">
                                        <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-600 text-gray-400">Claimed</div>
                                    </div>
                                }
                            </>
                        }
                    </motion.div>
                }
                {!address &&
                    <div className="mt-10 text-center">
                        <label className="text-primary-color">Connect wallet to continue</label>
                        {/* <ConnectWalletButton /> */}
                    </div>
                }
            </div>
        </div >
    )
}