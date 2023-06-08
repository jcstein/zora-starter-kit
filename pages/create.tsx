import { NextPage } from "next"
import { Header } from "../components/Header"
import { useState, useEffect } from "react"
import { useContractWrite, useSwitchNetwork, useNetwork, useConnect } from "wagmi"
import { InjectedConnector } from 'wagmi/connectors/injected'
import { utils } from "ethers"
const ZoraNFTCreatorProxy_ABI = require("../node_modules/@zoralabs/nft-drop-contracts/dist/artifacts/ZoraNFTCreatorV1.sol/ZoraNFTCreatorV1.json")
const ZoraNFTCreatorProxy_ADDRESS_GOERLI = "0xb9583D05Ba9ba8f7F14CCEe3Da10D2bc0A72f519"
const ZoraNFTCreatorProxy_ADDRESS_TARO = "0x2d2acD205bd6d9D0B3E79990e093768375AD3a30"

const Create: NextPage = () => {

  const [editionInputs, setEditionInputs] = useState({
    contractName: "Example Edition",
    contractSymbol: "EDTN",
    contractMaxSupply: "100",
    secondaryRoyalties: "500",
    fundsRecipient: "0x153D2A196dc8f1F6b9Aa87241864B3e4d4FEc170",
    contractAdmin: "0x153D2A196dc8f1F6b9Aa87241864B3e4d4FEc170",
    salesConfig: {
      priceEther: "0.001",
      perWalletMintCap: "5",
      publicSaleStart: "0", // makes it so edition will be live to start
      publicSaleEnd: "5000000000000", // makes it so edition will be live to start
      presaleStart: "0",
      presaleEnd: "0",
      presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    editionDescription: "description",
    metadataAnimationURI: "animationURI/",
    metadataImageURI: "imageURI/",
  })  

  const { chain } = useNetwork()

  // connect to network and call create drop flow (for when no wallet previously connected)
  const { connectAsync: connectToGoerli } = useConnect({
    connector: new InjectedConnector,
    chainId: 5,
    onSettled(data, error, variables, context) {
      console.log("connect to Taro settled: ", data)
    },
  })

  const { connectAsync: connectToTaro } = useConnect({
    connector: new InjectedConnector,
    chainId: 1582,
    onSettled(data, error, variables, context) {
      console.log("connect to Taro settled: ", data)
    },
  })

  // switch network and call create drop flow (for when wallet already connected but to incorrect network)
  const { data: goerliChainData, switchNetworkAsync: switchToGoerli } = useSwitchNetwork({
    chainId: 5,
    onSuccess(goerliChainData) {
      console.log("Success", goerliChainData)
    }
  })

  const { data: taroChainData, switchNetworkAsync: switchToTaro } = useSwitchNetwork({
    chainId: 1582,
    onSuccess(taroChainData) {
      console.log("Success", taroChainData)
    }
  })

  // connect to network and call create edition flow (for when no wallet previously connected)
  const connectToGoerliAndEdition = async () => {
    await connectToGoerli()
    goerliEditionWrite()
  }

  const connectToTaroAndEdition = async () => {
    await connectToTaro()
    taroEditionWrite()
  }

  // switch network and call edition drop flow (for when wallet already connected but to incorrect network)
  const switchToGoerliAndEdition = async () => {
    await switchToGoerli()
    goerliEditionWrite()
  }

  const switchToTaroAndEdition = async () => {
    await switchToTaro()
    taroEditionWrite()
  }

  // createEdition function used in button  
  const createEditionGoerli = () => {
    if (!chain ) {
      connectToGoerliAndEdition()
      return
    } else if (chain && chain.id !== 4) {
      switchToGoerliAndEdition()
      return
    }
    goerliEditionWrite()
  }

  const createEditionTaro = () => {
    if (!chain ) {
      connectToTaroAndEdition()
      return
    } else if (chain && chain.id !== 1582) {
      switchToTaroAndEdition()
      return
    }
    taroEditionWrite()
  }

  const dealWithEther = (price) => {
    if (price === "") {
      return 0
    }
    return utils.parseEther(price)
  }

  // createEdition functions

  const { data: goerliEditionData, isError: goerliEditionError, isLoading: goerliEditionLoading, write: goerliEditionWrite } = useContractWrite({
    addressOrName: ZoraNFTCreatorProxy_ADDRESS_GOERLI,
    contractInterface: ZoraNFTCreatorProxy_ABI.abi,
    functionName: 'createEdition',
    args: [
      editionInputs.contractName,
      editionInputs.contractSymbol,
      editionInputs.contractMaxSupply,
      editionInputs.secondaryRoyalties,
      editionInputs.fundsRecipient,
      editionInputs.contractAdmin,
      [
        dealWithEther(editionInputs.salesConfig.priceEther),
        editionInputs.salesConfig.perWalletMintCap,
        editionInputs.salesConfig.publicSaleStart,
        editionInputs.salesConfig.publicSaleEnd,
        editionInputs.salesConfig.presaleStart,
        editionInputs.salesConfig.presaleEnd,
        editionInputs.salesConfig.presaleMerkleRoot
      ],
      editionInputs.editionDescription,
      editionInputs.metadataAnimationURI,
      editionInputs.metadataImageURI
    ],
  })

  const { data: taroEditionData, isError: taroEditionError, isLoading: taroEditionLoading, write: taroEditionWrite } = useContractWrite({
    addressOrName: ZoraNFTCreatorProxy_ADDRESS_TARO,
    contractInterface: ZoraNFTCreatorProxy_ABI.abi,
    functionName: 'createEdition',
    args: [
      editionInputs.contractName,
      editionInputs.contractSymbol,
      editionInputs.contractMaxSupply,
      editionInputs.secondaryRoyalties,
      editionInputs.fundsRecipient,
      editionInputs.contractAdmin,
      [
        dealWithEther(editionInputs.salesConfig.priceEther),
        editionInputs.salesConfig.perWalletMintCap,
        editionInputs.salesConfig.publicSaleStart,
        editionInputs.salesConfig.publicSaleEnd,
        editionInputs.salesConfig.presaleStart,
        editionInputs.salesConfig.presaleEnd,
        editionInputs.salesConfig.presaleMerkleRoot
      ],
      editionInputs.editionDescription,
      editionInputs.metadataAnimationURI,
      editionInputs.metadataImageURI
    ]
  })  

  useEffect(() => {
    if(!chain) {
      console.log("no wallet connected")
    } else {
      console.log("chain ID =", chain.id)
    }},
    [chain]
  )

  // The user interface
  return (
    <div className="mt-2 sm:0 min-h-screen h-screen">
      <Header />
      <main className="text-white h-full flex sm:flex-col flex-row flex-wrap">
        <div className=" sm:w sm:h-full w-full h-6/12 flex flex-row flex-wrap content-start">
          <div className="mt-20 sm:mt-10 flex flex-row justify-center h-fit w-full border-2 border-solid border-blue-500 ">
            CREATE EDITION
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center ">
                CONTRACT NAME
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.contractName}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        contractName: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                CONTRACT SYMBOL
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.contractSymbol}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        contractSymbol: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                CONTRACT MAX SUPPLY
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.contractMaxSupply}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        contractMaxSupply: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>                
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                SECONDARY ROYALTIES
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.secondaryRoyalties}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        secondaryRoyalties: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                FUNDS RECIPIENT
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.fundsRecipient}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        fundsRecipient: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                CONTRACT ADMIN
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.contractAdmin}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        contractAdmin: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>          
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                PRICE PER MINT
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.salesConfig.priceEther}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        salesConfig: {
                          ...current.salesConfig,
                          priceEther: e.target.value
                        }                        
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                MINT CAP PER WALLET
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.salesConfig.perWalletMintCap}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        salesConfig: {
                          ...current.salesConfig,
                          perWalletMintCap: e.target.value
                        }                        
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                PUBLIC SALE START
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.salesConfig.publicSaleStart}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        salesConfig: {
                          ...current.salesConfig,
                          publicSaleStart: e.target.value
                        }                        
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                PUBLIC SALE END
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.salesConfig.publicSaleEnd}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        salesConfig: {
                          ...current.salesConfig,
                          publicSaleEnd: e.target.value
                        }                        
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                PRESALE START
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.salesConfig.presaleStart}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        salesConfig: {
                          ...current.salesConfig,
                          presaleStart: e.target.value
                        }                        
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>                 
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                PRESALE END
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="number"
                value={editionInputs.salesConfig.presaleEnd}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        salesConfig: {
                          ...current.salesConfig,
                          presaleEnd: e.target.value
                        }                        
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                PRESALE MERKLE ROOT
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.salesConfig.presaleMerkleRoot}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        salesConfig: {
                          ...current.salesConfig,
                          presaleMerkleRoot: e.target.value
                        }                        
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>                                                                                                                     
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                EDITION DESCRIPTION
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.editionDescription}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        editionDescription: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                ANIMATION URI
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.metadataAnimationURI}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        metadataAnimationURI: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>
          <div className="flex flex-row justify-center w-full h-fit border-2 border-white border-solid">
            <div className="flex flex-row w-full justify-center grid grid-cols-3">
              <div className="text-center">
                IMAGE URI
              </div>
              <input
                className="text-black text-center bg-slate-200"
                placeholder="Input NFT Address"
                name="inputContract"
                type="text"
                value={editionInputs.metadataImageURI}
                onChange={(e) => {
                    e.preventDefault();
                    setEditionInputs(current => {
                      return {
                        ...current,
                        metadataImageURI: e.target.value
                      }
                    })
                }}
                required                    
              >
              </input>
              <button>
                HOVER FOR INFO
              </button>
            </div>            
          </div>          
          <div className="flex flex-row justify-center w-full h-fit border-2 border-blue-500 border-solid">
            <button
              className="border-2 hover:bg-white hover:text-black border-solid border-blue-500 py-1 flex flex-row w-full justify-center"
              onClick={() => createEditionGoerli()}
            >
              DEPLOY TO GOERLI
            </button>
            <button
              className="border-2 border-l-0 hover:bg-white hover:text-black border-solid border-blue-500 py-1  flex flex-row w-full justify-center"
              onClick={() => createEditionTaro()}
            >
              DEPLOY TO TARO
            </button>              
          </div>                                                                                                
        </div>
      </main>
    </div>
  )
}

export default Create
