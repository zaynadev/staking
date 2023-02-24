import React from "react";

const Navbar = ({ isConnected, connect, signer }) => {
  return (
    <div className="navBar">
      <div className="navButton">Markets</div>
      <div className="navButton">Assets</div>
      {isConnected() ? (
        <div className="connectButton">{`${signer.slice(0, 10)}...${signer.slice(-5)}`}</div>
      ) : (
        <div onClick={() => connect()} className="connectButton">
          Connect wallet
        </div>
      )}
    </div>
  );
};

export default Navbar;
