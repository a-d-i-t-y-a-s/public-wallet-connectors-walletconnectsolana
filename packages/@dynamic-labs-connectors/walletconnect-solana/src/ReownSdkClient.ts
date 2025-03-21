// ReownSdkClient.ts
import { logger } from '@dynamic-labs/wallet-connector-core';
import { WalletConnectWalletAdapter, type WalletConnectWalletAdapterConfig } from '@walletconnect/solana-adapter';
import { ReownProvider } from './ReownProvider.js';
import type { ISolana } from '@dynamic-labs/solana-core';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export class ReownSdkClient {

  static isInitialized = false;
  static walletConnectSdk: WalletConnectWalletAdapter;
  static isConnected = false;
  static provider: ReownProvider | undefined;

  // Private constructor: this class is a singleton.
  private constructor() {
    throw new Error('ReownSdkClient is not instantiable');
  }
  
  // Initialize the adapter/SDK and attempt to fetch wallet info
  static async init(): Promise<void> {
    if (ReownSdkClient.isInitialized) {
      return;
    }
    
    logger.debug('[ReownSdkClient] Initializing Solana adapter');

    // Pass the required configuration to WalletConnectWalletAdapter.
    const walletConnectConfig: WalletConnectWalletAdapterConfig = {
      network: WalletAdapterNetwork.Mainnet,
      // Put your projectId and other options inside the options property.
      options: {
      projectId: '650bf06b2ba268309996256ccf0ac529',
      },
    // Use a literal string that matches one of the allowed values.
    };
    // Instantiate your Solana adapter.
    ReownSdkClient.walletConnectSdk  = new WalletConnectWalletAdapter(walletConnectConfig);
    console.log("Wallet connect SDK: " + ReownSdkClient.walletConnectSdk);
    // Connect the adapter. This will throw if connection fails.
    await ReownSdkClient.connect();
    
    // Mark initialization as complete.
    ReownSdkClient.isInitialized = true;
  }

    // Returns the connected wallet's address (public key).
    // static getAddress = () => {
    //   if (!ReownSdkClient.walletConnectSdk) {
    //     throw new Error("WalletConnect adapter not initialized. Call init() first.");
    //   }
  
    //   return ReownSdkClient.walletConnectSdk.publicKey;
    // }
    static getAddress = (): PublicKey | undefined => {
      if (!ReownSdkClient.walletConnectSdk || !ReownSdkClient.isConnected) {
        return undefined;
      }
      return ReownSdkClient.walletConnectSdk.publicKey || undefined;
    }

    static async connect(): Promise<void> {
      if (!ReownSdkClient.walletConnectSdk) {
          throw new Error("WalletConnect adapter not initialized. Call init() first.");
      }
      await ReownSdkClient.walletConnectSdk.connect();

      const publicKey = ReownSdkClient.walletConnectSdk.publicKey;
          if (!publicKey) {
      throw new Error("Failed to connect wallet: publicKey is undefined");
      }
      ReownSdkClient.isConnected = true;
    }

    static signAndSendTransaction = async <T extends Transaction | VersionedTransaction>(t: T): Promise<T> => {
      if (!ReownSdkClient.walletConnectSdk) {
        throw new Error("WalletConnect adapter not initialized. Call init() first.");
      }
      const returntx = await ReownSdkClient.walletConnectSdk.signTransaction(t);
      return returntx;
    }
    

    static signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
      if (!ReownSdkClient.walletConnectSdk) {
        throw new Error("WalletConnect adapter not initialized. Call init() first.");
      }

      console.log("WalletConnectSdk instance:", ReownSdkClient.walletConnectSdk);

      return await ReownSdkClient.walletConnectSdk.signMessage(message);
    }
    
    

    // Returns the provider from the adapter. Adjust as needed if your adapter exposes a different property.
    static getProvider = (): ISolana => {
      if (!ReownSdkClient.walletConnectSdk) {
        throw new Error("WalletConnect adapter is not initialized");
      }
    
      // Create the provider only once.
    if (!ReownSdkClient.provider) {
      ReownSdkClient.provider = new ReownProvider(ReownSdkClient.walletConnectSdk);
      ReownSdkClient.provider.publicKey = ReownSdkClient.walletConnectSdk.publicKey as PublicKey;
      ReownSdkClient.provider.isConnected = ReownSdkClient.isConnected;
      
      // Set the extension locator flags as desired.
      ReownSdkClient.provider.isBraveWallet = true;
      ReownSdkClient.provider.isGlow = true;
      ReownSdkClient.provider.isPhantom = true;
      ReownSdkClient.provider.isSolflare = true;
      ReownSdkClient.provider.isExodus = true;
      ReownSdkClient.provider.isBackpack = true;
      ReownSdkClient.provider.isMagicEden = true;
    }
    
    return ReownSdkClient.provider;
    };
}
