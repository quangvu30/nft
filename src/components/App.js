import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Color from "../abis/TheColors.json";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    try {
      const web3 = window.web3;
      // Load account
      const accounts = await web3.eth.getAccounts();
      this.setState({ account: accounts[0] });

      const networkId = await web3.eth.net.getId();

      //const networkData = Color.networks[networkId];
      if (networkId === 4) {
        const abi = Color;
        const address = "0xF39E7414d1AEdeC855F672d84f189d949350091F";
        const contract = new web3.eth.Contract(abi, address);

        const totalSupply = await contract.methods.totalSupply().call();
        const price = await contract.methods.price().call();
        this.setState({ contract, price, address });
        this.setState({ totalSupply });
        // Load Colors
        for (var i = 1; i <= totalSupply; i++) {
          const color = await contract.methods.getHexColor(i - 1).call();
          this.setState({
            colors: [...this.state.colors, color],
          });
        }
      } else {
        window.alert("Smart contract not deployed to detected network.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  mint = () => {
    this.state.contract.methods
      .mintNextColors()
      .send({
        from: this.state.account,
        to: this.state.address,
        value: this.state.price,
      })
      .once("receipt", (receipt) => {
        this.state.contract.methods
          .getHexColor(this.state.colors.length)
          .call()
          .then((color) => {
            this.setState({
              colors: [...this.state.colors, color],
            });
          });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      contract: null,
      price: 20000000000000000,
      totalSupply: 0,
      colors: [],
    };
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Colors NFT Exhibition
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white">
                <span id="account">{this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>The Colors Token</h1>
                <div>
                  0.02 ether for each the color NFT. See on{" "}
                  <a href="https://testnets.opensea.io/0x09453c14d12603b4dd237991e8fdf52251ea0529">
                    Opensea
                  </a>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    this.mint();
                  }}
                >
                  {/* <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="e.g. #FFFFFF"
                    ref={(input) => {
                      this.color = input;
                    }}
                  /> */}
                  <input
                    type="submit"
                    className="btn btn-block btn-primary"
                    value="MINT"
                  />
                </form>
              </div>
            </main>
          </div>
          <hr />
          <h2 className="text-center">The Colors Collection</h2>
          <div className="row text-center">
            {this.state.colors.map((color, key) => {
              return (
                <div key={key} className="col-md-3 mb-3">
                  <div
                    className="token"
                    style={{ backgroundColor: color }}
                  ></div>
                  <div>{color}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
