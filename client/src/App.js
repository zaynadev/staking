import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import artifacts from "./artifacts.json";
import { toString, toWei, toEther, calcDaysRemaining } from "./helpers";

const { address, abi } = artifacts;

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);

  //assets
  const [assetIds, setAssetIds] = useState([]);
  const [assets, setAssets] = useState([]);

  //staking
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [stakingLength, setStakingLength] = useState(undefined);
  const [stakingPercent, setStakingPercent] = useState(undefined);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const onLoad = async () => {
      const _provider = await new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);
      const _contract = await new ethers.Contract(address, abi, provider);
      setContract(_contract);
    };
    onLoad();
  }, []);

  const isConnected = () => signer !== undefined;

  const getSigner = async () => {
    provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  };

  const getAssetIds = async (address, signer) => {
    return await contract.connect(signer).getPositionIdsForAddress(address);
  };
  const getAssets = async (ids, signer) => {
    const result = await Promise.all(ids.map((id) => contract.connect(signer).getPositionById(id)));
    const _assets = result.map((asset) => ({
      positionId: asset.positionId,
      percentInterest: Number(asset.percentIntereset) / 100,
      daysRemaining: calcDaysRemaining(asset.unlockDate),
      etherInterest: toEther(asset.weiIntereset),
      etherStaked: toEther(asset.weiStaked),
      open: asset.open,
    }));
    return _assets;
  };

  const connectAndLoad = async () => {
    const _signer = await getSigner();
    setSigner(_signer);
    const _signerAddress = await _signer.getAddress();
    setSignerAddress(_signerAddress);
    const _assetIds = await getAssetIds(_signerAddress, _signer);
    setAssetIds(_assetIds);
    setAssets(await getAssets(_assetIds, _signer));
  };

  const openStakingModal = (_stakingLength, _stakingPercent) => {
    setShowStakeModal(true);
    setStakingLength(_stakingLength);
    setStakingPercent(_stakingPercent);
  };

  const stakeEther = async (amount) => {
    const wei = toWei(amount);
    const data = { value: wei };
    await contract.connect(signer).stackEther(stakingLength, data);
  };

  const withdraw = async (positionId) => {
    await contract.connect(signer).closePosition(positionId);
  };

  return <div className="App"></div>;
}

export default App;
