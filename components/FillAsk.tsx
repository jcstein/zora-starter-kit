import { Header } from "./Header";
import { useContractRead, useAccount, useContractWrite } from "wagmi";
import { AsksV1_1Interface } from "@zoralabs/v3/dist/typechain/AsksV1_1"
import * as asksAddresses from "@zoralabs/v3/dist/addresses/1.json"
import { abi } from "@zoralabs/v3/dist/artifacts/AsksV1_1.sol/AsksV1_1.json"
import { useState, useEffect } from "react";
import { ReadContractResult } from "@wagmi/core";
import { BigNumber, ethers, utils } from "ethers";

export const FillAsk = (nft, call) => {

    interface fillAskCall {
        tokenContract: any,
        tokenId: any,
        fillCurrency: any,
        fillAmount: any,
        finder: any
    }

    const [fillAsk, setFillAsk] = useState<fillAskCall>({
        "tokenContract": nft.nft.nft.contractAddress,
        "tokenId": nft.nft.nft.tokenId,
        "fillCurrency": "",
        "fillAmount": "",
        "finder": ""

    })

    // checking prop
    // console.log("what is write nft", nft)
    // console.log("what is the nft.call", nft.call)
    
    // get account hook
    const { address, connector, isConnecting, isConnected, status} = useAccount(); 
    const currentUserAddress = address ? address : ""


    // AsksV1_1 askForNFT read call

    const { data, isLoading, isSuccess, isFetching  } = useContractRead({
        addressOrName: asksAddresses.AsksV1_1,
        contractInterface: abi,
        functionName: 'askForNFT',
        args: [
            nft.nft.nft.contractAddress,
            nft.nft.nft.tokenId
        ],
        watch: true,
        onError(error) {
            console.log("error: ", error)
        },
        onSuccess(data) {
            console.log("success! --> ", data)
        }  
    })

    const currentReadData = data ? data : ""
    const currentReadPrice = data ? `${utils.formatEther(BigNumber.from(currentReadData[4]).toString())}` + " ETH" : "undefined"
    const currentFindersFee = data ? `${currentReadData[3] / 100 }` + " %" : "undefined"

    // AsksV1_1 fillAsk Write

    const fillAmountOverride = () => {
        if (fillAsk.fillAmount === "") {
            return 0
        } else {
            return ethers.utils.parseEther(fillAsk.fillAmount)
        }
    }

    const { data: cancelData, isError: fillAskError, isLoading: fillAskLoading, isSuccess: fillAskSuccess, write: fillAskWrite  } = useContractWrite({
        addressOrName: asksAddresses.AsksV1_1,
        contractInterface: abi,
        functionName: 'fillAsk',
        args: [
            fillAsk.tokenContract,
            fillAsk.tokenId,
            fillAsk.fillCurrency,
            fillAsk.fillAmount,
            fillAsk.finder,

        ],
        overrides: {
            value: fillAmountOverride()
        },
        onError(error, variables, context) {
            console.log("error", error)
        },
        onSuccess(fillData, variables, context) {
            console.log("Success!", fillData)
        },
    })    

    const listingCheck = (sellerAddress) => {
        console.log("selleraddress: ", sellerAddress)
        if (sellerAddress === "0x0000000000000000000000000000000000000000") {
            return (
                <div>
                No Active Listing for current address + token Id
                </div>
            )
        } else {
            return (
                <div className="flex flex-row flex-wrap w-fit space-y-1">
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Contract Address: " + nft.nft.nft.contractAddress}
                    </div>                
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Token Id: " + nft.nft.nft.tokenId}
                    </div>                
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Seller: " + currentReadData[0]}
                    </div>
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Funds Recipient: " + currentReadData[1]}
                    </div>
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Currency: " + currentReadData[2]}
                    </div>
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Finders Fee: " + currentFindersFee}
                    </div>
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Price: " + currentReadPrice}
                    </div>
                </div>
            )
        }
    }

    const callCheck = (functionCall) => {
        if (functionCall === "fill" ) {
            return (
                <div className="flex flex-row flex-wrap w-fit space-y-1">
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Contract Address: " + nft.nft.nft.contractAddress}
                    </div>                
                    <div className="flex flex-row flex-wrap w-full">                    
                        {"Token Id: " + nft.nft.nft.tokenId}
                    </div>          

                    <div className="flex flex-row w-full">
                        <input
                            className="flex flex-row flex-wrap w-fit ml-5 text-black text-center bg-slate-200"
                            placeholder="Fill Currency"
                            name="fillAskCurrency"
                            type="text"
                            value={fillAsk.fillCurrency}
                            onChange={(e) => {
                                e.preventDefault();
                                setFillAsk(current => {
                                    return {
                                    ...current,
                                    fillCurrency: e.target.value
                                    }
                                })
                            }}
                            required                              
                        >
                        </input>
                    </div>         

                    <div className="flex flex-row w-full">
                        <input
                            className="flex flex-row flex-wrap w-fit ml-5 text-black text-center bg-slate-200"
                            placeholder="Fill Amount"
                            name="fillAskAmount"
                            type="text"
                            value={fillAsk.fillAmount}
                            onChange={(e) => {
                                e.preventDefault();
                                setFillAsk(current => {
                                    return {
                                    ...current,
                                    fillAmount: e.target.value
                                    }
                                })
                            }}
                            required                              
                        >
                        </input>
                    </div>

                    <div className="flex flex-row w-full">
                        <input
                            className="flex flex-row flex-wrap w-fit ml-5 text-black text-center bg-slate-200"
                            placeholder="Finder"
                            name="fillAskFinder"
                            type="text"
                            value={fillAsk.finder}
                            onChange={(e) => {
                                e.preventDefault();
                                setFillAsk(current => {
                                    return {
                                    ...current,
                                    finder: e.target.value
                                    }
                                })
                            }}
                            required                              
                        >
                        </input>
                    </div>                                                                                                  
                    
                    <button 
                        type="button"
                        onClick={() => fillAskWrite()}
                        className="border-2 border-white border-solid px-2 hover:bg-white hover:text-slate-900"
                    >
                        FILL ASK
                    </button>

                </div>
            )
        }
    }
    
    return (
        <div className=" text-white text-sm h-full flex flex-col flex-wrap items-center justify-center">
            <main className=" w-full flex flex-row flex-wrap">        
                <div>
                    {callCheck(nft.call)}
                </div>
                <div className="w-6/12">
                    {JSON.stringify(fillAsk)}
                </div>    
            </main>
        </div>
    )
}