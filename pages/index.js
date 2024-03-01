import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import { Bar, defaults } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";

if (typeof window !== "undefined" && typeof window.Chart !== "undefined") {
  Chart.register(...[defaults, Bar]);
}

// Set the font family using defaults if it exists
if (typeof defaults !== "undefined") {
  defaults.font.family = "'Roboto', sans-serif";
}

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showExpenses, setShowExpenses] = useState(false); // State to toggle visibility of expenses

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to deposit");
      return;
    }

    if (!atm) {
      alert("ATM contract not initialized");
      return;
    }

    try {
      const tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    } catch (error) {
      console.error("Deposit error:", error);
      alert("Failed to deposit");
    }
  };

  const withdraw = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to withdraw");
      return;
    }

    if (!atm) {
      alert("ATM contract not initialized");
      return;
    }

    try {
      const tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Failed to withdraw");
    }
  };

  const toggleExpenses = () => {
    setShowExpenses(!showExpenses); // Toggle showExpenses state
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    // Sample chart data
    const chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Monthly Expenses",
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(75,192,192,0.4)",
          hoverBorderColor: "rgba(75,192,192,1)",
          data: [65, 59, 80, 81, 56, 55, 40]
        }
      ]
    };

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>

        {/* Button to toggle visibility of expenses */}
        <button onClick={toggleExpenses}>
          {showExpenses ? "Hide Expenses" : "View Expenses"}
        </button>

        {/* Expenses text */}
        {showExpenses && (
          <div style={{ marginTop: "20px" }}>
            <h2>Expenses of the Month</h2>
            <ul>
              <li>January: $65</li>
              <li>February: $59</li>
              <li>March: $80</li>
              <li>April: $81</li>
              <li>May: $56</li>
              <li>June: $55</li>
              <li>July: $40</li>
            </ul>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <Bar
            data={chartData}
            width={400}
            height={200}
            options={{
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
