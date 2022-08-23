import { ethers, VoidSigner } from "ethers";
import { MutableRefObject } from "react";
import { Contracts } from "../contracts";
import { AssetId } from "./Strategy";
import { loadSeriesAndStartListening, loadVaultsAndStartListening } from "./Vault";

const {ALCHEMY_MAINNET_RPC} = process.env;

describe('loadVaultsAndStartListening', () => {
    const vaultOwner = "0xefd67615d66e3819539021d40e155e1a6107f283";
    let provider: ethers.providers.Provider;
    let signer: ethers.Signer;
    beforeAll(() => {
        if (ALCHEMY_MAINNET_RPC === undefined) {
            throw new Error('To run this test, the ALCHEMY_MAINNET_RPC environment variable need to be set');
        }
        provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_RPC);
        signer = new VoidSigner(vaultOwner).connect(provider);
    });

    it('should load vaults', async () => {
        const contracts: MutableRefObject<Contracts> = { current: {}};
        const resolved = new Promise((resolve) => {
            // Expect to load at least one built vault
            const destructor = loadVaultsAndStartListening(contracts, vaultOwner, signer, provider, (ev) => {
                expect(ev.vaultId).toBeDefined();
                resolve(undefined);
                destructor();
            });
        });
        await resolved;
    });
});

describe('loadSeriesAndStartListening', () => {
    const address = "0xefd67615d66e3819539021d40e155e1a6107f283";
    let provider: ethers.providers.Provider;
    let signer: ethers.Signer;
    beforeAll(() => {
        if (ALCHEMY_MAINNET_RPC === undefined) {
            throw new Error('To run this test, the ALCHEMY_MAINNET_RPC environment variable need to be set');
        }
        provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_RPC);
        signer = new VoidSigner(address).connect(provider);
    });

    it('should load vaults', async () => {
        const contracts: MutableRefObject<Contracts> = { current: {}};
        const resolved = new Promise((resolve) => {
            // Expect to load at least one built vault
            const destructor = loadSeriesAndStartListening(contracts, signer, provider, (ev) => {
                expect(ev.seriesId).toBeDefined();
                expect(ev.baseId).toBeDefined();
                expect(ev.fyToken).toBeDefined();
                resolve(undefined);
                destructor();
            }, AssetId.WEth);
        });
        await resolved;
    });
});