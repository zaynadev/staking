import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import artifacts from "./artifacts.json";
import Navbar from "./components/Navbar";
import StakeModal from "./components/StakeModal";
import { toWei, toEther, calcDaysRemaining } from "./helpers";
import { Coin } from "react-bootstrap-icons";
import etherlogo from "./etherlogo.png";

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
  const [amount, setAmount] = useState("0");

  const isConnected = () => signer !== undefined;

  useEffect(() => {
    const load = async () => {
      const _provider = await new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);
      const accounts = await _provider.send("eth_accounts", []);
      if (accounts.length > 0) {
        const _signer = await _provider.getSigner();
        setSigner(_signer);
        const _signerAddress = await _signer.getAddress();
        setSignerAddress(_signerAddress);
        const _contract = await new ethers.Contract(address, abi, _signer);
        setContract(_contract);
      }
    };
    load();
  }, []);

  const connectWallet = async () => {
    const _provider = await new ethers.BrowserProvider(window.ethereum);
    setProvider(_provider);
    await _provider.send("eth_requestAccounts", []);
    const _signer = await _provider.getSigner();
    setSigner(_signer);
    const _signerAddress = await _signer.getAddress();
    setSignerAddress(_signerAddress);
    const _contract = await new ethers.Contract(address, abi, _signer);
    setContract(_contract);
  };

  const getAssetIds = async () => {
    return await contract.getPositionIdsForAddress(signerAddress);
  };

  const getAssets = async (ids) => {
    const result = await Promise.all(ids.map((id) => contract.getPositionById(id)));
    let _assets = [];
    for (let i = 0; i < result.length; i++) {
      if (result[i].positionId > 0)
        _assets.push({
          positionId: result[i].positionId,
          percentInterest: Number(result[i].percentIntereset) / 100,
          daysRemaining: calcDaysRemaining(result[i].unlockDate),
          etherInterest: toEther(result[i].weiIntereset),
          etherStaked: toEther(result[i].weiStaked),
          open: result[i].open,
        });
    }

    return _assets;
  };

  const loadData = async () => {
    const _assetIds = await getAssetIds();
    setAssetIds(_assetIds);
    setAssets(await getAssets(_assetIds));
  };

  const openStakingModal = (_stakingLength, _stakingPercent) => {
    setShowStakeModal(true);
    setStakingLength(_stakingLength);
    setStakingPercent(_stakingPercent);
  };

  const stakeEther = async () => {
    const wei = toWei(amount);
    const data = { value: wei };
    const tx = await contract.stackEther(stakingLength, data);
    await tx.wait();
    await loadData();
  };

  const withdraw = async (positionId) => {
    const tx = await contract.closePosition(positionId);
    await tx.wait();
    await loadData();
  };

  useEffect(() => {
    signer && loadData();
  }, [signer]);

  return (
    <div className="App">
      <div>
        <Navbar isConnected={isConnected} connect={connectWallet} signer={signerAddress} />
      </div>

      <div className="appBody mb-5">
        <div className="marketContainer">
          <div className="subContainer">
            <span>
              <img className="logoImg" src={etherlogo} />
            </span>
            <span className="marketHeader">Ethereum Market</span>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div onClick={() => openStakingModal(1, "2%")} className="marketOption">
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>1 Minute</span>
                  <span className="optionPercent">2%</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div onClick={() => openStakingModal(2, "10%")} className="marketOption">
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>2 Minutes</span>
                  <span className="optionPercent">10%</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div onClick={() => openStakingModal(3, "15%")} className="marketOption">
                <div className="glyphContainer hoverButton">
                  <span className="glyph">
                    <Coin />
                  </span>
                </div>
                <div className="optionData">
                  <span>3 Minutes</span>
                  <span className="optionPercent">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="assetContainer">
          <div className="subContainer">
            <span className="marketHeader">Staked Assets</span>
          </div>
          <div>
            <div className="row columnHeaders">
              <div className="col-md-2">Assets</div>
              <div className="col-md-2">Percent Interest</div>
              <div className="col-md-2">Staked</div>
              <div className="col-md-2">Interest</div>
              <div className="col-md-2">Remaining Time</div>
              <div className="col-md-2"></div>
            </div>
          </div>
          <br />
          {assets.length > 0 &&
            assets.map((a, idx) => (
              <div key={idx} className="row">
                <div className="col-md-2">
                  <span>
                    <img className="stakedLogoImg" src={etherlogo} />
                  </span>
                </div>
                <div className="col-md-2">{a.percentInterest} %</div>
                <div className="col-md-2">{a.etherStaked}</div>
                <div className="col-md-2">{a.etherInterest}</div>
                <div className="col-md-2">{a.daysRemaining}</div>
                <div className="col-md-2">
                  {a.open ? (
                    <div onClick={() => withdraw(a.positionId)} className="orangeMiniButton">
                      Withdraw
                    </div>
                  ) : (
                    <span>closed</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      {showStakeModal && (
        <StakeModal
          onClose={() => setShowStakeModal(false)}
          stakingLength={stakingLength}
          stakingPercent={stakingPercent}
          amount={amount}
          setAmount={setAmount}
          stakeEther={stakeEther}
        />
      )}
    </div>
  );
}

export default App;
