declare let window: any;

export async function connectWallet() {
  const unisat = window.unisat || undefined;
  const btc = window.btc || undefined;
  const okxwallet = window.okxwallet || undefined;

  const walletProvider = localStorage.getItem("walletProvider");

  let walletAddress: any = [];

  if (walletProvider === "unisat") {
    walletAddress = await unisat?.requestAccounts();
  } else if (walletProvider === "leather") {
    const response = await btc?.request("getAddresses");

    walletAddress = response.result.addresses.find(
      (address: any) => address.type === "p2wpkh"
    )?.address;
  } else if (walletProvider === "okx") {
    let walletData = await okxwallet.bitcoin.connect();
    walletAddress.push(walletData.address);
  } else {
  }

  return walletAddress;
}

export async function signMessage(address: string) {
  const unisat = window.unisat || undefined;
  const walletProvider = localStorage.getItem("walletProvider");

  if (walletProvider === "unisat") {
    let signature = await unisat.signMessage(
      `Welcome to Uplink\n\nSign in with ${address.toLowerCase()}`
    );

    return signature;
  } else if (walletProvider === "okx") {
    const signature = await window.okxwallet.bitcoin.signMessage(
      `Welcome to Uplink\n\nSign in with ${address.toLowerCase()}`,
      {
        from: address,
      }
    );

    return signature;
  } else {
  }
}

export function checkHasWalletInstalled() {
  const ethereum = window.ethereum;
  const unisat = window.unisat;
  const btc = window.btc;
  const okxwallet = window.okxwallet;

  const walletProvider = localStorage.getItem("walletProvider");
  let walletProviderData = {
    isInstalled: true,
    downloadUrl: "",
  };

  if (walletProvider === "unisat") {
    if (unisat === undefined) {
      walletProviderData = {
        isInstalled: false,
        downloadUrl: "https://unisatwallet.io/download",
      };
    }
  } else if (walletProvider === "leather") {
    if (btc === undefined) {
      walletProviderData = {
        isInstalled: false,
        downloadUrl: "https://leather.io/install-extension",
      };
    }
  } else if (walletProvider === "okx") {
    if (okxwallet === undefined) {
      walletProviderData = {
        isInstalled: false,
        downloadUrl: "https://okx.network",
      };
    }
  } else {
  }

  return walletProviderData;
}
